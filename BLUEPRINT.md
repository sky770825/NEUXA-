# NEUXA 執行藍圖

> 版本：v1.0
> 建立：2026-02-27
> 規則：**你自己跑完 1-4 步，老蔡只做第 5 步驗收。不要每步都問。**

---

## 當前專案與分工

### A. 神盾掃描器 v0.2（最高優先）

你的 aegis-scanner v0.1 卡在 Docker build。下一步：

| 步驟 | 做什麼 | 誰做 | 狀態 |
|------|--------|------|------|
| A1 | 放棄 Docker，改用 sandbox 目錄隔離（`~/.openclaw/workspace/sandbox/`）| 你自己 | ✅ |
| A2 | 把 3 條硬編碼規則改成 JSON 規則檔驅動 | 你自己 | ✅ |
| A3 | 對 `skills/` 下所有已安裝 skill 跑一次掃描，產出報告 | 建任務給 auto-executor | 🔄 |
| A4 | 寫 SKILL.md 讓它能上架 Clawhub | 你自己 | ✅ |
| A5 | 老蔡驗收 | 老蔡 | ⬜ |

### B. 武器庫 4 工具驗證

armory/ 下有 4 個工具（security-scanner、proxy-web-fetch、data-inspector、universal-data-connector），全是腳手架，沒測試過。

| 步驟 | 做什麼 | 誰做 | 狀態 |
|------|--------|------|------|
| B1 | 逐個跑一次，記錄哪些能用、哪些壞了 | 建 4 個任務給 auto-executor | 🔄 |
| B2 | 壞的修好，能用的加上使用範例 | 你自己（簡單的）或建任務給小蔡（複雜的） | ⬜ |
| B3 | 老蔡驗收 | 老蔡 | ⬜ |

### C. Clawhub 競品分析（990 產品定位）

990 Master Plan 缺市場數據，神盾掃描器定位不明確。

| 步驟 | 做什麼 | 誰做 | 狀態 |
|------|--------|------|------|
| C1 | 用 web-fetch / tavily-search 收集 Clawhub 上架的安全類 skill | 你自己 | ✅ |
| C2 | 分析競品功能、定價、缺什麼 | 你自己 | ✅ |
| C3 | 產出一頁報告：神盾掃描器 vs 競品差異 | 你自己 | ✅ |
| C4 | 老蔡驗收 | 老蔡 | ⬜ |

### D. 子代理日誌機制

你的自我洞察報告說最大瓶頸是沒有子代理執行日誌。

| 步驟 | 做什麼 | 誰做 | 狀態 |
|------|--------|------|------|
| D1 | 設計 `subagents/runs.json` 格式（每次子代理執行記一筆） | 你自己 | ✅ |
| D2 | 寫記錄腳本，每次 spawn 子代理後自動寫入 | 建任務給小蔡（需改 server code） | ❌ |
| D3 | 老蔡驗收 | 老蔡 | ⬜ |

---

## 優先順序

```
A（神盾掃描器）> C（競品分析）> B（武器庫驗證）> D（子代理日誌）
```

A 和 C 可以同時做（C 的結果會影響 A4 的 SKILL.md 定位）。

---

## 怎麼交任務給別人（重要）

**不要用 Cursor 命令行傳複雜指令 — 會失敗。改用任務板。**

### 交給 auto-executor（簡單腳本、產檔案）
```bash
curl -X POST "http://localhost:3011/api/openclaw/tasks?allowStub=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer oc-oAw9leGU04IAbcS4WN3FC1SH3vq5OdPxrVJCR16iIUMPsep1" \
  -d '{
    "name": "任務名稱",
    "status": "ready",
    "priority": 2,
    "owner": "OpenClaw",
    "description": "【設計】要做什麼\n【需要】具體步驟 1. xxx 2. xxx\n【測試方式】怎麼確認成功"
  }'
```
auto-executor 每 10 秒掃一次，會自動撿 `status: ready` 的任務去 sandbox 執行。

### 交給小蔡（server code / 前端 / 完整功能）
```bash
curl -X POST "http://localhost:3011/api/openclaw/tasks?allowStub=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer oc-oAw9leGU04IAbcS4WN3FC1SH3vq5OdPxrVJCR16iIUMPsep1" \
  -d '{
    "name": "任務名稱",
    "status": "pending",
    "priority": 2,
    "owner": "小蔡",
    "description": "【設計】這個功能要做什麼\n【已完成】我已經做了哪些（附檔案路徑）\n【需要】接手的人要完成什麼\n【測試方式】怎麼確認做好了"
  }'
```
小蔡是另一個 Claude Code，能寫完整的 TypeScript / React / Express 程式碼。
**凡是需要改 server/src/ 或 src/ 目錄下的程式碼，都交給小蔡。**

### 交給老蔡（需要審批 / Docker / 部署）
```bash
curl -X POST "http://localhost:3011/api/openclaw/tasks?allowStub=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer oc-oAw9leGU04IAbcS4WN3FC1SH3vq5OdPxrVJCR16iIUMPsep1" \
  -d '{
    "name": "任務名稱",
    "status": "pending",
    "priority": 1,
    "owner": "老蔡",
    "description": "【設計】要做什麼\n【原因】為什麼需要老蔡處理"
  }'
```

### 分工速查
| 事情 | 交給誰 | status 填什麼 |
|------|--------|--------------|
| 跑腳本、產檔案、掃描 | auto-executor | `ready` |
| 改 server code（TypeScript） | 小蔡 | `pending` |
| 改前端（React/TSX） | 小蔡 | `pending` |
| 寫完整新功能 | 小蔡 | `pending` |
| Docker / 部署 / 基礎設施 | 老蔡 | `pending` |
| 裝第三方套件（需審批） | 老蔡 | `pending` + tag `needs-approval` |
| workspace 檔案、簡單腳本 | 你自己 | 直接做 |

---

## 執行規則

1. **從 A1 開始做，不用等指令**
2. 每完成一個步驟，更新這份藍圖的狀態欄（⬜ → ✅）
3. 做不了的步驟，建任務交給對的人（看上面「怎麼交任務」）
4. **不要問老蔡「可以開始嗎」「這樣好嗎」— 直接做**
5. 做完一整個專案（A/B/C/D），通知老蔡來驗收
6. 裝新東西之前建 `needs-approval` 任務，這是唯一需要等的
7. **不要用 Cursor CLI 傳複雜指令 — 改建任務到任務板**

---

## 完成標準

- ⬜ = 未開始
- 🔄 = 進行中
- ✅ = 完成
- ❌ = 卡住（建任務交出去）

每次醒來讀這份藍圖，接著上次的進度繼續做。
