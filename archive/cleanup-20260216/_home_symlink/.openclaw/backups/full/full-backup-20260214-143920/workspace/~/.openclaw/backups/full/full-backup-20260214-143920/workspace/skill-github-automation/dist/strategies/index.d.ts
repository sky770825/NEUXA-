/**
 * Strategy Registry
 * 統一管理所有執行策略
 */
import { ExecutionStrategy } from '../types';
export declare class StrategyRegistry {
    private strategies;
    constructor();
    private registerDefaultStrategies;
    register(strategy: ExecutionStrategy): void;
    get(name: string): ExecutionStrategy | undefined;
    list(): string[];
    has(name: string): boolean;
}
