"use strict";
// REAL DATABASE IMPLEMENTATION - USING SQLITE FOR BETTER ASYNC SUPPORT
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryDatabase = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
class MemoryDatabase {
    constructor(dbPath = './memory.db') {
        this.initialized = false;
        this.dbPath = dbPath;
    }
    async initialize() {
        if (this.initialized)
            return;
        this.db = await (0, sqlite_1.open)({
            filename: this.dbPath,
            driver: sqlite3_1.default.Database
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
    async storeEpisodicMemory(memory) {
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
    async getEpisodicMemory(id) {
        await this.initialize();
        const row = await this.db.get('SELECT * FROM episodic_memories WHERE id = ?', id);
        if (!row)
            return null;
        return this.parseEpisodicMemoryRow(row);
    }
    async queryEpisodicMemories(timeRange, context, significanceThreshold, limit = 50) {
        await this.initialize();
        let query = 'SELECT * FROM episodic_memories WHERE 1=1';
        const params = [];
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
    parseEpisodicMemoryRow(row) {
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
    async close() {
        if (this.db) {
            await this.db.close();
        }
    }
    async getMemoryStats() {
        await this.initialize();
        const totalRow = await this.db.get('SELECT COUNT(*) as count FROM episodic_memories');
        const avgRow = await this.db.get('SELECT AVG(significance) as avg FROM episodic_memories');
        const contextRows = await this.db.all(`
      SELECT context, COUNT(*) as count 
      FROM episodic_memories 
      GROUP BY context
    `);
        const contexts = {};
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
exports.MemoryDatabase = MemoryDatabase;
//# sourceMappingURL=database.js.map