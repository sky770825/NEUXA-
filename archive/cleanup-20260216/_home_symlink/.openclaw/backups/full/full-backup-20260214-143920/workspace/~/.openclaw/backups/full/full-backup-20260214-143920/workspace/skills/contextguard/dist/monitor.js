/**
 * ContextGuard - Context 監控核心
 * 取得 openclaw sessions 資料並計算使用率
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const DEFAULT_SESSION = "agent:main:main";
function getConfigPath() {
    const home = process.env.HOME || process.env.USERPROFILE || "";
    return `${home}/.openclaw/contextguard.json`;
}
export function loadConfig() {
    const path = getConfigPath();
    try {
        const raw = readFileSync(path, "utf8");
        return JSON.parse(raw);
    }
    catch {
        return {};
    }
}
export function getThresholds() {
    const config = loadConfig();
    const t = config.thresholds || {};
    return {
        warn: t.warn ?? 70,
        critical: t.critical ?? 85,
        autoCompact: t.autoCompact ?? 90,
    };
}
/** 執行 openclaw sessions --json 取得 session 資料 */
export function getSessionData() {
    const result = spawnSync("openclaw", ["sessions", "--json"], {
        encoding: "utf8",
        env: process.env,
    });
    if (result.error || result.status !== 0) {
        return { sessions: [] };
    }
    try {
        return JSON.parse(result.stdout || "{}");
    }
    catch {
        return { sessions: [] };
    }
}
/** 計算單一 session 使用率 (totalTokens / contextTokens * 100) */
function calcUsagePercent(total, context) {
    if (context <= 0)
        return 0;
    return Math.round((total / context) * 10000) / 100;
}
/** 從 session 列表解析出 MonitorResult */
export function parseMonitorResult(raw) {
    const sessions = raw.sessions || [];
    const list = sessions
        .filter((s) => Boolean(s && typeof s === "object"))
        .map((s) => {
        const total = +s.totalTokens || 0;
        const context = +s.contextTokens || 0;
        return {
            key: String(s.key ?? ""),
            totalTokens: total,
            contextTokens: context,
            model: s.model,
            usagePercent: calcUsagePercent(total, context),
        };
    })
        .filter((s) => s.key);
    const main = list.find((s) => s.key === DEFAULT_SESSION) ?? list[0] ?? null;
    const usagePercent = main ? main.usagePercent : 0;
    return {
        main,
        sessions: list,
        usagePercent,
        rawJson: raw,
    };
}
/** 一次取得目前監控狀態 */
export function getMonitorResult() {
    const raw = getSessionData();
    return parseMonitorResult(raw);
}
