export declare const getEnhancedHealth: () => Promise<{
    status: string;
    timestamp: string;
    version: string;
    uptime: string;
    services: {
        supabase: string;
        aiMemory: {
            isOnline: boolean;
            cacheSize: number;
        };
    };
    metrics: {
        memory: {
            rss: string;
            heapTotal: string;
            heapUsed: string;
            external: string;
        };
        wsConnections: number;
        cpuLoad: NodeJS.CpuUsage;
    };
    security: {
        basicAuthEnabled: boolean;
        writeProtectionEnabled: boolean;
    };
}>;
//# sourceMappingURL=health.d.ts.map