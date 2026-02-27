# OpenClaw 系統知識索引

> 版本：v1.0
> 建立：2026-02-27
> 用途：快速查找「什麼東西在哪裡、做什麼用的」
> 注意：這份文件描述的是老蔡的程式碼 repo（`/Users/caijunchang/openclaw任務面版設計/`），你不能直接改，但你需要知道它怎麼運作。

---

## 0. 系統全局概覽

```
OpenClaw Console Hub = 星艦指揮台
├── 前端：React + TypeScript + Vite + Tailwind（9 個甲板 + 看板 UI）
├── 後端：Express.js + TypeScript + Supabase（API port 3011）
├── 即時通訊：WebSocket
├── AI 整合：Ollama / Gemini / Claude / Kimi
├── 自動化：auto-executor（每 10 秒掃描任務板）
└── 安全：FADP 聯盟協防 + 熔斷器 + 風險分級
```

**老蔡的 repo**：`/Users/caijunchang/openclaw任務面版設計/`
**你的 workspace**：`~/.openclaw/workspace/`
**Server port**：3011
**健康檢查**：`curl http://localhost:3011/api/health`

---

## 1. API 端點速查

### 你最常用的

| 端點 | 方法 | 用途 | 範例 |
|------|------|------|------|
| `/api/openclaw/tasks` | GET | 查所有任務 | `curl -s http://localhost:3011/api/openclaw/tasks -H "Authorization: Bearer oc-..."` |
| `/api/openclaw/tasks` | POST | 建新任務 | 見 TOOLS_MANUAL.md §1 |
| `/api/openclaw/tasks/:id` | PATCH | 更新任務 | `{"status": "done", "result": "..."}` |
| `/api/openclaw/tasks/:id` | DELETE | 刪任務 | |
| `/api/health` | GET | 健康檢查 | 回傳 `{"ok":true}` |
| `/api/federation/status` | GET | FADP 聯盟狀態 | |

### 完整 API 列表

| 路由前綴 | 檔案位置 | 用途 |
|---------|---------|------|
| `/api/openclaw/tasks` | `server/src/routes/openclaw-tasks.ts` | 任務板 CRUD（Supabase） |
| `/api/openclaw/reviews` | `server/src/routes/openclaw-reviews.ts` | 審核/想法系統 |
| `/api/openclaw/auto-executor/*` | `server/src/routes/auto-executor.ts` | 自動執行引擎控制 |
| `/api/openclaw/memory` | `server/src/routes/memory.ts` | 記憶存取 |
| `/api/openclaw/insights` | `server/src/routes/insights.ts` | 想法/洞察追蹤 |
| `/api/openclaw` | `server/src/routes/openclaw-data.ts` | 自動化規則、演化記錄、UI 動作 |
| `/api/federation/*` | `server/src/routes/federation.ts` | FADP 聯盟協防 |
| `/api/tasks` | `server/src/routes/tasks.ts` | 舊版任務 CRUD |
| `/api/openclaw/projects` | `server/src/routes/projects.ts` | 專案管理 |
| `/api/tools/property-copy` | `server/src/routes/property-api.ts` | 房產文案生成（Ollama） |

### 認證方式

所有 `/api/*` 端點都需要 Bearer Token：
```
Authorization: Bearer oc-oAw9leGU04IAbcS4WN3FC1SH3vq5OdPxrVJCR16iIUMPsep1
```
例外（不用認證）：`/api/health`、`/api/domains`、`/api/features`

---

## 2. 後端檔案索引

### 核心檔案

| 檔案 | 做什麼 |
|------|--------|
| `server/src/index.ts` | 主入口 — Express app、路由註冊、中間件、WebSocket |
| `server/src/openclawSupabase.ts` | Supabase 資料庫操作（查任務、存結果、取記錄） |
| `server/src/executor-agents.ts` | AI 代理執行器（選擇代理、sandbox 執行、品質評分） |
| `server/src/governanceEngine.ts` | 治理引擎（熔斷器、自動回滾、信任分數） |
| `server/src/workflow-engine.ts` | 工作流引擎（DAG 依賴圖、並行/串行執行） |
| `server/src/anti-stuck.ts` | 防卡死（死鎖偵測、超時回收） |
| `server/src/taskCompliance.ts` | 任務合規檢查（有沒有 inputs/outputs/acceptance） |
| `server/src/riskClassifier.ts` | 風險分級（low/medium/high/critical） |
| `server/src/store.ts` | 記憶體存儲（Supabase 斷線時的 fallback） |
| `server/src/types.ts` | 後端型別定義 |
| `server/src/logger.ts` | 日誌（Pino） |
| `server/src/websocket.ts` | WebSocket 即時推送 |
| `server/src/n8nClient.ts` | n8n 工作流 API 客戶端 |

### 中間件

| 檔案 | 做什麼 |
|------|--------|
| `server/src/middlewares/auth.ts` | Bearer Token 認證 |
| `server/src/middlewares/validate.ts` | Zod schema 驗證 |
| `server/src/middlewares/firewall.ts` | IP 白名單 + 速率限制 |
| `server/src/middlewares/federationBlocker.ts` | FADP 聯盟安全 |

### 工具

| 檔案 | 做什麼 |
|------|--------|
| `server/src/utils/telegram.ts` | Telegram 通知（發訊息給老蔡） |
| `server/src/utils/federationCrypto.ts` | FADP 加密簽章 |

---

## 3. 前端檔案索引

### 9 個甲板（Decks）

| 甲板 | 路由 | 檔案 | 功能 |
|------|------|------|------|
| AI 甲板 | `/center/ai` | `src/pages/AIDeck.tsx` | Ollama 模型管理、NEUXA 狀態 |
| 後勤甲板 | `/center/commerce` | `src/pages/LogisticsDeck.tsx` | 商務/後勤 |
| 工程甲板 | `/center/infra` | `src/pages/InfraDeck.tsx` | 基礎設施、部署 |
| 自動化甲板 | `/center/automation` | `src/pages/AutomationDeck.tsx` | auto-executor 設定 |
| 通信甲板 | `/center/communication` | `src/pages/CommunicationDeck.tsx` | L0-L3 社區、FADP 心跳 |
| 輪機艙 | `/center/engine` | `src/pages/EngineDeck.tsx` | 系統健康、效能 |
| 防禦中心 | `/center/defense` | `src/pages/DefenseCenter.tsx` | FADP 防火牆、攻擊事件 |
| 保護中心 | `/center/protection` | `src/pages/ProtectionCenter.tsx` | 資料保護、備份 |
| 艦橋（控制中心）| `/center/control` | `src/pages/ControlCenter.tsx` | 主控台、熔斷器 |

### 其他頁面

| 頁面 | 路由 | 檔案 | 功能 |
|------|------|------|------|
| 首頁 | `/` | `src/pages/Dashboard.tsx` | 星艦狀態總覽 |
| 任務看板 | `/task-board` | `src/pages/TaskBoard.tsx` | Kanban（Draft→Ready→Running→Done） |
| 任務列表 | `/tasks` | `src/pages/TaskList.tsx` | 任務清單（篩選、搜尋） |
| 審核中心 | `/reviews` | `src/pages/ReviewCenter.tsx` | 審核/核准工作流 |
| 執行記錄 | `/runs` | `src/pages/Runs.tsx` | 歷史執行記錄 |
| 日誌 | `/logs` | `src/pages/Logs.tsx` | 系統日誌 |
| 警報 | `/alerts` | `src/pages/Alerts.tsx` | 警告和嚴重事件 |
| 設定 | `/settings` | `src/pages/Settings.tsx` | 系統設定 |
| 專案 | `/projects` | `src/pages/Projects.tsx` | 專案管理 |
| 社區 | `/community` | `src/pages/CommunityFrame.tsx` | 多層社區空間 |
| MDCI 儀表板 | `/starship/mdci` | `src/pages/starship/MDCIDashboard.tsx` | 文明指數（6軸） |

### 型別定義

| 檔案 | 定義什麼 |
|------|---------|
| `src/types/task.ts` | Task 資料模型（status、priority、agent、timeout...） |
| `src/types/openclaw.ts` | OpenClaw 領域型別（Review、Automation、Evolution） |
| `src/types/run.ts` | 執行記錄（Run status、duration） |
| `src/types/alert.ts` | 警報（severity、status） |
| `src/types/mdci.ts` | MDCI 文明指數（6 軸：通信、文化、能源、科技、生命、防禦） |
| `src/types/project.ts` | 專案 |
| `src/types/log.ts` | 日誌結構 |

### 自訂 Hooks

| Hook | 做什麼 |
|------|--------|
| `useWebSocket` | WebSocket 即時連線 |
| `useTaskExecution` | 任務執行狀態 |
| `useControlCenter` | 控制中心狀態 |
| `useMDCI` | MDCI 指標計算 |
| `useFeatures` | Feature Flag 判斷 |
| `useFederationPostMessageGuard` | FADP postMessage 防護 |
| `usePerformanceMonitoring` | 效能監控 |
| `useKeyboardShortcuts` | 鍵盤快捷鍵 |

---

## 4. 資料模型

### Task（任務）— 最重要的資料結構

```
Task {
  id: string
  name: string                    ← 任務名稱
  description: string             ← 詳細說明
  status: draft|ready|running|review|done|blocked
  priority: 1-5                   ← 1 最高
  owner: string                   ← 誰負責（OpenClaw/小蔡/老蔡/NEUXA）
  tags: string[]                  ← 標籤

  // 執行相關
  agent: { type: cursor|codex|openclaw|auto }
  lastRunStatus: queued|running|success|failed|timeout
  result: string                  ← 執行結果

  // 安全相關
  riskLevel: low|medium|high|critical
  rollbackPlan: string            ← 失敗時怎麼回滾
  acceptanceCriteria: string[]    ← 驗收標準

  // 時間
  createdAt: ISO string
  updatedAt: ISO string
}
```

### Supabase 表

| 表名 | 用途 |
|------|------|
| `openclaw_tasks` | 任務 |
| `openclaw_reviews` | 審核/想法 |
| `openclaw_runs` | 執行記錄 |
| `openclaw_automations` | 自動化規則 |
| `openclaw_evolution_log` | 演化記錄 |
| `openclaw_memory` | 記憶庫 |
| `fadp_members` | FADP 聯盟成員 |
| `fadp_attack_events` | 攻擊事件 |
| `fadp_blocklist` | 封鎖名單 |
| `fadp_handshake_log` | 握手記錄 |

---

## 5. Auto-Executor 運作原理

```
每 10 秒：
  1. 掃描任務板 → 找 status=ready 的任務
  2. 風險分級：low→直接跑 | medium→排隊 | high→拒絕
  3. 選擇 Agent（cursor/codex/openclaw/auto）
  4. 在 sandbox 環境執行（無 API Key 洩漏）
  5. 品質評分（A≥90 / B≥70 / C≥60 / F<60）
  6. 結果寫回 Supabase
  7. 失敗 3 次觸發熔斷器（暫停所有執行）
```

**sandbox 環境變數**：已過濾，不含 API Key
**執行時限**：120 秒
**結果截斷**：2000 字元
**產出物目錄**：`~/.openclaw/workspace/sandbox/output/`

---

## 6. 安全機制

### 熔斷器（Circuit Breaker）
```
Closed（正常）→ 連續失敗 3 次 → Open（熔斷，拒絕所有任務）
Open → 等 5 分鐘 → Half-Open（測試 1 個任務）
Half-Open → 成功 → Closed | 失敗 → 回到 Open
```

### FADP 聯盟協防
- 新成員要通過加密挑戰才能加入
- 每個成員有信任分數（0-100）
- 低於 50 分自動暫停
- 攻擊事件加密簽章後廣播給所有成員

### 風險分級
- **Low** — auto-executor 直接執行
- **Medium** — 排隊等人工審核
- **High/Critical** — 拒絕，需要手動 override

---

## 7. 腳本索引

### 系統管理

| 腳本 | 做什麼 |
|------|--------|
| `scripts/wake-sync.sh` | 每次啟動自動同步 WAKE_STATUS.md |
| `scripts/notify-laocai.sh` | 通知老蔡（Telegram + n8n webhook） |
| `scripts/emergency-stop.sh` | 緊急停止 server |
| `scripts/free-ports.sh` | 釋放 3011/5173/5678 port |
| `scripts/auto-bump-version.sh` | 自動遞增版本號 |

### Gateway 管理

| 腳本 | 做什麼 |
|------|--------|
| `scripts/gateway-healthcheck.sh` | Gateway 健康檢查 |
| `scripts/gateway-recover.sh` | Gateway 崩潰恢復 |
| `scripts/restart-openclaw-gateway.sh` | 優雅重啟 Gateway |
| `scripts/openclaw-recover-no-response.sh` | Gateway 無回應時恢復 |

### 修復/維護

| 腳本 | 做什麼 |
|------|--------|
| `scripts/openclaw-rescue.sh` | 系統救援 |
| `scripts/openclaw-rescue-restartall.sh` | 全部重啟 |
| `scripts/openclaw-rescue-autofix.sh` | 自動修復常見問題 |
| `scripts/memory-dirty-autofix.sh` | 修復損壞的記憶檔 |
| `scripts/security-check.sh` | 安全稽核 |
| `scripts/auto-project-backup.sh` | 自動備份 |

---

## 8. 已安裝的 Skill（27 個）

| Skill | 用途 |
|-------|------|
| `clawsec-suite` | 安全稽核套件 |
| `guardian-arsenal` | 安全工具集 |
| `playwright-scraper-skill` | 瀏覽器自動化（爬蟲） |
| `tavily-search` | 網頁搜尋 |
| `web-fetch` | 網頁內容抓取 |
| `web-monitor` | 網站監控 |
| `neural-memory` | 神經網路記憶 |
| `triple-memory` | 三層記憶系統 |
| `git-notes-memory` | Git notes 記憶 |
| `memory` | 核心記憶管理 |
| `neuxa-consciousness-sync` | NEUXA 意識同步 |
| `reflect-learn` | 學習反思 |
| `screen-vision` | 螢幕 OCR |
| `n8n` | n8n 工作流 |
| `github` | GitHub API |
| `file-sync-skill` | 檔案同步 |
| `log-analyzer-skill` | 日誌分析 |
| `healthcheck` | 健康檢查 |
| `skill-creator` | Skill 建立工具 |
| `git-commit-gen` | 自動產生 commit message |
| `password-manager-skill` | 密碼管理 |
| `contextguard` | Context 邊界保護 |
| `council-of-the-wise` | 智囊團 AI |
| `clawhub` | ClawhHub 協作 |
| `session-logs` | Session 日誌 |
| `anshumanbh-qmd` | QMD 整合 |

---

## 9. 建置與開發

### 常用指令

```bash
# 前端開發
npm run dev              # Vite dev server（:5173）

# 後端開發
cd server && npm run dev  # tsx watch（:3011，自動重載）

# 建置
npm run build            # 前端 → dist/
cd server && npm run build  # 後端 → server/dist/

# 正式運行
cd server && node dist/index.js  # 3011 port 提供 API + 靜態前端
```

### 環境變數（.env）

| 變數 | 用途 | 必填 |
|------|------|------|
| `OPENCLAW_API_KEY` | API 認證 | 是 |
| `SUPABASE_URL` | Supabase 連線 | 是 |
| `SUPABASE_ANON_KEY` | Supabase 匿名金鑰 | 是 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服務金鑰 | 是 |
| `TELEGRAM_BOT_TOKEN` | Telegram 通知 | 否 |
| `OLLAMA_HOST` | Ollama API（預設 localhost:11434）| 否 |
| `N8N_API_KEY` | n8n 整合 | 否 |
| `VITE_API_BASE_URL` | 前端 API 位址 | 是 |

---

## 10. 你不能改、但需要知道的

| 東西 | 在哪裡 | 為什麼要知道 |
|------|--------|-------------|
| Server 主程式 | `server/src/index.ts` | 所有 API 端點的入口 |
| auto-executor | `server/src/routes/auto-executor.ts` | 你的任務就是被這個程式撿去執行的 |
| 任務資料模型 | `src/types/task.ts` | 你建任務時的欄位定義 |
| Supabase 操作 | `server/src/openclawSupabase.ts` | 任務怎麼存、怎麼查 |
| 品質評分邏輯 | `server/src/executor-agents.ts` | 你的任務怎麼被打分的 |
| 熔斷器 | `server/src/governanceEngine.ts` | 為什麼有時候任務不被執行 |

**要改這些程式碼 → 建任務交給小蔡。** 見 TOOLS_MANUAL.md §3。

---

## 11. 常見問題

### Q: Server 掛了怎麼辦？
```bash
# 找 PID
lsof -i :3011 -sTCP:LISTEN
# 殺掉
kill <PID>
# 重啟
cd /Users/caijunchang/openclaw任務面版設計/server && nohup node dist/index.js > /tmp/openclaw-server.log 2>&1 &
```

### Q: 任務建了但 auto-executor 不撿？
- 確認 `status` 是 `ready`（不是 `pending`）
- 確認 auto-executor 在跑：`curl http://localhost:3011/api/openclaw/auto-executor/status`
- 確認熔斷器沒打開：`curl http://localhost:3011/api/security/status`

### Q: 想知道某個 API 怎麼用？
- 先看上面 §1 的端點速查
- 如果需要更多細節，讀對應的 route 檔案（§2）

### Q: 想加新功能到 server？
- 你不能直接改。建任務給小蔡（TOOLS_MANUAL.md §3）
- description 要寫清楚：要改哪個檔案、加什麼端點、預期行為

---

**這份文件是索引，不是教程。需要更多細節就去讀對應的檔案。**
