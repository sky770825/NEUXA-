"use strict";
/**
 * Issue Automation Strategy
 * 使用 Strategy Pattern 實作 Issue 相關操作
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueUpdateStrategy = exports.IssueListStrategy = exports.IssueCreateStrategy = void 0;
const GitHubClient_1 = require("../api/GitHubClient");
class IssueCreateStrategy {
    name = 'issue.create';
    validate(params) {
        const errors = [];
        const p = params;
        if (!p.title || typeof p.title !== 'string') {
            errors.push('title is required and must be a string');
        }
        return {
            valid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
        };
    }
    async execute(context) {
        try {
            const client = new GitHubClient_1.GitHubClient(context.githubToken);
            const { title, body, labels, assignees } = context.params;
            const issue = await client.createIssue(context.owner, context.repo, title, body, { labels, assignees });
            return {
                success: true,
                data: {
                    issueNumber: issue.number,
                    title: issue.title,
                    url: `https://github.com/${context.owner}/${context.repo}/issues/${issue.number}`,
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
exports.IssueCreateStrategy = IssueCreateStrategy;
class IssueListStrategy {
    name = 'issue.list';
    validate(params) {
        const p = params;
        if (p.state && !['open', 'closed', 'all'].includes(p.state)) {
            return {
                valid: false,
                errors: ['state must be one of: open, closed, all'],
            };
        }
        return { valid: true };
    }
    async execute(context) {
        try {
            const client = new GitHubClient_1.GitHubClient(context.githubToken);
            const { state, labels, assignee, perPage } = context.params;
            const issues = await client.listIssues(context.owner, context.repo, {
                state,
                labels,
                assignee,
                perPage,
            });
            return {
                success: true,
                data: {
                    count: issues.length,
                    issues: issues.map(i => ({
                        number: i.number,
                        title: i.title,
                        state: i.state,
                        labels: i.labels.map(l => l.name),
                        assignees: i.assignees.map(a => a.login),
                    })),
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
exports.IssueListStrategy = IssueListStrategy;
class IssueUpdateStrategy {
    name = 'issue.update';
    validate(params) {
        const errors = [];
        const p = params;
        if (!p.issueNumber || typeof p.issueNumber !== 'number') {
            errors.push('issueNumber is required and must be a number');
        }
        return {
            valid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
        };
    }
    async execute(context) {
        try {
            const client = new GitHubClient_1.GitHubClient(context.githubToken);
            const { issueNumber, title, body, state, labels, assignees } = context.params;
            const issue = await client.updateIssue(context.owner, context.repo, issueNumber, { title, body, state, labels, assignees });
            return {
                success: true,
                data: {
                    issueNumber: issue.number,
                    title: issue.title,
                    state: issue.state,
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
exports.IssueUpdateStrategy = IssueUpdateStrategy;
