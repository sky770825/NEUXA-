"use strict";
/**
 * GitHub API Client
 * 封裝 Octokit REST API，提供統一介面
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubClient = void 0;
const rest_1 = require("@octokit/rest");
class GitHubClient {
    octokit;
    _token;
    constructor(token) {
        this._token = token;
        this.octokit = new rest_1.Octokit({ auth: token });
    }
    /**
     * 取得目前使用的 GitHub Token（部分遮蔽）
     */
    getToken() {
        return this._token.substring(0, 4) + '****' + this._token.substring(this._token.length - 4);
    }
    // ============================================================================
    // Issue Operations
    // ============================================================================
    async listIssues(owner, repo, options = {}) {
        const { data } = await this.octokit.rest.issues.listForRepo({
            owner,
            repo,
            state: options.state || 'open',
            labels: options.labels?.join(','),
            assignee: options.assignee,
            per_page: options.perPage || 30,
        });
        return data.map(this.mapIssue);
    }
    async createIssue(owner, repo, title, body, options = {}) {
        const { data } = await this.octokit.rest.issues.create({
            owner,
            repo,
            title,
            body,
            labels: options.labels,
            assignees: options.assignees,
        });
        return this.mapIssue(data);
    }
    async updateIssue(owner, repo, issueNumber, updates) {
        const { data } = await this.octokit.rest.issues.update({
            owner,
            repo,
            issue_number: issueNumber,
            ...updates,
        });
        return this.mapIssue(data);
    }
    // ============================================================================
    // Pull Request Operations
    // ============================================================================
    async getPullRequest(owner, repo, pullNumber) {
        const { data } = await this.octokit.rest.pulls.get({
            owner,
            repo,
            pull_number: pullNumber,
        });
        return this.mapPullRequest(data);
    }
    async listPullRequests(owner, repo, options = {}) {
        const { data } = await this.octokit.rest.pulls.list({
            owner,
            repo,
            state: options.state || 'open',
            per_page: options.perPage || 30,
        });
        return data.map(this.mapPullRequest);
    }
    async getPullRequestFiles(owner, repo, pullNumber) {
        const { data } = await this.octokit.rest.pulls.listFiles({
            owner,
            repo,
            pull_number: pullNumber,
        });
        return data.map(f => ({
            filename: f.filename,
            status: f.status,
            changes: f.changes,
        }));
    }
    // ============================================================================
    // Release Operations
    // ============================================================================
    async createRelease(owner, repo, tagName, options = {}) {
        const { data } = await this.octokit.rest.repos.createRelease({
            owner,
            repo,
            tag_name: tagName,
            name: options.name,
            body: options.body,
            draft: options.draft,
            prerelease: options.prerelease,
            target_commitish: options.targetCommitish,
        });
        return this.mapRelease(data);
    }
    async generateReleaseNotes(owner, repo, tagName, previousTag) {
        const { data } = await this.octokit.rest.repos.generateReleaseNotes({
            owner,
            repo,
            tag_name: tagName,
            previous_tag_name: previousTag,
        });
        return data.body;
    }
    // ============================================================================
    // Repository Analytics
    // ============================================================================
    async getRepoStats(owner, repo) {
        const [{ data: repoData }, { data: issues }, { data: pulls }] = await Promise.all([
            this.octokit.rest.repos.get({ owner, repo }),
            this.octokit.rest.issues.listForRepo({
                owner,
                repo,
                state: 'open',
                per_page: 1,
            }),
            this.octokit.rest.pulls.list({
                owner,
                repo,
                state: 'open',
                per_page: 1,
            }),
        ]);
        // 計算健康度分數 (0-100)
        const healthScore = this.calculateHealthScore(repoData, issues.length);
        return {
            stars: repoData.stargazers_count,
            forks: repoData.forks_count,
            openIssues: issues.length,
            openPRs: pulls.length,
            watchers: repoData.watchers_count,
            healthScore,
        };
    }
    // ============================================================================
    // Rate Limit
    // ============================================================================
    async getRateLimit() {
        const { data } = await this.octokit.rest.rateLimit.get();
        return {
            limit: data.rate.limit,
            remaining: data.rate.remaining,
            resetAt: new Date(data.rate.reset * 1000),
        };
    }
    // ============================================================================
    // Private Helpers
    // ============================================================================
    mapIssue(data) {
        return {
            number: data.number,
            title: data.title,
            body: data.body,
            state: data.state,
            labels: data.labels.map((l) => ({ name: l.name })),
            assignees: data.assignees.map((a) => ({ login: a.login })),
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }
    mapPullRequest(data) {
        return {
            number: data.number,
            title: data.title,
            body: data.body,
            state: data.state,
            user: { login: data.user.login },
            head: { ref: data.head.ref, sha: data.head.sha },
            base: { ref: data.base.ref, sha: data.base.sha },
            changedFiles: data.changed_files,
            additions: data.additions,
            deletions: data.deletions,
        };
    }
    mapRelease(data) {
        return {
            id: data.id,
            tagName: data.tag_name,
            name: data.name,
            body: data.body,
            draft: data.draft,
            prerelease: data.prerelease,
            createdAt: data.created_at,
            publishedAt: data.published_at,
        };
    }
    calculateHealthScore(repoData, openIssues) {
        // 簡化的健康度計算
        let score = 70; // 基礎分
        // 有 README 加分
        if (repoData.description && repoData.description.length > 20)
            score += 10;
        // 問題比例評估
        const issueRatio = openIssues / (repoData.stargazers_count + 1);
        if (issueRatio < 0.01)
            score += 10;
        else if (issueRatio > 0.1)
            score -= 10;
        // 最近更新
        const lastUpdate = new Date(repoData.updated_at);
        const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate < 30)
            score += 10;
        else if (daysSinceUpdate > 180)
            score -= 10;
        return Math.min(100, Math.max(0, score));
    }
}
exports.GitHubClient = GitHubClient;
