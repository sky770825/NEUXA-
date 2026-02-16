"use strict";
/**
 * Strategy Registry
 * 統一管理所有執行策略
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyRegistry = void 0;
const IssueStrategies_1 = require("./IssueStrategies");
const PRStrategies_1 = require("./PRStrategies");
const ReleaseStrategies_1 = require("./ReleaseStrategies");
class StrategyRegistry {
    strategies = new Map();
    constructor() {
        this.registerDefaultStrategies();
    }
    registerDefaultStrategies() {
        // Issue 策略
        this.register(new IssueStrategies_1.IssueCreateStrategy());
        this.register(new IssueStrategies_1.IssueListStrategy());
        this.register(new IssueStrategies_1.IssueUpdateStrategy());
        // PR 策略
        this.register(new PRStrategies_1.PRAnalyzeStrategy());
        this.register(new PRStrategies_1.PRReviewStrategy());
        // Release & Repo 策略
        this.register(new ReleaseStrategies_1.ReleaseCreateStrategy());
        this.register(new ReleaseStrategies_1.RepoStatsStrategy());
        this.register(new ReleaseStrategies_1.RepoHealthStrategy());
    }
    register(strategy) {
        this.strategies.set(strategy.name, strategy);
    }
    get(name) {
        return this.strategies.get(name);
    }
    list() {
        return Array.from(this.strategies.keys());
    }
    has(name) {
        return this.strategies.has(name);
    }
}
exports.StrategyRegistry = StrategyRegistry;
