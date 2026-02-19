interface Memory {
    id?: string;
    content: string;
    metadata?: any;
    created_at?: string;
    updated_at?: string;
}
declare class AiMemoryStore {
    private cache;
    private isOnline;
    constructor();
    private init;
    syncFromSupabase(): Promise<void>;
    addMemory(content: string, metadata?: any): Promise<any>;
    getMemories(limit?: number): Promise<Memory[]>;
    getHealth(): {
        isOnline: boolean;
        cacheSize: number;
    };
}
export declare const aiMemoryStore: AiMemoryStore;
export {};
//# sourceMappingURL=aiMemoryStore.d.ts.map