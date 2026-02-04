import { EmotionalState, MemoryQuery, MemorySearchResult } from './types';
export declare class MemoryManager {
    private db;
    constructor(dbPath?: string);
    initialize(): Promise<void>;
    storeInteraction(participants: string[], context: string, events: string[], emotions: EmotionalState, outcomes: string): Promise<string>;
    private calculateSignificance;
    searchMemories(query: MemoryQuery): Promise<MemorySearchResult[]>;
    private calculateRelevanceScore;
    private calculateEmotionalSimilarity;
    private getMatchReasons;
    private scheduleConsolidation;
    private consolidateMemory;
    private hasThematicOverlap;
    getMemoryStats(): Promise<{
        total_memories: number;
        contexts: {
            [key: string]: number;
        };
        avg_significance: number;
    }>;
    close(): Promise<void>;
}
//# sourceMappingURL=memory-manager.d.ts.map