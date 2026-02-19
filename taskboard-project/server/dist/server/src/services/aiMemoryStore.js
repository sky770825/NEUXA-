import { supabase } from '../lib/supabase.js';
import { logger } from '../utils/logger.js';
class AiMemoryStore {
    cache = [];
    isOnline = true;
    constructor() {
        this.init();
    }
    async init() {
        await this.syncFromSupabase();
    }
    async syncFromSupabase() {
        try {
            const { data, error } = await supabase
                .from('openclaw_memories')
                .select('*')
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            if (data) {
                this.cache = data;
                this.isOnline = true;
            }
        }
        catch (error) {
            logger.error({ error, component: 'aiMemoryStore', operation: 'syncFromSupabase' }, 'Failed to sync from Supabase');
            this.isOnline = false;
            // In a real app, we might load from a local file if offline
        }
    }
    async addMemory(content, metadata = {}) {
        const newMemory = {
            content,
            metadata,
            created_at: new Date().toISOString()
        };
        // Optimistic update to cache
        this.cache.unshift(newMemory);
        try {
            const { data, error } = await supabase
                .from('openclaw_memories')
                .insert([newMemory])
                .select();
            if (error)
                throw error;
            if (data && data[0]) {
                // Update cache with real data (with ID from DB)
                this.cache[0] = data[0];
            }
            this.isOnline = true;
            return data ? data[0] : newMemory;
        }
        catch (error) {
            logger.error({ error, component: 'aiMemoryStore', operation: 'addMemory' }, 'Failed to add memory to Supabase, keeping in cache');
            this.isOnline = false;
            return newMemory; // Return cached version
        }
    }
    async getMemories(limit = 10) {
        if (this.isOnline) {
            await this.syncFromSupabase();
        }
        return this.cache.slice(0, limit);
    }
    getHealth() {
        return {
            isOnline: this.isOnline,
            cacheSize: this.cache.length
        };
    }
}
export const aiMemoryStore = new AiMemoryStore();
//# sourceMappingURL=aiMemoryStore.js.map