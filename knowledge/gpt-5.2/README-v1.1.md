# GPT-5.2 核心能力分析 (v1.2 完整版 2026-02-16)

> OpenAI | GPT-5.2 | Knowledge-Work/Agentic-Coding王

## 📖 Overview
GPT-5.2, released by OpenAI in late 2025, advances GPT-5 with superior agentic capabilities, extended reasoning ("Thinking" mode), and SOTA performance in coding, math, multimodal, and tool use. Optimized for complex knowledge tasks and developer workflows.

Variants: GPT-5.2-Codex for coding, Pro for science/math.

## 🎯 核心強項 (Strengths)
1. **Agentic Coding & SWE**
   - SWE-bench Verified: 74.9%-80% (leader)
   - Interactive coding, bug finding, refactors
   - 55.6% SWE-bench Pro

2. **Reasoning & Math**
   - AIME 2025: 94.6% (no tools)
   - HealthBench Hard: 46.2%
   - MMMU multimodal: 84.2%

3. **Knowledge-Work**
   - GDPval-AA: 1462 (top-tier)
   - Creative Writing ELO: 1675
   - Long-horizon planning, tool use (spreadsheets)

4. **Safety & Efficiency**
   - Reduced hallucinations
   - Context compaction for large codebases

## 📊 Benchmarks
| Benchmark | GPT-5.2 Score | Rank/Comparison |
|-----------|---------------|-----------------|
| SWE-bench Verified | 80.0% | #1 |
| SWE-bench Pro | 55.6% | Leader |
| AIME 2025 | 94.6% | SOTA |
| AIME 2024 | 92.0% | Top-3 |
| MMMU | 84.2% | Multimodal |
| HealthBench Hard | 46.2% | Medical |
| LMSYS Arena | #2 | vs Claude Opus |
| GDPval-AA | 1462 | High |
| Creative Writing | 1675 Elo | #1 |

Sources: openai.com (Dec 2025), vellum.ai, LMSYS

## ⚔️ 比較表 (Comparisons)
| Feature | GPT-5.2 | Grok 4.1 | Claude Sonnet-4.5 | Gemini Vision | Auto-GPT | Einstein | Trivy |
|---------|---------|----------|-------------------|---------------|----------|----------|-------|
| Speed | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | N/A | N/A | Fast |
| Reasoning | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Agent | Enterprise | N/A |
| Coding | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Auto | Low-code | N/A |
| Math | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐ | ⭐ |
| Multimodal | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⭐ | ⭐ |
| Cost | High | Low | Medium | Low | Open | Sub | Free |
| OpenClaw Fit | High-end | Runtime | Code | Vision | Autonomy | CRM | Security |

**Summary**: Dominant in agentic coding/math; expensive but versatile for pro work.

## 🎮 使用模式與 Prompts

### 1. Thinking Mode (o1-style)
```
model=gpt-5.2-thinking
Task: "解釋這段複雜代碼的執行流程，step-by-step，標註每個變數變化"
→ 啟用 extended reasoning，適合 debug 與數學證明
```

### 2. Agentic Coding
```
"Refactor this monorepo: 
1. Analyze dependencies 
2. Create migration plan 
3. Execute with tests 
4. Verify no regression"
→ SWE-bench 80% 模式，自動 multi-file edit
```

### 3. Knowledge Work
```
"分析這份財報，提取：
- 營收趨勢 (YoY, QoQ)
- 毛利率變化
- 現金流狀況
做成表格並標註異常點"
→ GDPval-AA 1462 等級分析
```

### 4. Creative Writing
```
"寫一個懸疑短篇，3000字，要有反轉結局"
→ Creative Writing ELO 1675，頂尖敘事能力
```

### 5. Multimodal Analysis
```
"描述這張圖表的趨勢和異常點，並推測可能原因"
→ MMMU 84.2% 視覺理解能力
```

## 🔌 OpenClaw 整合 (Integration)
- **Model Access**: OpenAI API key, route via MODEL-ROUTING v2.2
- **AGENTS.md**: L2/L3 for heavy tasks, spawn for subagents
- **Tools Synergy**:
  - `exec/process` + Codex for dev workflows
  - `canvas/image` for multimodal
  - Long context for full workspace analysis
- **Usage Example**:
  ```javascript
  sessions_spawn({
    task: "分析大型代碼庫的架構債務",
    model: "gpt-5.2-thinking",
    tools: ["read", "edit", "exec"]
  })
  ```
- **Cost Note**: Use sparingly; fallback to Grok/Gemini for routine tasks

## 🎯 適用場景矩陣
| 場景 | GPT-5.2 | 替代方案 | 建議 |
|------|---------|----------|------|
| SWE-bench 任務 | ⭐⭐⭐⭐⭐ | Claude | GPT 80% 領先 |
| 數學競賽題 | ⭐⭐⭐⭐⭐ | Grok | 兩者都很強 |
| 創意寫作 | ⭐⭐⭐⭐⭐ | Claude | GPT 1675 Elo |
| 財報分析 | ⭐⭐⭐⭐⭐ | Grok | GPT 工具整合強 |
| 日常對話 | ⭐⭐⭐⭐ | Kimi | Kimi 更省錢 |
| 快速摘要 | ⭐⭐⭐ | Gemini | Gemini Flash 免費 |

## 💰 成本分析與優化
| 模型 | 輸入 | 輸出 | 相對成本 | 建議使用場景 |
|------|------|------|----------|--------------|
| GPT-5.2 | $15/M | $60/M | 10x | 高精度任務 |
| GPT-5.2-mini | $3/M | $12/M | 2x | 平衡選擇 |
| Grok 4.1 | $2/M | $5/M | 基準 | 日常推理 |
| Gemini Flash | $0.5/M | $1.5/M | 0.2x | 簡單任務 |

**成本優化策略**:
1. 先用 Gemini/Kimi 產初稿
2. GPT-5.2 只做 final review
3. 避免用 GPT-5.2 跑監控/定時任務

## ⚠️ 限制與注意事項
| 限制 | 說明 | 解決方案 |
|------|------|----------|
| 成本高 | $620/GDPval | 分層使用，非關鍵任務降級 |
| 速度較慢 | 比 Grok 慢 3-5x | 非即時任務可用 |
| API 限流 | Tier 1 限制 | 申請 Tier 2 或備援 |
| 上下文限制 | 128K | 超長文檔切分處理 |

## 📚 學習資源
| 資源 | 連結 | 類型 |
|------|------|------|
| OpenAI 官方 | https://openai.com | API 文件 |
| Vellum Benchmarks | https://vellum.ai | 第三方評測 |
| LMSYS Arena | https://chat.lmsys.org | 即時排名 |
| Reddit Discussion | https://reddit.com/r/LocalLLaMA | 社群討論 |

## 📂 Additional Content
- [strengths.md](./strengths.md) - Detailed strengths
- [comparisons.md](./comparisons.md) - Full benchmarks
- [integration.md](./integration.md) - Code snippets
- [PROMPTS.md](./PROMPTS.md) - Ready-to-use prompts

## 🔧 進階整合範例

### 與 OpenClaw 工具鏈整合
```javascript
// 完整 workflow 範例
const result = await sessions_spawn({
  task: `分析 ${repoPath} 的技術債務：
    1. 找出 3 個最複雜的函數
    2. 計算每個的 cyclomatic complexity
    3. 給出重構優先級`,
  model: "gpt-5.2-thinking",
  tools: ["read", "exec", "edit"],
  timeout: 300
});
```

### n8n + GPT-5.2 自動化
```json
{
  "workflow": {
    "trigger": "cron",
    "action": {
      "model": "gpt-5.2",
      "prompt": "分析昨日的系統日誌，找出異常模式",
      "output": "telegram"
    }
  }
}
```

**更新**: v1.2 新增 Thinking 模式、場景矩陣、成本分析、限制表格、進階整合範例。2026-02-16 by 小蔡。
