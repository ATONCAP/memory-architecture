import { EpisodicMemory } from './types';
export declare class MemoryDatabase {
    private db;
    private initialized;
    private dbPath;
    constructor(dbPath?: string);
    initialize(): Promise<void>;
    storeEpisodicMemory(memory: EpisodicMemory): Promise<void>;
    getEpisodicMemory(id: string): Promise<EpisodicMemory | null>;
    queryEpisodicMemories(timeRange?: {
        start: Date;
        end: Date;
    }, context?: string, significanceThreshold?: number, limit?: number): Promise<EpisodicMemory[]>;
    private parseEpisodicMemoryRow;
    close(): Promise<void>;
    getMemoryStats(): Promise<{
        total_memories: number;
        contexts: {
            [key: string]: number;
        };
        avg_significance: number;
    }>;
}
//# sourceMappingURL=database.d.ts.map