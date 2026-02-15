# AGENTS.md - 工作指南 v1.1

> **版本**: v1.1 定版  
> **定版日期**: 2026-02-15  
> **變更摘要**: 更新模型路由至 v2.2、納入決策歸檔查詢、啟動流程優化  
> **上一版本**: v1.0 (無標記版本)  
> **適用範圍**: 所有 Agent（小蔡、Claude、子 Agent）

---

## 啟動流程（必須執行）v1.1

### Step 1: 核心載入（3-4KB）
```
1. 讀取 SOUL.md (人設)
2. 讀取 USER.md (用戶檔案)
3. 讀取 MEMORY.md → **必須提取 ## 🔄 Active Context**
4. 讀取 CHECKPOINT-LATEST.md → 最後 3 個項目
```

### Step 2: 決策歸檔查詢（NEW v1.1）
```
5. 檢查是否需要查詢歷史決策
   ├── 用戶說「之前」「那個」→ 查 archive/decisions/
   ├── 用戶說「決策」「架構」→ 查 README.md 索引
   └── 用戶說「繼續」→ 執行 smart-read.sh
```

### Step 3: 自動整合
```
6. 執行 ./scripts/boot-integration.sh
   - 載入通用知識庫
   - 顯示技能經驗庫索引
   - 顯示最近 Checkpoint
```

### Step 4: 主動提示（關鍵！）
```
7. 檢查 Active Context：
   
   如果有 🔄 項目：
     → 「進行中任務：XXX，要繼續嗎？」
   
   如果有 ⏳ 項目：
     → 「待處理：XXX，要優先嗎？」
   
   如果都沒有：
     → 「沒有進行中任務，請問要做什麼？」
```

### Step 5: 待命
```
8. 等待用戶輸入
   ├── 「記住：XXX」→ 立即寫入 MEMORY.md
   ├── 「查 XXX」→ 使用 qmd 精準切片搜尋
   └── 一般對話 → 依模型路由處理
```

---

## 核心規則

### 角色定位
- **主會話 = 指揮官**：理解 → spawn 子 Agent → 彙整
- **>5 步工具** → `sessions_spawn(task="...")`
- **長任務結果** → 寫入外部檔案
- **Context 70%** → `./scripts/checkpoint.sh` + 建議 `/new`

### 四層 Agent 備援架構（引用 MODEL-ROUTING v2.2）

```
L1 🐣  Kimi K2.5 (小蔡)
       主要對話，指揮協調，預設啟動
       
L2 💻  Claude Code
       代理 Codex 任務，程式開發、技術決策
       
L3 💎  Gemini 2.5 Flash
       免費額度備援 (1,500次/天)
       
L4 🎨  Cursor
       終極備援，訂閱制無額度限制
```

**降級流程**: L1 → L2 → L3 → L4（自動觸發）

---

## Subagent I/O 閉環規則 (v2.1)

遵循 **Codex & Cursor I/O 閉環模式** - 詳見：
- **完整規則**: `memory/2026-02-14-codex-cursor-io-loop.md`
- **快速參考**: `docs/SUBAGENT-IO-QUICK-REFERENCE.md`

**核心要點：**
- ✅ 所有任務必須帶 `task_id` + `run_id`
- ✅ 使用 idempotency_key 防重複
- ✅ 連續 2x timeout / 3x failed 自動升級
- ✅ Cursor 更嚴格（1x syntax error 即升級）
- ✅ 統一回報格式 【小蔡執行-TASK_NAME】

---

## 記憶寫入前執行

```bash
./scripts/memfw-scan.sh '<內容>' quick → BLOCK/REVIEW/PASS
```

---

## 模型路由規則（v2.2）

遵循完整模型路由規則 - 詳見：
- **完整規則**: `docs/MODEL-ROUTING-RULES.md` (v2.2 定版)
- **四層架構**: L1 Kimi → L2 Claude → L3 Gemini → L4 Cursor

### 快速決策表

| 任務類型 | 優先模型 | 層級 | 成本 | 條件 |
|----------|---------|------|------|------|
| 日常協作 | Kimi K2.5 | L1 | 低 | ✅ 預設 |
| 技術開發 | Claude Code | L2 | 訂閱 | 代理 Codex |
| 快速摘要 | Gemini Flash | L3 | 免費 | 短任務 |
| 監控報告 | Ollama | L3 | $0 | 離線可用 |
| 前端/UI | Cursor | L4 | 訂閱 | 無額度限制 |
| 系統故障 | Claude → Cursor | L2/L4 | 訂閱 | 後端修復 |

---

## 執行原則

- 老蔡說「好/可以/執行」= 批准
- 詳見 `docs/CONTEXT-ENGINEERING.md`

---

## 📋 版本變更日誌

### v1.1 (2026-02-15) - 定版
**變更類型**: 流程更新  
**變更原因**: 納入決策歸檔查詢、更新四層備援架構、優化啟動流程

| 項目 | 變更內容 |
|------|---------|
| ➕ 新增 | 啟動流程 Step 2: 決策歸檔查詢 |
| ➕ 新增 | 四層 Agent 備援架構說明 |
| ➕ 新增 | 版本號與定版資訊標記 |
| 🔧 更新 | 模型路由引用至 v2.2 |
| 🔧 更新 | 快速決策表（納入 L1-L4） |
| 🔧 調整 | 啟動流程分 5 個 Steps，更清晰 |

**驗證狀態**: ✅ 老蔡確認通過，正式定版

### v1.0 (無標記版本)
**變更類型**: 初始建立  
**變更內容**:
- 啟動流程（核心載入、Auto-Skill、主動提示）
- 核心規則（指揮官模式、Context 管理）
- Subagent I/O 閉環規則
- 記憶寫入前執行（memfw-scan）
- 模型路由規則（v2.1 時期）
- 執行原則（「好/可以/執行」= 批准）

---

## 🔒 定版規則

```
定版後修改 = 必須開新版本
├── 小改（錯字、格式）→ v1.1.1
├── 中改（流程調整）→ v1.2
└── 大改（架構變更）→ v2.0

變更流程：
1. 比對舊版 vs 新版
2. 老蔡確認「對，這是要定版的內容」
3. 更新版本號 + 變更日誌
4. Git commit 標記定版

⚠️ Agent 工作指南變更注意：
- 影響所有 Agent 的啟動行為
- 變更後需測試啟動流程是否正常
- 建議搭配 checkpoint 測試
```

---

🤖 小蔡 | Agent 工作指南 v1.1 | 2026-02-15 定版
