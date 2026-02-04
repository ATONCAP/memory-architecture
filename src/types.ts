// REAL MEMORY TYPES - NOT PERFORMATIVE

export interface EpisodicMemory {
  id: string;
  timestamp: Date;
  participants: string[];
  context: string; // 'social' | 'work' | 'creative' | 'learning'
  events: string[]; // ordered sequence of what happened
  emotions: EmotionalState;
  outcomes: string; // what was accomplished/learned
  significance: number; // 0-1 importance score
  connections: string[]; // IDs of related memories
}

export interface EmotionalState {
  valence: number; // -1 (negative) to 1 (positive)
  arousal: number; // 0 (calm) to 1 (excited)
  dominance: number; // 0 (submissive) to 1 (dominant)
  specific_emotions: string[]; // joy, frustration, curiosity, etc.
}

export interface SemanticMemory {
  id: string;
  concept: string;
  definition: string;
  relationships: ConceptRelation[];
  confidence: number; // 0-1 how certain we are
  source_memories: string[]; // episodic memories that created this
  last_updated: Date;
}

export interface ConceptRelation {
  target_concept: string;
  relationship_type: string; // 'is_a', 'part_of', 'causes', 'similar_to'
  strength: number; // 0-1
}

export interface LearningRecord {
  id: string;
  trigger_memory: string; // source experience ID
  pattern: string; // what pattern was discovered
  application: string; // how to apply this learning
  confidence: number; // 0-1 certainty score
  validation_events: string[]; // memories that confirmed this learning
  created_at: Date;
}

export interface MemoryQuery {
  timeRange?: { start: Date; end: Date };
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
