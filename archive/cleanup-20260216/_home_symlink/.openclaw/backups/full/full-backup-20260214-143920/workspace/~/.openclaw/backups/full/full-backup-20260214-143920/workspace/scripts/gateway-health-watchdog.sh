#!/bin/bash
set -e
# Gateway 健康監控與自動修復腳本
# 當 health API 連續 2 次失敗時自動執行修復

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${OPENCLAW_LOGS:-$HOME/.openclaw/logs}/gateway-health.log"
STATE_FILE="${OPENCLAW_STATE:-$HOME/.openclaw}/gateway-health-state.json"
MAX_FAILURES=2

mkdir -p "$(dirname "$LOG_FILE")"

# 初始化狀態檔
if [ ! -f "$STATE_FILE" ]; then
    echo '{"consecutiveFailures":0,"lastCheck":null,"lastRecovery":null}' > "$STATE_FILE"
fi

# 記錄日誌
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# 檢查 Gateway health API
check_health() {
    local response
    response=$(curl -s --max-time 5 http://localhost:3000/health 2>&1)
    local exit_code=$?
    
    if [ $exit_code -eq 0 ] && echo "$response" | grep -q '"status".*"ok"\|"healthy"'; then
        echo "healthy"
    else
        echo "unhealthy"
    fi
}

# 執行修復
run_recovery() {
    log "🔧 開始執行 gateway-recover.sh..."
    
    if [ -x "$SCRIPT_DIR/gateway-recover.sh" ]; then
        bash "$SCRIPT_DIR/gateway-recover.sh" >> "$LOG_FILE" 2>&1
        local exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
            log "✅ Gateway 修復成功"
            # 更新狀態
            tmp=$(mktemp)
            jq --arg time "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
               '.consecutiveFailures = 0 | .lastRecovery = $time' "$STATE_FILE" > "$tmp" && mv "$tmp" "$STATE_FILE"
            return 0
        else
            log "❌ Gateway 修復失敗 (exit: $exit_code)"
            return 1
        fi
    else
        log "❌ gateway-recover.sh 不存在或無執行權限"
        return 1
    fi
}

# 升級給 Codex
escalate_to_codex() {
    log "🚨 觸發升級：連續修復失敗，升級給 Codex 處理"
    
    # 發送通知（透過 Telegram 或其他方式）
    if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
            --data-urlencode "text=🚨 [ESCALATE_Codex] Gateway 健康檢查連續失敗，自動修復無效，需要 Codex 介入處理。詳見日誌: $LOG_FILE" > /dev/null 2>&1
    fi
}

# 主邏輯
main() {
    log "🔍 開始 Gateway 健康檢查..."
    
    health_status=$(check_health)
    current_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    # 讀取目前失敗次數
    failures=$(jq -r '.consecutiveFailures // 0' "$STATE_FILE")
    
    if [ "$health_status" = "healthy" ]; then
        log "✅ Gateway 健康狀態良好"
        # 重置失敗計數
        if [ "$failures" -gt 0 ]; then
            tmp=$(mktemp)
            jq --arg time "$current_time" \
               '.consecutiveFailures = 0 | .lastCheck = $time' "$STATE_FILE" > "$tmp" && mv "$tmp" "$STATE_FILE"
            log "📝 重置失敗計數"
        fi
        exit 0
    fi
    
    # 健康檢查失敗
    failures=$((failures + 1))
    log "⚠️ Gateway 健康檢查失敗 (連續 $failures 次)"
    
    # 更新狀態
    tmp=$(mktemp)
    jq --arg time "$current_time" \
       --argjson count "$failures" \
       '.consecutiveFailures = $count | .lastCheck = $time' "$STATE_FILE" > "$tmp" && mv "$tmp" "$STATE_FILE"
    
    # 檢查是否達到修復閾值
    if [ "$failures" -ge "$MAX_FAILURES" ]; then
        log "🚨 達到修復閾值 (連續 $MAX_FAILURES 次失敗)，執行自動修復..."
        
        if run_recovery; then
            # 修復成功，再檢查一次
            sleep 5
            health_status=$(check_health)
            
            if [ "$health_status" = "healthy" ]; then
                log "✅ 修復後驗證成功"
                exit 0
            else
                log "❌ 修復後仍不健康，觸發升級"
                escalate_to_codex
                exit 1
            fi
        else
            # 修復失敗，直接升級
            escalate_to_codex
            exit 1
        fi
    fi
    
    exit 0
}

main