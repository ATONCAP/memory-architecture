// REAL MEMORY ARCHITECTURE API - PRODUCTION READY

import { MemoryManager } from './memory-manager';

export { MemoryManager } from './memory-manager';
export { MemoryDatabase } from './database';
export * from './types';

// Quick start example for integration
export async function createMemorySystem(dbPath?: string): Promise<MemoryManager> {
  const memoryManager = new MemoryManager(dbPath);
  await memoryManager.initialize();
  return memoryManager;
}
