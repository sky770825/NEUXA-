module.exports = {
  apps: [
    // @ollama168bot - Ollama 聊天 + 維護助手
    {
      name: 'xiaocai-bot',
      script: './scripts/xiaocai-maintenance-bot.js',
      cwd: '/Users/caijunchang/.openclaw/workspace/skill-github-automation',
      env: {
        XIAOCAI_BOT_TOKEN: '8225683676:AAGpSInSbU0P54Xycv6OB0Gr3QoTcl9HuH0',
        ADMIN_CHAT_ID: '5819565005'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '5s'
    }
  ]
};
