"use strict";
// REAL MEMORY ARCHITECTURE API - PRODUCTION READY
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryDatabase = exports.MemoryManager = void 0;
exports.createMemorySystem = createMemorySystem;
const memory_manager_1 = require("./memory-manager");
var memory_manager_2 = require("./memory-manager");
Object.defineProperty(exports, "MemoryManager", { enumerable: true, get: function () { return memory_manager_2.MemoryManager; } });
var database_1 = require("./database");
Object.defineProperty(exports, "MemoryDatabase", { enumerable: true, get: function () { return database_1.MemoryDatabase; } });
__exportStar(require("./types"), exports);
// Quick start example for integration
async function createMemorySystem(dbPath) {
    const memoryManager = new memory_manager_1.MemoryManager(dbPath);
    await memoryManager.initialize();
    return memoryManager;
}
//# sourceMappingURL=index.js.map