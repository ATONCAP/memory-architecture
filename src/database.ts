// REAL DATABASE IMPLEMENTATION - USING SQLITE FOR BETTER ASYNC SUPPORT

import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { EpisodicMemory } from './types';

export class MemoryDatabase {
  private db!: Database<sqlite3.Database, sqlite3.Statement>;
  private initialized = false;
  private dbPath: string;

  constructor(dbPath: string = './memory.db') {
    this.dbPath = dbPath;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });
    
    // Create episodic memories table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS episodic_memories (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        participants TEXT NOT NULL,
        context TEXT NOT NULL,
        events TEXT NOT NULL,
        emotions TEXT NOT NULL,
        outcomes TEXT NOT NULL,
        significance REAL NOT NULL,
        connections TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    // Create indexes for common queries
    await this.db.exec('CREATE INDEX IF NOT EXISTS idx_episodic_timestamp ON episodic_memories(timestamp)');
    await this.db.exec('CREATE INDEX IF NOT EXISTS idx_episodic_context ON episodic_memories(context)');
    await this.db.exec('CREATE INDEX IF NOT EXISTS idx_episodic_significance ON episodic_memories(significance)');

    this.initialized = true;
  }

  async storeEpisodicMemory(memory: EpisodicMemory): Promise<void> {
    await this.initialize();
    
    await this.db.run(`
      INSERT OR REPLACE INTO episodic_memories (
        id, timestamp, participants, context, events, emotions, 
        outcomes, significance, connections
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      memory.id,
      memory.timestamp.getTime(),
      JSON.stringify(memory.participants),
      memory.context,
      JSON.stringify(memory.events),
      JSON.stringify(memory.emotions),
      memory.outcomes,
      memory.significance,
      JSON.stringify(memory.connections)
    ]);
  }

  async getEpisodicMemory(id: string): Promise<EpisodicMemory | null> {
    await this.initialize();
    
    const row = await this.db.get('SELECT * FROM episodic_memories WHERE id = ?', id);
    if (!row) return null;

    return this.parseEpisodicMemoryRow(row);
  }

  async queryEpisodicMemories(
    timeRange?: { start: Date; end: Date },
    context?: string,
    significanceThreshold?: number,
    limit: number = 50
  ): Promise<EpisodicMemory[]> {
    await this.initialize();
    
    let query = 'SELECT * FROM episodic_memories WHERE 1=1';
    const params: any[] = [];

    if (timeRange) {
      query += ' AND timestamp >= ? AND timestamp <= ?';
      params.push(timeRange.start.getTime(), timeRange.end.getTime());
    }

    if (context) {
      query += ' AND context = ?';
      params.push(context);
    }

    if (significanceThreshold !== undefined) {
      query += ' AND significance >= ?';
      params.push(significanceThreshold);
    }

    query += ' ORDER BY significance DESC, timestamp DESC LIMIT ?';
    params.push(limit);

    const rows = await this.db.all(query, params);
    return rows.map(row => this.parseEpisodicMemoryRow(row));
  }

  private parseEpisodicMemoryRow(row: any): EpisodicMemory {
    return {
      id: row.id,
      timestamp: new Date(row.timestamp),
      participants: JSON.parse(row.participants),
      context: row.context,
      events: JSON.parse(row.events),
      emotions: JSON.parse(row.emotions),
      outcomes: row.outcomes,
      significance: row.significance,
      connections: JSON.parse(row.connections)
    };
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
    }
  }

  async getMemoryStats(): Promise<{
    total_memories: number;
    contexts: { [key: string]: number };
    avg_significance: number;
  }> {
    await this.initialize();
    
    const totalRow = await this.db.get('SELECT COUNT(*) as count FROM episodic_memories');
    const avgRow = await this.db.get('SELECT AVG(significance) as avg FROM episodic_memories');
    const contextRows = await this.db.all(`
      SELECT context, COUNT(*) as count 
      FROM episodic_memories 
      GROUP BY context
    `);

    const contexts: { [key: string]: number } = {};
    contextRows.forEach(row => {
      contexts[row.context] = row.count;
    });

    return {
      total_memories: totalRow.count,
      contexts,
      avg_significance: avgRow.avg || 0
    };
  }
}
