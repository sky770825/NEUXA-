"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rest_1 = require("@octokit/rest");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
class GitHubIssueClassifier {
    constructor() {
        this.ollamaUrl = 'http://localhost:11434';
        this.owner = '';
        this.repo = '';
        this.telegramBotToken = '';
        this.telegramChatId = '';
        this.loadConfig();
        this.octokit = new rest_1.Octokit({
            auth: process.env.GITHUB_TOKEN
        });
    }
    loadConfig() {
        // GitHub repo config
        const repoUrl = process.env.GITHUB_REPO || '';
        if (repoUrl) {
            const match = repoUrl.match(/github\.com\/(\w+)\/(\w+)/);
            if (match) {
                this.owner = match[1];
                this.repo = match[2];
            }
        }
        // Telegram config
        const configPath = path.join(os.homedir(), '.openclaw', 'config', 'telegram.env');
        if (fs.existsSync(configPath)) {
            const content = fs.readFileSync(configPath, 'utf-8');
            const lines = content.split('\n');
            for (const line of lines) {
                if (line.includes('BOT_TOKEN=')) {
                    this.telegramBotToken = line.split('=')[1]?.trim() || '';
                }
                if (line.includes('CHAT_ID=')) {
                    this.telegramChatId = line.split('=')[1]?.trim() || '';
                }
            }
        }
    }
    async fetchRecentIssues(limit = 10) {
        try {
            const { data } = await this.octokit.rest.issues.listForRepo({
                owner: this.owner,
                repo: this.repo,
                state: 'open',
                per_page: limit,
                sort: 'created',
                direction: 'desc'
            });
            return data.map(issue => ({
                number: issue.number,
                title: issue.title,
                body: issue.body || '',
                labels: issue.labels.map(l => typeof l === 'string' ? l : l.name || ''),
                user: issue.user?.login || 'unknown',
                created_at: issue.created_at
            }));
        }
        catch (error) {
            console.error('Error fetching issues:', error);
            throw error;
        }
    }
    async classifyIssue(issue) {
        const prompt = `你是一個專業的 GitHub Issue 分類專家。請分析以下 Issue 並提供分類建議。

Issue #${issue.number}: ${issue.title}

內容：
${issue.body?.substring(0, 2000) || '無內容'}

請用 JSON 格式回應：
{
  "category": "bug|feature|docs|question|performance|security",
  "priority": "low|medium|high|critical",
  "suggestedLabels": ["label1", "label2"],
  "summary": "用一句話總結這個 Issue"
}

只回應 JSON，不要其他文字。`;
        try {
            const response = await axios_1.default.post(`${this.ollamaUrl}/api/generate`, {
                model: 'qwen3:8b',
                prompt: prompt,
                stream: false
            }, { timeout: 60000 });
            const result = JSON.parse(response.data.response);
            return {
                category: result.category || 'question',
                priority: result.priority || 'medium',
                suggestedLabels: result.suggestedLabels || [],
                summary: result.summary || issue.title
            };
        }
        catch (error) {
            console.error('Error classifying issue:', error);
            return {
                category: 'question',
                priority: 'medium',
                suggestedLabels: ['needs-triage'],
                summary: issue.title
            };
        }
    }
    async applyLabels(issueNumber, labels) {
        try {
            // Filter out labels that don't exist
            const { data: existingLabels } = await this.octokit.rest.issues.listLabelsForRepo({
                owner: this.owner,
                repo: this.repo
            });
            const validLabels = labels.filter(label => existingLabels.some(l => l.name.toLowerCase() === label.toLowerCase()));
            if (validLabels.length > 0) {
                await this.octokit.rest.issues.addLabels({
                    owner: this.owner,
                    repo: this.repo,
                    issue_number: issueNumber,
                    labels: validLabels
                });
                console.log(`✅ Applied labels to #${issueNumber}: ${validLabels.join(', ')}`);
            }
            else {
                console.log(`⚠️ No valid labels to apply for #${issueNumber}`);
            }
        }
        catch (error) {
            console.error(`Error applying labels to #${issueNumber}:`, error);
        }
    }
    async sendNotification(issue, classification) {
        if (!this.telegramBotToken) {
            console.log('Telegram not configured, skipping notification');
            return;
        }
        const message = `🐙 *GitHub Issue 自動分類*

*#${issue.number}*: ${issue.title}
*分類*: ${classification.category}
*優先級*: ${classification.priority}
*建議標籤*: ${classification.suggestedLabels.join(', ') || '無'}

*摘要*: ${classification.summary}

[查看 Issue](https://github.com/${this.owner}/${this.repo}/issues/${issue.number})`;
        try {
            await axios_1.default.post(`https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`, {
                chat_id: this.telegramChatId,
                text: message,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
            console.log('✅ Telegram notification sent');
        }
        catch (error) {
            console.error('Error sending Telegram notification:', error);
        }
    }
    async run() {
        console.log('🚀 GitHub Issue Classifier started...');
        console.log(`📁 Repository: ${this.owner}/${this.repo}`);
        try {
            const issues = await this.fetchRecentIssues(5);
            console.log(`📋 Found ${issues.length} recent issues`);
            for (const issue of issues) {
                console.log(`\n🔍 Processing Issue #${issue.number}: ${issue.title}`);
                // Skip if already has labels
                if (issue.labels.length > 0) {
                    console.log(`  ⏭️ Already has labels: ${issue.labels.join(', ')}`);
                    continue;
                }
                // Classify
                const classification = await this.classifyIssue(issue);
                console.log(`  📊 Category: ${classification.category}`);
                console.log(`  🔥 Priority: ${classification.priority}`);
                console.log(`  🏷️ Suggested labels: ${classification.suggestedLabels.join(', ')}`);
                // Apply labels
                await this.applyLabels(issue.number, classification.suggestedLabels);
                // Send notification
                await this.sendNotification(issue, classification);
            }
            console.log('\n✅ Classification completed!');
        }
        catch (error) {
            console.error('❌ Error in classification process:', error);
            throw error;
        }
    }
}
// CLI entry
async function main() {
    const classifier = new GitHubIssueClassifier();
    await classifier.run();
}
main().catch(console.error);
//# sourceMappingURL=index.js.map