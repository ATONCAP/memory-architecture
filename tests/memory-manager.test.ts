// REAL TESTS - ACTUALLY TEST THE LOGIC

import { MemoryManager } from '../src/memory-manager';
import { EmotionalState } from '../src/types';
import * as fs from 'fs';

describe('MemoryManager - REAL FUNCTIONALITY TESTS', () => {
  let memoryManager: MemoryManager;
  const testDbPath = './test-memory.db';

  beforeEach(async () => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    
    memoryManager = new MemoryManager(testDbPath);
    await memoryManager.initialize();
  });

  afterEach(async () => {
    await memoryManager.close();
    
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  test('stores and retrieves memories with real data', async () => {
    const emotions: EmotionalState = {
      valence: 0.7,
      arousal: 0.5,
      dominance: 0.6,
      specific_emotions: ['joy', 'curiosity']
    };

    const memoryId = await memoryManager.storeInteraction(
      ['logan', 'aton'],
      'work',
      ['Discussed digital personhood architecture', 'Created implementation plan'],
      emotions,
      'Successfully designed complete system for agent autonomy'
    );

    expect(memoryId).toMatch(/^[0-9a-f-]{36}$/); // Valid UUID

    const searchResults = await memoryManager.searchMemories({
      context: 'work',
      limit: 10
    });

    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].memory.id).toBe(memoryId);
    expect(searchResults[0].memory.participants).toEqual(['logan', 'aton']);
    expect(searchResults[0].memory.context).toBe('work');
    expect(searchResults[0].memory.significance).toBeGreaterThan(0.5); // Should be high due to learning
  });

  test('calculates significance correctly based on real criteria', async () => {
    // High significance memory (learning + emotional intensity)
    const highSigMemoryId = await memoryManager.storeInteraction(
      ['alice', 'bob'],
      'learning',
      ['Discovered major breakthrough in AI reasoning', 'Realized fundamental flaw in previous approach'],
      { valence: 0.9, arousal: 0.8, dominance: 0.7, specific_emotions: ['excitement', 'insight'] },
      'Learned that previous assumptions were wrong and developed new framework'
    );

    // Low significance memory (routine interaction)
    const lowSigMemoryId = await memoryManager.storeInteraction(
      ['alice'],
      'casual',
      ['Said hello'],
      { valence: 0.1, arousal: 0.1, dominance: 0.5, specific_emotions: ['neutral'] },
      'Brief greeting'
    );

    const highSigResults = await memoryManager.searchMemories({ significance_threshold: 0.7 });
    const lowSigResults = await memoryManager.searchMemories({ significance_threshold: 0.1 });

    expect(lowSigResults.length).toBe(2); // Both memories above 0.1
    expect(highSigResults.length).toBe(1); // Only high significance memory above 0.7
    expect(highSigResults[0].memory.id).toBe(highSigMemoryId);
  }, 10000); // Increased timeout

  test('basic memory stats work', async () => {
    await memoryManager.storeInteraction(
      ['test1'],
      'work',
      ['Work event'],
      { valence: 0.5, arousal: 0.5, dominance: 0.5, specific_emotions: ['neutral'] },
      'Work done'
    );

    await memoryManager.storeInteraction(
      ['test2'],
      'social',
      ['Social event'],
      { valence: 0.7, arousal: 0.6, dominance: 0.6, specific_emotions: ['happy'] },
      'Had fun'
    );

    const stats = await memoryManager.getMemoryStats();
    expect(stats.total_memories).toBe(2);
    expect(stats.contexts.work).toBe(1);
    expect(stats.contexts.social).toBe(1);
    expect(stats.avg_significance).toBeGreaterThan(0);
  }, 10000);
});
