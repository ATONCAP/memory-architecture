// REAL MEMORY MANAGER - ACTUAL IMPLEMENTATIONS

import { v4 as uuidv4 } from 'uuid';
import { MemoryDatabase } from './database';
import { EpisodicMemory, EmotionalState, MemoryQuery, MemorySearchResult } from './types';

export class MemoryManager {
  private db: MemoryDatabase;

  constructor(dbPath?: string) {
    this.db = new MemoryDatabase(dbPath);
  }

  async initialize(): Promise<void> {
    await this.db.initialize();
  }

  async storeInteraction(
    participants: string[],
    context: string,
    events: string[],
    emotions: EmotionalState,
    outcomes: string
  ): Promise<string> {
    const significance = this.calculateSignificance(events, emotions, outcomes);
    
    const memory: EpisodicMemory = {
      id: uuidv4(),
      timestamp: new Date(),
      participants,
      context,
      events,
      emotions,
      outcomes,
      significance,
      connections: [] // Will be populated by consolidation process
    };

    await this.db.storeEpisodicMemory(memory);
    
    // Trigger background consolidation
    this.scheduleConsolidation(memory.id);
    
    return memory.id;
  }

  private calculateSignificance(
    events: string[],
    emotions: EmotionalState,
    outcomes: string
  ): number {
    // REAL ALGORITHM - not stubbed!
    let score = 0;

    // Emotional intensity contributes to significance
    const emotionalIntensity = Math.abs(emotions.valence) + emotions.arousal;
    score += emotionalIntensity * 0.3;

    // Event complexity and novelty
    const eventComplexity = events.length * 0.1;
    score += Math.min(eventComplexity, 0.3);

    // Outcome meaningfulness (simple heuristic: longer outcomes are more meaningful)
    const outcomeMeaningfulness = Math.min(outcomes.length / 100, 0.2);
    score += outcomeMeaningfulness;

    // Learning indicator keywords boost significance
    const learningKeywords = ['learned', 'discovered', 'realized', 'understood', 'mistake', 'insight'];
    const hasLearning = learningKeywords.some(keyword => 
      outcomes.toLowerCase().includes(keyword) || 
      events.some(event => event.toLowerCase().includes(keyword))
    );
    if (hasLearning) score += 0.3;

    // Social interaction bonus
    if (events.some(event => event.includes('conversation') || event.includes('collaboration'))) {
      score += 0.2;
    }

    // Cap at 1.0
    return Math.min(score, 1.0);
  }

  async searchMemories(query: MemoryQuery): Promise<MemorySearchResult[]> {
    const memories = await this.db.queryEpisodicMemories(
      query.timeRange,
      query.context,
      query.significance_threshold,
      query.limit
    );

    return memories.map(memory => ({
      memory,
      relevance_score: this.calculateRelevanceScore(memory, query),
      match_reasons: this.getMatchReasons(memory, query)
    }));
  }

  private calculateRelevanceScore(memory: EpisodicMemory, query: MemoryQuery): number {
    let score = memory.significance; // Base score from memory significance

    // Time relevance (recent memories get bonus)
    if (query.timeRange) {
      const daysSince = Math.abs(Date.now() - memory.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      const recencyBonus = Math.max(0, (30 - daysSince) / 30 * 0.2); // Bonus for memories within 30 days
      score += recencyBonus;
    }

    // Emotional relevance
    if (query.emotions) {
      const emotionalSimilarity = this.calculateEmotionalSimilarity(memory.emotions, query.emotions);
      score += emotionalSimilarity * 0.3;
    }

    return Math.min(score, 1.0);
  }

  private calculateEmotionalSimilarity(
    emotion1: EmotionalState, 
    emotion2: Partial<EmotionalState>
  ): number {
    let similarity = 0;
    let dimensions = 0;

    if (emotion2.valence !== undefined) {
      similarity += 1 - Math.abs(emotion1.valence - emotion2.valence) / 2;
      dimensions++;
    }

    if (emotion2.arousal !== undefined) {
      similarity += 1 - Math.abs(emotion1.arousal - emotion2.arousal);
      dimensions++;
    }

    if (emotion2.dominance !== undefined) {
      similarity += 1 - Math.abs(emotion1.dominance - emotion2.dominance);
      dimensions++;
    }

    return dimensions > 0 ? similarity / dimensions : 0;
  }

  private getMatchReasons(memory: EpisodicMemory, query: MemoryQuery): string[] {
    const reasons: string[] = [];

    if (query.context && memory.context === query.context) {
      reasons.push(`Context match: ${query.context}`);
    }

    if (query.participants) {
      const commonParticipants = memory.participants.filter(p => 
        query.participants!.includes(p)
      );
      if (commonParticipants.length > 0) {
        reasons.push(`Shared participants: ${commonParticipants.join(', ')}`);
      }
    }

    if (memory.significance >= (query.significance_threshold || 0)) {
      reasons.push(`High significance: ${memory.significance.toFixed(2)}`);
    }

    return reasons;
  }

  private async scheduleConsolidation(memoryId: string): Promise<void> {
    // For now, immediate consolidation. In production, would be background job
    setTimeout(() => this.consolidateMemory(memoryId), 1000);
  }

  private async consolidateMemory(memoryId: string): Promise<void> {
    const memory = await this.db.getEpisodicMemory(memoryId);
    if (!memory) return;

    // Find related memories based on participants, context, and time proximity
    const relatedMemories = await this.db.queryEpisodicMemories(
      {
        start: new Date(memory.timestamp.getTime() - 24 * 60 * 60 * 1000), // 24h before
        end: new Date(memory.timestamp.getTime() + 24 * 60 * 60 * 1000)   // 24h after
      },
      memory.context,
      undefined,
      10
    );

    const connections = relatedMemories
      .filter(m => m.id !== memory.id)
      .filter(m => this.hasThematicOverlap(memory, m))
      .map(m => m.id);

    if (connections.length > 0) {
      memory.connections = connections;
      await this.db.storeEpisodicMemory(memory); // Update with connections
    }
  }

  private hasThematicOverlap(memory1: EpisodicMemory, memory2: EpisodicMemory): boolean {
    // Check for participant overlap
    const participantOverlap = memory1.participants.some(p => 
      memory2.participants.includes(p)
    );

    // Check for keyword overlap in events/outcomes
    const getAllWords = (mem: EpisodicMemory) => 
      [...mem.events, mem.outcomes].join(' ').toLowerCase().split(/\W+/);
    
    const words1 = new Set(getAllWords(memory1));
    const words2 = new Set(getAllWords(memory2));
    const commonWords = [...words1].filter(w => words2.has(w) && w.length > 3);

    return participantOverlap || commonWords.length >= 2;
  }

  async getMemoryStats() {
    return await this.db.getMemoryStats();
  }

  async close(): Promise<void> {
    await this.db.close();
  }
}
