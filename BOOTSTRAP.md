# BOOTSTRAP.md — 啟動鉤子與全域上下文

> **版本**: v1.0
> **最後更新**: 2026-02-19
> **用途**: 確保新 Session 能自動識別最新 Context，解決啟動時的記憶斷層。

## 🚀 核心上下文 (Active Context)

- **目前階段**: 項目拼到 100% 收尾階段。
- **L1 狀態**: 領域分類簡化完成，根目錄清理完成。
- **L3 狀態**: Bootstrap 機制建立中。
- **L4 狀態**: Telegram Bot 自癒整合中。

## 📍 關鍵路徑 (Key Paths)

- **任務板**: http://localhost:3011
- **n8n**: http://localhost:5678
- **最新 Handoff**: `memory/HANDOFF-LATEST.md`
- **最新 Memory**: `MEMORY.md`

## 🧠 當前目標 (Target)

1. 完成 L1/L3/L4 的 100% 收尾。
2. 確保自動化自癒腳本進 crontab。
3. 確保 n8n 通知穩定。

## 📜 啟動流程增強

每次 Session 開始，應優先讀取：
1. `BOOTSTRAP.md` (本檔案)
2. `AGENTS.md`
3. `MEMORY.md`
4. `memory/HANDOFF-LATEST.md`
