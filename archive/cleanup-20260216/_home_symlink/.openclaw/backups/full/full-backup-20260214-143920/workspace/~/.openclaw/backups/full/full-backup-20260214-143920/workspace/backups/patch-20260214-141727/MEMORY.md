# MEMORY.md

## 老蔡事業
| 事業 | 內容 |
|------|------|
| 住商不動產 | 桃園楊梅區，房屋買賣 |
| 飲料店 | 自有店鋪 |
| 普特斯防霾紗窗 | 店長 |

## 最近摘要（2026-02-14 更新）

### 🎯 本日完成（2/14）
- **Codex I/O 閉環模式 v2.1** — 小蔡指揮、子Agent直發、省 30-40% Token、標準模板建立
- **商業模式盤點** — 三事業交叉銷售機會、漏斗阻塞點分析、14個任務化方案
- **成本優化方案** — 模型路由、Skills精簡、Context管理，預估省 35-50%
- **Non-Sandbox修復** — 3個Cron Job改用bash腳本，自動生成6張新任務卡
- **標準閉環SOP v1.0** — 專案路徑、任務卡欄位、模型政策正式生效

### 📋 本週進度
- 系統全盤點 + 5個新skills安裝
- QMD知識庫索引上線
- Context Watchdog + Idle Watchdog部署
- Auto-mode V2啟用（閒置10分鐘自動執行）

### 🔧 待修復
- Morning Brief v2 — 模型不允許錯誤（需改用ollama/qwen3:8b）

## 速查表

| 主題 | 位置 |
|------|------|
| ⭐ **Codex/Cursor I/O 閉環 v1.1** | `memory/2026-02-14-codex-cursor-io-loop.md` |
| 💰 **成本優化方案** | `memory/2026-02-14-cost-optimization.md` |
| 💼 **商業模式盤點** | `memory/2026-02-14-business-model.md` |
| 📊 **商業模式分析** | `memory/2026-02-14-business-model-analysis.md` |
| 🎯 **標準閉環SOP v1.0** | 見下方SOP區 |
| 🔧 **OpenClaw修復摘要** | `memory/2026-02-14-openclaw-recovery.md` |
| ⚠️ **穩定性核心記憶** | `memory/2026-02-14-core-stability.md` |
| 🚫 **避免踩雷** | `memory/2026-02-14-core-cautions.md` |
| 🔄 **系統總覽** | `docs/SYSTEM-OVERVIEW.md` |
| 🧠 **Multi-Agent策略** | `docs/MULTI-AGENT-STRATEGY.md` |

## 標準閉環SOP v1.0

### 目標閉環
```
策略 → 專案 → 製作 → 摘要 → 巡檢
   ↑                          ↓
   └──── Ollama整理/寫回 ──────┘
```

### 硬性規則

| 項目 | 規則 |
|------|------|
| **專案路徑** | `projects/<project>/<module>/` 唯一真相 |
| **任務卡必填** | projectPath、deliverables、runCommands、acceptanceCriteria、rollbackPlan、riskLevel、assignedAgent、modelPolicy |
| **Codex/Cursor交付** | README.md、.env.example、docs/runbook.md、src/、驗收結果 |
| **Ollama工作** | nextSteps、summary + evidenceLinks、docs/updates/YYYY-MM-DD.md |
| **小蔡巡檢** | 一般進度寫回任務卡（❌不發TG）、Milestone/阻塞才發TG |
| **防重複** | 同一projectPath僅1個running、task_id+run_id+idempotencyKey |
| **模型政策** | ollama/*預設、codex/cursor允許、kimi/opus需高風險+老蔡確認 |

### Agent分工
| 任務類型 | 推薦Agent |
|---------|-----------|
| 前端/UI微調 | Cursor |
| 後端/API修復 | Codex/Cursor |
| 搜尋/查詢/分析 | Codex |
| 系統故障排查 | Codex |
| Refactor重構 | Cursor |
| 監控報告 | Ollama/Gemini Free |

## 成本政策

| 模型 | 成本 | 使用條件 |
|------|------|----------|
| **Ollama本地** | **$0** | 監控、簡單任務、背景學習 ✅預設 |
| **Gemini Free** | **$0** | 定時報告、摘要 |
| **小蔡（Kimi）** | 低 | 指揮、協調、複雜決策 |
| **Cursor/Codex** | 訂閱制 | 程式開發（充分利用） |
| **Grok/Opus** | 高 | P0+老蔡確認才用 |

**預估月省**: $36 (60%) — 透過模型路由+Skills精簡+Context管理

## 記憶系統

| 類型 | 位置 | 說明 |
|------|------|------|
| **核心檔案** | `MEMORY.md` | 本檔案，總覽+速查 |
| **每日記憶** | `memory/2026-02-*.md` | 13個檔案 |
| **Vector DB** | `~/.openclaw/memory/main.sqlite` | 自動召回用 |
| **檢查點** | `memory/checkpoints/` | Context摘要 |
| **備份** | `~/.openclaw/backups/` | 每日/基線/增量 |

### 檢索指令
```bash
# 記憶召回
node scripts/memory_recall.js "查詢內容"

# QMD搜尋
qmd search "關鍵字" --collection docs|memory

# Git-Notes
python3 skills/git-notes-memory/memory.py search "關鍵字"
```

## 快捷指令

| 指令 | 功能 |
|------|------|
| `/menu` | 顯示中控台選單 |
| `/status` | 快速系統狀態 |
| `/autopilot` | 切換自動模式 |
| `/codex <任務>` | 呼叫Codex Agent |
| `/cursor <任務>` | 呼叫Cursor Agent |
| `/new` | 開新對話（重置context） |

---
🐣 小蔡 | 最後更新: 2026-02-14 13:40
