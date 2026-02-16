#!/bin/bash
# 自動檢查 context 並執行 checkpoint

# 取得目前 context 使用率（透過 openclaw status）
CONTEXT_USAGE=$(openclaw status 2>/dev/null | grep -o "Context: [0-9]*k/[0-9]*k" | grep -o "[0-9]*k" | head -1 | tr -d 'k')
TOTAL=$(openclaw status 2>/dev/null | grep -o "Context: [0-9]*k/[0-9]*k" | grep -o "/[0-9]*k" | tr -d '/k')

if [ -n "$CONTEXT_USAGE" ] && [ -n "$TOTAL" ]; then
  PERCENTAGE=$((CONTEXT_USAGE * 100 / TOTAL))
  
  if [ $PERCENTAGE -ge 80 ]; then
    echo "[$(date '+%H:%M')] Context 使用率 ${PERCENTAGE}%，自動執行 checkpoint..."
    ~/.openclaw/workspace/scripts/checkpoint.sh create "auto-context-$(date '+%m%d-%H%M')" "自動存檔"
  elif [ $PERCENTAGE -ge 70 ]; then
    echo "[$(date '+%H:%M')] ⚠️ Context 使用率 ${PERCENTAGE}%，建議存檔或開新對話"
  fi
fi
