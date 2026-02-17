# OpenClaw 技能優化建議報告 - 2026年2月11日

## 總結
本次檢查了 `workspace/skills/` 目錄下的所有技能。總體而言，大部分技能都保持良好狀態且功能重要。主要建議集中在優化現有瀏覽器相關技能的整合，並移除已廢棄的技能。

## 建議清單

### 🚀 建議優化或關注的技能 (3項)
1.  **`agent-browser`**：
    *   **建議：** 持續關注官方更新，並評估是否可以將 `fast-browser-use` 的部分性能優勢（如速度、低記憶體佔用）整合到 `agent-browser` 中，以保持其作為主要瀏覽器自動化工具的領先地位。
2.  **`playwright-scraper-skill`**：
    *   **建議：** 評估其在「反機器人保護」方面的獨特優勢是否仍優於其他瀏覽器技能。如果其反機器人能力確實關鍵，則應保留並優化；否則，考慮簡化其功能或在功能上與 `agent-browser` 合併，避免過多功能重疊。
3.  **`fast-browser-use`** (未在 `available_skills` 列表中，但功能強大)：
    *   **建議：** 如果老蔡有對極致瀏覽器性能或反偵測的特定需求，則建議保留並在特定場景下優先使用。若需求不明顯，考慮與 `agent-browser` 進行功能整合或移除，以減少冗餘。

### ✅ 建議保留並定期更新的技能 (17項)
這些技能對 OpenClaw 的運作和功能擴展至關重要，應定期檢查更新。
*   `agent-router` (優化模型選擇與Token使用)
*   `clawflows` (多技能自動化工作流程)
*   `clawhub` (技能管理)
*   `coding-agent` (軟體工程任務輔助)
*   `cursor-agent` (深度軟體工程任務)
*   `desktop-control` (高級桌面自動化)
*   `elite-longterm-memory` (終極AI記憶系統，已取代Trello)
*   `github` (GitHub互動)
*   `healthcheck` (系統安全與健康檢查)
*   `nano-banana-pro` (圖像生成與編輯)
*   `notion-skill` (Notion頁面與資料庫互動)
*   `openclaw-taskboard` (OpenClaw任務管理中心)
*   `screen-vision` (macOS本地OCR與螢幕理解)
*   `session-logs` (會話日誌分析)
*   `skill-auditor-pro` (技能安全掃描，強烈建議保留並與`clawhub`整合)
*   `skill-creator` (AgentSkills創建與更新)
*   `tavily-search` (即時網路搜尋)
*   `thought-to-excalidraw` (PM想法視覺化)

### 🗑️ 建議移除或歸檔的技能 (1項)
1.  **`trello`**：
    *   **原因：** 根據 `MEMORY.md` 紀錄，Trello 技能已被 `elite-longterm-memory` 取代，不再使用。
    *   **建議：** 建議從 `workspace/skills/` 中移除此技能，以保持技能庫的精簡和避免混淆。

這份報告將有助於老蔡優化 OpenClaw 環境，提升效率和安全性。
