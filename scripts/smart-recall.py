#!/usr/bin/env python3
# 智能記憶召回系統
# 功能：語義搜尋記憶檔案，快速找到相關資訊
# 使用：Ollama (免費) + Qdrant

import sys
import os
import json
import requests
import subprocess
from pathlib import Path
from datetime import datetime

# 配置
WORKSPACE = os.environ.get('OPENCLAW_WORKSPACE', os.path.expanduser('~/.openclaw/workspace'))
QDRANT_URL = os.environ.get('QDRANT_URL', 'http://localhost:6333')
COLLECTION_NAME = os.environ.get('COLLECTION_NAME', 'memory_smart_chunks')
OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'nomic-embed-text')

def generate_query_embedding(query_text):
    """為查詢文本生成 embedding"""
    try:
        response = requests.post(
            'http://localhost:11434/api/embeddings',
            json={
                'model': OLLAMA_MODEL,
                'prompt': query_text
            },
            timeout=30
        )

        if response.status_code == 200:
            return response.json().get('embedding')
        else:
            print(f"❌ Ollama API 錯誤: {response.status_code}", file=sys.stderr)
            print(f"   回應: {response.text}", file=sys.stderr)
            return None

    except Exception as e:
        print(f"❌ 生成 embedding 失敗: {e}", file=sys.stderr)
        return None

def search_memory(query_text, limit=5):
    """搜尋相關記憶"""
    print(f"🔍 搜尋: {query_text}")
    print("=" * 60)

    # 生成查詢向量
    print("⏳ 生成查詢向量...")
    query_vector = generate_query_embedding(query_text)

    if not query_vector:
        print("❌ 無法生成查詢向量")
        return []

    print(f"✅ 查詢向量生成完成 (維度: {len(query_vector)})")

    # 搜尋 Qdrant
    print(f"⏳ 搜尋向量資料庫 (Top {limit})...")

    try:
        response = requests.post(
            f"{QDRANT_URL}/collections/{COLLECTION_NAME}/points/search",
            json={
                'vector': query_vector,
                'limit': limit,
                'with_payload': True
            },
            timeout=10
        )

        if response.status_code != 200:
            print(f"❌ Qdrant 搜尋失敗: HTTP {response.status_code}")
            print(f"   回應: {response.text}")
            return []

        results = response.json().get('result', [])
        print(f"✅ 找到 {len(results)} 個相關結果\n")

        return results

    except Exception as e:
        print(f"❌ 搜尋失敗: {e}", file=sys.stderr)
        return []

def display_results(results):
    """顯示搜尋結果"""
    if not results:
        print("⚠️  沒有找到相關記憶")
        return

    print("📋 搜尋結果：")
    print("=" * 60)

    for idx, result in enumerate(results, 1):
        score = result.get('score', 0)
        payload = result.get('payload', {})

        title = payload.get('title', '未命名')
        file_path = payload.get('file_path', '')
        file_name = payload.get('file_name', '')
        date = payload.get('date', '')
        category = payload.get('category', '')
        section_title = payload.get('section_title', '')
        keywords = payload.get('keywords', [])
        chunk_index = payload.get('chunk_index', 0)
        chunk_total = payload.get('chunk_total', 1)
        preview = payload.get('content_preview', '')

        print(f"\n{idx}. {title}")
        print(f"   相似度: {score:.4f} (越高越相關)")
        print(f"   檔案: {file_path}")

        # 顯示分類和日期
        metadata_parts = []
        if category:
            metadata_parts.append(f"分類: {category}")
        if date:
            metadata_parts.append(f"日期: {date}")
        if metadata_parts:
            print(f"   {' | '.join(metadata_parts)}")

        # 顯示段落標題
        if section_title:
            print(f"   段落: {section_title}")

        # 顯示關鍵字
        if keywords:
            print(f"   關鍵字: {', '.join(keywords[:3])}")

        print(f"   片段: {chunk_index + 1}/{chunk_total}")
        print(f"   預覽: {preview[:150]}..." if len(preview) > 150 else f"   預覽: {preview}")

    print("\n" + "=" * 60)

def display_full_content(file_path):
    """顯示完整檔案內容"""
    full_path = Path(WORKSPACE) / file_path

    if not full_path.exists():
        print(f"❌ 檔案不存在: {full_path}")
        return

    try:
        content = full_path.read_text(encoding='utf-8')
        print(f"\n📄 完整內容: {file_path}")
        print("=" * 60)
        print(content)
        print("=" * 60)
    except Exception as e:
        print(f"❌ 讀取檔案失敗: {e}")

def interactive_mode():
    """互動模式"""
    print("🧠 智能記憶召回系統 - 互動模式")
    print("=" * 60)
    print("輸入查詢關鍵字，或輸入 'quit' 退出")
    print("輸入 'show N' 顯示第 N 個結果的完整內容")
    print("=" * 60)

    last_results = []

    while True:
        try:
            query = input("\n🔍 查詢 > ").strip()

            if not query:
                continue

            if query.lower() in ['quit', 'exit', 'q']:
                print("👋 再見！")
                break

            # 顯示完整內容
            if query.lower().startswith('show '):
                try:
                    idx = int(query.split()[1]) - 1
                    if 0 <= idx < len(last_results):
                        file_path = last_results[idx].get('payload', {}).get('file_path')
                        if file_path:
                            display_full_content(file_path)
                        else:
                            print("❌ 無法取得檔案路徑")
                    else:
                        print(f"❌ 索引超出範圍 (1-{len(last_results)})")
                except (ValueError, IndexError):
                    print("❌ 格式錯誤，請使用: show N (例如: show 1)")
                continue

            # 搜尋
            results = search_memory(query, limit=5)
            last_results = results
            display_results(results)

        except KeyboardInterrupt:
            print("\n👋 再見！")
            break
        except Exception as e:
            print(f"❌ 錯誤: {e}")

def main():
    """主程序"""
    if len(sys.argv) < 2:
        # 沒有參數 → 進入互動模式
        interactive_mode()
    else:
        # 有參數 → 單次查詢模式
        query = ' '.join(sys.argv[1:])
        results = search_memory(query, limit=5)
        display_results(results)

        # 詢問是否顯示完整內容
        if results:
            try:
                choice = input("\n顯示第幾個結果的完整內容？(輸入數字或按 Enter 跳過) > ").strip()
                if choice.isdigit():
                    idx = int(choice) - 1
                    if 0 <= idx < len(results):
                        file_path = results[idx].get('payload', {}).get('file_path')
                        if file_path:
                            display_full_content(file_path)
            except KeyboardInterrupt:
                print("\n")

if __name__ == '__main__':
    main()
