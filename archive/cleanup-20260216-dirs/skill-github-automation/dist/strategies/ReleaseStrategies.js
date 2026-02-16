"use strict";
/**
 * Release Automation Strategy
 * 自動化發布功能
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepoHealthStrategy = exports.RepoStatsStrategy = exports.ReleaseCreateStrategy = void 0;
const GitHubClient_1 = require("../api/GitHubClient");
class ReleaseCreateStrategy {
    name = 'release.create';
    validate(params) {
        const errors = [];
        const p = params;
        if (!p.tagName || typeof p.tagName !== 'string') {
            errors.push('tagName is required and must be a string (e.g., "v1.0.0")');
        }
        return {
            valid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
        };
    }
    async execute(context) {
        try {
            const client = new GitHubClient_1.GitHubClient(context.githubToken);
            const { tagName, name, body, generateNotes, draft, prerelease, targetCommitish, } = context.params;
            let releaseBody = body;
            // 自動產生 release notes
            if (generateNotes && !body) {
                releaseBody = await client.generateReleaseNotes(context.owner, context.repo, tagName);
            }
            const release = await client.createRelease(context.owner, context.repo, tagName, {
                name: name || tagName,
                body: releaseBody,
                draft,
                prerelease,
                targetCommitish,
            });
            return {
                success: true,
                data: {
                    releaseId: release.id,
                    tagName: release.tagName,
                    name: release.name,
                    url: `https://github.com/${context.owner}/${context.repo}/releases/tag/${release.tagName}`,
                    published: !release.draft,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
exports.ReleaseCreateStrategy = ReleaseCreateStrategy;
class RepoStatsStrategy {
    name = 'repo.stats';
    validate() {
        // 不需要參數
        return { valid: true };
    }
    async execute(context) {
        try {
            const client = new GitHubClient_1.GitHubClient(context.githubToken);
            const stats = await client.getRepoStats(context.owner, context.repo);
            const rateLimit = await client.getRateLimit();
            return {
                success: true,
                data: {
                    repository: `${context.owner}/${context.repo}`,
                    stats,
                    rateLimit: {
                        remaining: rateLimit.remaining,
                        limit: rateLimit.limit,
                        resetAt: rateLimit.resetAt.toISOString(),
                    },
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
exports.RepoStatsStrategy = RepoStatsStrategy;
class RepoHealthStrategy {
    name = 'repo.health';
    validate() {
        return { valid: true };
    }
    async execute(context) {
        try {
            const client = new GitHubClient_1.GitHubClient(context.githubToken);
            const stats = await client.getRepoStats(context.owner, context.repo);
            // 健康度評估
            const health = this.assessHealth(stats);
            return {
                success: true,
                data: {
                    repository: `${context.owner}/${context.repo}`,
                    healthScore: stats.healthScore,
                    assessment: health,
                    recommendations: this.generateRecommendations(stats, health),
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    assessHealth(stats) {
        const details = [];
        let status;
        if (stats.healthScore >= 80) {
            status = 'healthy';
            details.push('專案維護良好');
        }
        else if (stats.healthScore >= 60) {
            status = 'moderate';
            details.push('專案狀況尚可，有改善空間');
        }
        else {
            status = 'needs-attention';
            details.push('專案需要關注和維護');
        }
        return { status, details };
    }
    generateRecommendations(stats, health) {
        const recommendations = [];
        if (health.status !== 'healthy') {
            recommendations.push('定期更新依賴套件');
            recommendations.push('檢視並處理過期的 Issues');
        }
        if (stats.openIssues > 50) {
            recommendations.push('考慮標籤分類管理 Issues');
        }
        if (stats.stars > 100 && stats.forks < 10) {
            recommendations.push('添加貢獻指南 (CONTRIBUTING.md) 鼓勵參與');
        }
        return recommendations;
    }
}
exports.RepoHealthStrategy = RepoHealthStrategy;
