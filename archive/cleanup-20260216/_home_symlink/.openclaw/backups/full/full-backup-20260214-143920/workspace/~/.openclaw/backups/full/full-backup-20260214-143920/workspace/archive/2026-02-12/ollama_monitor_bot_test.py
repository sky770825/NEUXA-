import telegram
from telegram.ext import Updater, MessageHandler, CommandHandler
from telegram import Update
from telegram.ext import filters
import requests
import json
import subprocess
import time
import threading
import logging

# 配置日誌
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    level=logging.INFO)
logger = logging.getLogger(__name__)

# --- 配置參數 ---
TELEGRAM_BOT_TOKEN_BACKUP = 'FAKE_TELEGRAM_BOT_TOKEN' # 假的 Bot Token，用於測試
OLLAMA_API_URL = 'http://localhost:11434/api/chat'
OLLAMA_MODEL_BACKUP = 'llama3.2'
MAIN_GATEWAY_URL = 'http://127.0.0.1:9999/status' # 故意設置一個不存在的網址來模擬主 Gateway 離線

# 全局狀態
main_gateway_online = True
last_restart_attempt = 0
RESTART_COOLDOWN = 60 # 重啟嘗試的冷卻時間 (秒)

# --- 輔助函數 ---
def ping_main_gateway():
    """定期檢查主 OpenClaw Gateway 的狀態"""
    global main_gateway_online
    try:
        response = requests.get(MAIN_GATEWAY_URL, timeout=5)
        if response.status_code == 200:
            if not main_gateway_online:
                logger.info("主 OpenClaw Gateway 已恢復連線！")
            main_gateway_online = True
        else:
            if main_gateway_online:
                logger.warning(f"主 OpenClaw Gateway 離線或返回錯誤狀態碼: {response.status_code}")
            main_gateway_online = False
    except requests.exceptions.ConnectionError:
        if main_gateway_online:
            logger.warning("無法連接到主 OpenClaw Gateway。")
        main_gateway_online = False
    except requests.exceptions.Timeout:
        if main_gateway_online:
            logger.warning("連接主 OpenClaw Gateway 超時。")
        main_gateway_online = False
    except Exception as e:
        logger.error(f"檢查主 Gateway 狀態時發生未知錯誤: {e}")
        main_gateway_online = False

def ollama_chat(message_text):
    """使用 Ollama 模型生成回應"""
    try:
        data = {
            "model": OLLAMA_MODEL_BACKUP,
            "messages": [{"role": "user", "content": message_text}],
            "stream": False # 不使用串流
        }
        headers = {'Content-Type': 'application/json'}
        response = requests.post(OLLAMA_API_URL, headers=headers, data=json.dumps(data), timeout=60)
        response.raise_for_status() # 檢查 HTTP 錯誤
        result = response.json()
        return result['message']['content']
    except requests.exceptions.RequestException as e:
        logger.error(f"Ollama API 請求失敗: {e}")
        return f"抱歉，Ollama 服務目前無法回應: {e}"
    except Exception as e:
        logger.error(f"Ollama 回應處理失敗: {e}")
        return f"抱歉，處理 Ollama 回應時發生錯誤: {e}"

def restart_main_gateway():
    """嘗試重啟主 OpenClaw Gateway 進程"""
    global last_restart_attempt
    current_time = time.time()
    if current_time - last_restart_attempt < RESTART_COOLDOWN:
        logger.info(f"正在冷卻中，{RESTART_COOLDOWN - (current_time - last_restart_attempt):.0f}秒後才能再次嘗試重啟主 Gateway。")
        return "正在冷卻中，請稍後再試著重啟主機器人。"

    logger.info("嘗試重啟主 OpenClaw Gateway...")
    try:
        # 使用 subprocess 執行 shell 命令
        # 注意：這個命令需要在你的環境中可以執行 openclaw
        process = subprocess.Popen(["openclaw", "gateway", "start"],
                                   stdout=subprocess.PIPE,
                                   stderr=subprocess.PIPE,
                                   text=True)
        # 不等待完成，直接返回，因為 Gateway 啟動需要時間
        last_restart_attempt = current_time
        logger.info("已發送重啟主 OpenClaw Gateway 的命令。")
        return "已發送重啟主 OpenClaw Gateway 的命令。請稍候，主機器人可能需要一些時間才能上線。"
    except FileNotFoundError:
        logger.error("錯誤：找不到 'openclaw' 命令。請確保 OpenClaw CLI 已正確安裝並在 PATH 中。")
        return "錯誤：找不到 'openclaw' 命令，無法重啟主機器人。請檢查 OpenClaw CLI 安裝。"
    except Exception as e:
        logger.error(f"執行重啟命令時發生錯誤: {e}")
        return f"嘗試重啟主機器人時發生未知錯誤: {e}"

# --- Telegram Bot 處理函數 ---
def start(update, context):
    """處理 /start 命令"""
    update.message.reply_text(f'哈囉，老蔡！我是你的備用機器人，使用 {OLLAMA_MODEL_BACKUP} 模型。')
    update.message.reply_text('當主機器人離線時，我會接手回答你的問題，並嘗試重啟主機器人。')

def handle_message(update, context):
    """處理所有文字訊息"""
    global main_gateway_online
    user_message = update.message.text
    chat_id = update.message.chat_id

    # 備用 Bot 只有在主 Gateway 離線時才回應
    if not main_gateway_online:
        logger.info(f"主 Gateway 離線，備用 Bot 接管。收到訊息: {user_message}")
        update.message.reply_text(f"主機器人目前離線，我正在使用 Ollama ({OLLAMA_MODEL_BACKUP}) 回應。")
        
        # 嘗試重啟主 Gateway
        restart_msg = restart_main_gateway()
        update.message.reply_text(restart_msg)

        # 使用 Ollama 回應
        ollama_response = ollama_chat(user_message)
        update.message.reply_text(ollama_response)
    else:
        # 主 Gateway 在線時，備用 Bot 保持沉默，讓主 Bot 處理
        logger.info(f"主 Gateway 在線，備用 Bot 保持沉默。收到訊息 (未回應): {user_message}")

# --- 主函數 ---
def main():
    """啟動 Bot"""
    updater = Updater(TELEGRAM_BOT_TOKEN_BACKUP)
    dispatcher = updater.dispatcher

    # 註冊命令和訊息處理器
    dispatcher.add_handler(CommandHandler("start", start))
    dispatcher.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    # 定期檢查主 Gateway 狀態的背景執行緒
    def run_ping_scheduler():
        while True:
            ping_main_gateway()
            time.sleep(30) # 每 30 秒檢查一次

    ping_thread = threading.Thread(target=run_ping_scheduler, daemon=True)
    ping_thread.start()

    # 啟動 Bot
    logger.info("備用 Ollama Bot 開始運行...")
    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()
