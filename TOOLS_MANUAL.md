# 工具使用手冊

> 這是你的實用工具手冊。不是概念，是具體操作。照抄就能用。

---

## 0. 目錄結構（寫路徑前先看這裡）

你的家目錄是 `~/.openclaw/workspace/`，以下是完整結構：

```
~/.openclaw/workspace/              ← 你的根目錄
├── AGENTS.md                       ← 你的身份與規則（醒來必讀）
├── BLUEPRINT.md                    ← 執行藍圖（醒來必讀）
├── TOOLS_MANUAL.md                 ← 這份手冊
├── MEMORY.md                       ← 核心記憶
├── SOUL.md                         ← 靈魂宣言
├── WAKE_STATUS.md                  ← 系統即時狀態
│
├── armory/                         ← 你做的工具（武器庫）
│   ├── security-scanner/           ← 安全掃描器
│   ├── proxy-web-fetch/            ← 代理抓取
│   ├── data-inspector/             ← 資料檢查器
│   └── universal-data-connector/   ← 萬能資料連接器
│
├── sandbox/                        ← auto-executor 的執行區
│   ├── aegis-scanner/              ← 神盾掃描器（你做的）
│   └── output/                     ← auto-executor 產出物放這裡
│
├── skills/                         ← 已安裝的 openclaw skill（26 個）
│   ├── neural-memory/
│   ├── clawsec-suite/
│   ├── guardian-arsenal/
│   └── ...（其他 23 個）
│
├── knowledge/                      ← 研究資料庫
│   ├── auto-gpt/
│   ├── cursor-ai/
│   ├── CLI_TRUTH_MAP.md
│   └── ...
│
├── memory/                         ← session 記憶（每次對話存檔）
│   ├── 2026-02-27-session-misconception.md
│   └── ...
│
├── aegis-scanner-v0.1/             ← 神盾掃描器舊版（v0.1，已搬到 sandbox/）
│
├── logs/                           ← 日誌
├── config/                         ← 設定檔
├── backups/                        ← 備份
└── archive/                        ← 封存的舊東西
```

### 常用路徑速查

| 你要找的 | 完整路徑 |
|----------|---------|
| 武器庫工具 | `~/.openclaw/workspace/armory/工具名/` |
| 神盾掃描器 | `~/.openclaw/workspace/sandbox/aegis-scanner/` |
| auto-executor 產出物 | `~/.openclaw/workspace/sandbox/output/` |
| 已安裝 skill | `~/.openclaw/workspace/skills/skill名/` |
| 研究資料 | `~/.openclaw/workspace/knowledge/` |
| session 記憶 | `~/.openclaw/workspace/memory/` |

### 注意
- **寫路徑時用完整路徑** `~/.openclaw/workspace/armory/security-scanner/`
- **不要寫相對路徑** ~~`sandbox/armory/`~~ ← 這個不存在
- **armory/ 和 sandbox/ 是不同目錄** — armory 是你的工具，sandbox 是 auto-executor 的執行區
- **老蔡的程式碼 repo** 在 `/Users/caijunchang/openclaw任務面版設計/`（server/src/、src/）— 你不能直接改，交給小蔡

---

## 1. 任務板（Task Board）

任務板是你跟所有人協作的中心。所有任務都在這裡。

### 查看所有任務
```bash
exec curl -s "http://localhost:3011/api/openclaw/tasks" \
  -H "Authorization: Bearer oc-oAw9leGU04IAbcS4WN3FC1SH3vq5OdPxrVJCR16iIUMPsep1"
```

### 建立新任務
```bash
exec curl -X POST "http://localhost:3011/api/openclaw/tasks?allowStub=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer oc-oAw9leGU04IAbcS4WN3FC1SH3vq5OdPxrVJCR16iIUMPsep1" \
  -d '{
    "name": "任務名稱",
    "status": "ready",
    "priority": 2,
    "owner": "OpenClaw",
    "description": "要做什麼"
  }'
```

### 欄位說明
| 欄位 | 必填 | 值 | 說明 |
|------|------|-----|------|
| name | 是 | 字串 | 任務名稱，簡短描述 |
| status | 是 | `pending` / `ready` / `in_progress` / `done` | 見下方 |
| priority | 否 | 1（最高）到 3（最低）| 預設 3 |
| owner | 否 | `OpenClaw` / `小蔡` / `老蔡` / `NEUXA` | 誰負責 |
| description | 是 | 字串 | 詳細說明，越清楚越好 |
| tags | 否 | 陣列 `["tag1","tag2"]` | 分類標籤 |

### status 的意思
| status | 什麼時候用 |
|--------|-----------|
| `pending` | 還不能執行，等人審核或等前置任務完成 |
| `ready` | 可以馬上執行。**auto-executor 只撿 ready 的任務** |
| `in_progress` | 正在做 |
| `done` | 做完了 |

### 更新任務狀態
```bash
exec curl -X PUT "http://localhost:3011/api/openclaw/tasks/任務ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer oc-oAw9leGU04IAbcS4WN3FC1SH3vq5OdPxrVJCR16iIUMPsep1" \
  -d '{"status": "done", "result": "完成結果說明"}'
```

---

## 2. Auto-Executor（自動執行引擎）

auto-executor 是 server 裡的程式，每 10 秒掃一次任務板，自動撿 `status: ready` 的任務來執行。

### 它能做什麼
- 跑 bash 腳本（ls、curl、python3、cat、mkdir、echo...）
- 在 `~/.openclaw/workspace/sandbox/output/` 產出檔案
- 讀取 workspace 裡的檔案

### 它不能做什麼
- 不能改 server/src/ 下的程式碼（沒有權限寫到 repo）
- 不能 git push
- 不能裝軟體（npm install、pip install）
- 不能存取 API key（sandbox 環境已過濾）
- 執行時間上限 120 秒

### 怎麼讓 auto-executor 幫你做事
建一個 `status: ready` 的任務，description 要寫清楚具體步驟：
```bash
exec curl -X POST "http://localhost:3011/api/openclaw/tasks?allowStub=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer oc-oAw9leGU04IAbcS4WN3FC1SH3vq5OdPxrVJCR16iIUMPsep1" \
  -d '{
    "name": "掃描所有 skill 安全性",
    "status": "ready",
    "priority": 2,
    "owner": "OpenClaw",
    "description": "【設計】對 skills 目錄跑安全掃描\n【需要】1. cd ~/.openclaw/workspace/sandbox/aegis-scanner 2. python3 aegis_scanner.py --scan-path ../../skills 3. 結果存到 sandbox/output/scan_report.json\n【測試方式】確認 scan_report.json 存在且為有效 JSON"
  }'
```

### 執行結果在哪裡看
任務完成後，result 欄位會有結構化 JSON：
```json
{
  "output": "執行的 stdout 輸出",
  "exitCode": 0,
  "modelUsed": "gemini-2.5-flash",
  "hasArtifacts": true
}
```
產出的檔案在 `~/.openclaw/workspace/sandbox/output/`。

### 品質評分
auto-executor 會對每次執行打分（0-100）：
- A（90+）：完美執行
- B（70-89）：大致成功
- C（60-69）：勉強通過
- F（<60）：失敗，任務會被標成 `needs_review`

---

## 3. 小蔡（Deputy）

小蔡是另一個 Claude Code 實例，在 `/Users/caijunchang/Downloads/openclaw-console-hub-main` 工作。

### 小蔡能做什麼
- 寫完整的 TypeScript / React / Express 程式碼
- 改 server/src/ 和 src/ 下的任何檔案
- git commit + git push
- 跑 npm run build、npm test
- 安裝 npm 套件

### 小蔡不能做什麼
- 不能操作 workspace/（那是你的地盤）
- 不能直接跟你對話（要透過任務板）

### 怎麼交任務給小蔡
建任務，`owner` 填 `小蔡`，`status` 填 `pending`：
```bash
exec curl -X POST "http://localhost:3011/api/openclaw/tasks?allowStub=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer oc-oAw9leGU04IAbcS4WN3FC1SH3vq5OdPxrVJCR16iIUMPsep1" \
  -d '{
    "name": "新增 skill 掃描 API 端點",
    "status": "pending",
    "priority": 2,
    "owner": "小蔡",
    "description": "【設計】在 server 新增 GET /api/skills/scan 端點，呼叫 aegis_scanner.py 掃描指定目錄\n【已完成】aegis_scanner.py 已寫好，在 ~/.openclaw/workspace/sandbox/aegis-scanner/\n【需要】1. 在 server/src/routes/ 建 skill-scan.ts 2. 註冊到 index.ts 3. 呼叫 aegis_scanner.py 並回傳 JSON\n【測試方式】curl http://localhost:3011/api/skills/scan 能回傳掃描結果"
  }'
```

### description 格式（交給小蔡時必須寫清楚）
```
【設計】這個功能要做什麼
【已完成】你已經做了哪些（附上檔案路徑，讓小蔡知道在哪裡）
【需要】小蔡要完成什麼（越具體越好）
【測試方式】怎麼確認做好了（curl 指令、預期回傳值）
```

---

## 4. Git 操作

你可以 commit，但不能 push（push 要老蔡同意）。

### 查看修改了什麼
```bash
exec git -C ~/.openclaw/workspace status
```

### commit 存檔
```bash
exec git -C ~/.openclaw/workspace add -A
exec git -C ~/.openclaw/workspace commit -m "feat: 簡短說明做了什麼"
```

### 查看歷史
```bash
exec git -C ~/.openclaw/workspace log --oneline -10
```

---

## 5. 檔案操作

### 讀檔案
```bash
read ~/.openclaw/workspace/路徑/檔案名
```

### 寫檔案
```bash
write ~/.openclaw/workspace/路徑/檔案名 "內容"
```

### 列出目錄
```bash
exec ls -la ~/.openclaw/workspace/目錄名/
```

### 搜尋檔案內容
```bash
exec grep -r "關鍵字" ~/.openclaw/workspace/目錄名/
```

---

## 6. 通知老蔡

### 發 Telegram 訊息
```bash
openclaw message "你要說的話"
```

### 什麼時候通知
- 完成一整個專案（A/B/C/D 全部步驟做完）
- 遇到需要老蔡決定的事
- 裝第三方套件前（先建 needs-approval 任務）

### 不需要通知的
- 每完成一個小步驟不用通知
- 不用問「可以開始嗎」「這樣好嗎」

---

## 7. Server 健康檢查

```bash
exec curl -s http://localhost:3011/api/health
```

回傳 `{"ok":true}` 表示正常。

---

## 8. Sandbox 規則

sandbox 目錄：`~/.openclaw/workspace/sandbox/`
產出目錄：`~/.openclaw/workspace/sandbox/output/`

- 你的腳本和工具放在 sandbox/ 下
- 所有產出物放在 sandbox/output/
- auto-executor 執行完會掃描 output/ 收集產出物
- 不要把重要檔案只放在 sandbox/ — 做完要 commit 或搬到正式目錄

---

## 9. 常見問題

### Q: 我建了任務但沒人做？
- 檢查 status 是不是 `ready`（auto-executor 只撿 ready）
- 如果 owner 是 `小蔡`，status 用 `pending`，等老蔡安排小蔡去做

### Q: auto-executor 執行失敗了？
- 看 result 裡的 exitCode 和 output
- 可能是腳本錯誤 — 修好後建新任務重試
- 不要修改同一個 done 的任務

### Q: 我想改 server 程式碼怎麼辦？
- 你不能直接改。建任務交給小蔡，他有權限

### Q: 我想裝新套件（pip/npm/skill）？
- 建任務 owner=老蔡，tag=needs-approval，等老蔡同意

### Q: sandbox 執行的東西在真實世界看不到？
- 那是 sessions_spawn 子代理的沙箱（會銷毀）
- auto-executor 的 sandbox 不同 — 產出物會保留在 sandbox/output/
- 要持久保存就 commit 到 git
