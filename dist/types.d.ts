export interface EpisodicMemory {
    id: string;
    timestamp: Date;
    participants: string[];
    context: string;
    events: string[];
    emotions: EmotionalState;
    outcomes: string;
    significance: number;
    connections: string[];
}
export interface EmotionalState {
    valence: number;
    arousal: number;
    dominance: number;
    specific_emotions: string[];
}
export interface SemanticMemory {
    id: string;
    concept: string;
    definition: string;
    relationships: ConceptRelation[];
    confidence: number;
    source_memories: string[];
    last_updated: Date;
}
export interface ConceptRelation {
    target_concept: string;
    relationship_type: string;
    strength: number;
}
export interface LearningRecord {
    id: string;
    trigger_memory: string;
    pattern: string;
    application: string;
    confidence: number;
    validation_events: string[];
    created_at: Date;
}
export interface MemoryQuery {
    timeRange?: {
        start: Date;
        end: Date;
    };
    participants?: string[];
    context?: string;
    emotions?: Partial<EmotionalState>;
    significance_threshold?: number;
    limit?: number;
}
export interface MemorySearchResult {
    memory: EpisodicMemory;
    relevance_score: number;
    match_reasons: string[];
}
//# sourceMappingURL=types.d.ts.map