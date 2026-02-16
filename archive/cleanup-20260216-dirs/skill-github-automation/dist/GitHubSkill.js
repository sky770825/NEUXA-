"use strict";
/**
 * GitHub Automation Skill - 主類別
 *
 * 使用設計模式：
 * - Builder Pattern: 複雜設定物件的建構
 * - Strategy Pattern: 不同操作使用不同策略
 * - Factory Pattern: Skill 實例建立
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubAutomationSkill = exports.SkillConfigBuilder = void 0;
exports.createGitHubSkill = createGitHubSkill;
const strategies_1 = require("./strategies");
const GitHubClient_1 = require("./api/GitHubClient");
// ============================================================================
// Builder Pattern - Skill 配置建構器
// ============================================================================
class SkillConfigBuilder {
    config = {};
    setGitHubToken(token) {
        this.config.githubToken = token;
        return this;
    }
    setDefaultOwner(owner) {
        this.config.defaultOwner = owner;
        return this;
    }
    setDefaultRepo(repo) {
        this.config.defaultRepo = repo;
        return this;
    }
    enableFeature(feature) {
        if (!this.config.features) {
            this.config.features = {};
        }
        this.config.features[feature] = true;
        return this;
    }
    enableAllFeatures() {
        this.config.features = {
            issueAutomation: true,
            prAssistant: true,
            releaseAutomation: true,
            repoAnalytics: true,
        };
        return this;
    }
    build() {
        if (!this.config.githubToken) {
            throw new Error('GitHub token is required');
        }
        return this.config;
    }
}
exports.SkillConfigBuilder = SkillConfigBuilder;
// ============================================================================
// Main Skill Class
// ============================================================================
class GitHubAutomationSkill {
    name = 'github-automation';
    version = '1.0.0';
    config;
    strategies;
    client;
    constructor() {
        this.strategies = new strategies_1.StrategyRegistry();
    }
    // ========================================================================
    // SkillPlugin Interface Implementation
    // ========================================================================
    async initialize(config) {
        this.config = config;
        this.client = new GitHubClient_1.GitHubClient(config.githubToken);
        // 驗證 token 有效性
        try {
            await this.client.getRateLimit();
        }
        catch (error) {
            throw new Error('Invalid GitHub token or API error');
        }
    }
    async execute(input) {
        if (!this.config || !this.client) {
            return {
                success: false,
                error: {
                    code: 'NOT_INITIALIZED',
                    message: 'Skill not initialized. Call initialize() first.',
                },
            };
        }
        const startTime = Date.now();
        // 取得執行策略
        const strategy = this.strategies.get(input.action);
        if (!strategy) {
            return {
                success: false,
                error: {
                    code: 'UNKNOWN_ACTION',
                    message: `Unknown action: ${input.action}. Available: ${this.strategies.list().join(', ')}`,
                },
            };
        }
        // 驗證參數
        const validation = strategy.validate(input.params);
        if (!validation.valid) {
            return {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: validation.errors?.join(', ') || 'Invalid parameters',
                },
            };
        }
        // 檢查功能是否啟用
        if (!this.isFeatureEnabled(input.action)) {
            return {
                success: false,
                error: {
                    code: 'FEATURE_DISABLED',
                    message: `Feature for action ${input.action} is not enabled`,
                },
            };
        }
        // 建立執行上下文
        const context = {
            githubToken: this.config.githubToken,
            owner: input.params.owner || this.config.defaultOwner || '',
            repo: input.params.repo || this.config.defaultRepo || '',
            params: input.params,
        };
        // 驗證 owner/repo
        if (!context.owner || !context.repo) {
            return {
                success: false,
                error: {
                    code: 'MISSING_REPOSITORY',
                    message: 'Owner and repo are required (provide in params or config)',
                },
            };
        }
        // 執行策略
        try {
            const result = await strategy.execute(context);
            return {
                success: result.success,
                data: result.data,
                error: result.error ? { code: 'EXECUTION_ERROR', message: result.error } : undefined,
                metadata: {
                    executedAt: new Date().toISOString(),
                    duration: Date.now() - startTime,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'EXECUTION_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error',
                },
                metadata: {
                    executedAt: new Date().toISOString(),
                    duration: Date.now() - startTime,
                },
            };
        }
    }
    getSchema() {
        return {
            name: this.name,
            version: this.version,
            actions: [
                {
                    name: 'issue.create',
                    description: 'Create a new GitHub issue',
                    parameters: [
                        { name: 'title', type: 'string', required: true, description: 'Issue title' },
                        { name: 'body', type: 'string', required: false, description: 'Issue body' },
                        { name: 'labels', type: 'string[]', required: false, description: 'Labels to apply' },
                        { name: 'assignees', type: 'string[]', required: false, description: 'Users to assign' },
                        { name: 'owner', type: 'string', required: false, description: 'Repository owner (or use default)' },
                        { name: 'repo', type: 'string', required: false, description: 'Repository name (or use default)' },
                    ],
                    returns: { type: 'object', description: 'Created issue details' },
                },
                {
                    name: 'issue.list',
                    description: 'List GitHub issues',
                    parameters: [
                        { name: 'state', type: 'string', required: false, description: 'Filter by state: open, closed, all' },
                        { name: 'labels', type: 'string[]', required: false, description: 'Filter by labels' },
                        { name: 'assignee', type: 'string', required: false, description: 'Filter by assignee' },
                        { name: 'owner', type: 'string', required: false, description: 'Repository owner' },
                        { name: 'repo', type: 'string', required: false, description: 'Repository name' },
                    ],
                    returns: { type: 'object', description: 'List of issues' },
                },
                {
                    name: 'issue.update',
                    description: 'Update an existing GitHub issue',
                    parameters: [
                        { name: 'issueNumber', type: 'number', required: true, description: 'Issue number to update' },
                        { name: 'title', type: 'string', required: false, description: 'New title' },
                        { name: 'body', type: 'string', required: false, description: 'New body' },
                        { name: 'state', type: 'string', required: false, description: 'open or closed' },
                        { name: 'owner', type: 'string', required: false, description: 'Repository owner' },
                        { name: 'repo', type: 'string', required: false, description: 'Repository name' },
                    ],
                    returns: { type: 'object', description: 'Updated issue details' },
                },
                {
                    name: 'pr.analyze',
                    description: 'Analyze a pull request',
                    parameters: [
                        { name: 'pullNumber', type: 'number', required: true, description: 'PR number' },
                        { name: 'owner', type: 'string', required: false, description: 'Repository owner' },
                        { name: 'repo', type: 'string', required: false, description: 'Repository name' },
                    ],
                    returns: { type: 'object', description: 'PR analysis including size, risk, and suggestions' },
                },
                {
                    name: 'pr.review',
                    description: 'Generate PR review checklist',
                    parameters: [
                        { name: 'pullNumber', type: 'number', required: true, description: 'PR number' },
                        { name: 'checkList', type: 'string[]', required: false, description: 'Custom checklist items' },
                        { name: 'owner', type: 'string', required: false, description: 'Repository owner' },
                        { name: 'repo', type: 'string', required: false, description: 'Repository name' },
                    ],
                    returns: { type: 'object', description: 'Review template with checklist' },
                },
                {
                    name: 'release.create',
                    description: 'Create a new release',
                    parameters: [
                        { name: 'tagName', type: 'string', required: true, description: 'Tag name (e.g., v1.0.0)' },
                        { name: 'name', type: 'string', required: false, description: 'Release name' },
                        { name: 'body', type: 'string', required: false, description: 'Release notes' },
                        { name: 'generateNotes', type: 'boolean', required: false, description: 'Auto-generate release notes' },
                        { name: 'draft', type: 'boolean', required: false, description: 'Create as draft' },
                        { name: 'prerelease', type: 'boolean', required: false, description: 'Mark as prerelease' },
                        { name: 'owner', type: 'string', required: false, description: 'Repository owner' },
                        { name: 'repo', type: 'string', required: false, description: 'Repository name' },
                    ],
                    returns: { type: 'object', description: 'Created release details' },
                },
                {
                    name: 'repo.stats',
                    description: 'Get repository statistics',
                    parameters: [
                        { name: 'owner', type: 'string', required: false, description: 'Repository owner' },
                        { name: 'repo', type: 'string', required: false, description: 'Repository name' },
                    ],
                    returns: { type: 'object', description: 'Repository stats including stars, forks, issues' },
                },
                {
                    name: 'repo.health',
                    description: 'Analyze repository health',
                    parameters: [
                        { name: 'owner', type: 'string', required: false, description: 'Repository owner' },
                        { name: 'repo', type: 'string', required: false, description: 'Repository name' },
                    ],
                    returns: { type: 'object', description: 'Health score and recommendations' },
                },
            ],
            config: {
                properties: [
                    { name: 'githubToken', type: 'string', required: true, description: 'GitHub Personal Access Token', secret: true },
                    { name: 'defaultOwner', type: 'string', required: false, description: 'Default repository owner' },
                    { name: 'defaultRepo', type: 'string', required: false, description: 'Default repository name' },
                    { name: 'features', type: 'object', required: false, description: 'Feature flags' },
                ],
                required: ['githubToken'],
            },
        };
    }
    async dispose() {
        // 清理資源
        this.config = undefined;
        this.client = undefined;
    }
    // ========================================================================
    // Private Helpers
    // ========================================================================
    isFeatureEnabled(action) {
        if (!this.config?.features) {
            return true; // 預設全部啟用
        }
        const featureMap = {
            'issue.create': 'issueAutomation',
            'issue.list': 'issueAutomation',
            'issue.update': 'issueAutomation',
            'pr.analyze': 'prAssistant',
            'pr.review': 'prAssistant',
            'release.create': 'releaseAutomation',
            'repo.stats': 'repoAnalytics',
            'repo.health': 'repoAnalytics',
        };
        const featureKey = featureMap[action];
        if (!featureKey)
            return true;
        return this.config.features[featureKey] ?? true;
    }
}
exports.GitHubAutomationSkill = GitHubAutomationSkill;
// ============================================================================
// Factory Function
// ============================================================================
function createGitHubSkill() {
    return new GitHubAutomationSkill();
}
