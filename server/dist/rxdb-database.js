"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxdb_1 = require("rxdb");
const storage_memory_1 = require("rxdb/plugins/storage-memory");
const dev_mode_1 = require("rxdb/plugins/dev-mode");
const validate_1 = require("rxdb/plugins/validate");
const uuid_1 = require("uuid");
// Add plugins
(0, rxdb_1.addRxPlugin)(validate_1.RxDBValidatePlugin);
// Add dev mode plugin for better error messages
if (process.env.NODE_ENV !== 'production') {
    (0, rxdb_1.addRxPlugin)(dev_mode_1.RxDBDevModePlugin);
}
// RxDB Schema for Card collection
const cardSchema = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        player: {
            type: 'string'
        },
        team: {
            type: 'string'
        },
        year: {
            type: 'number'
        },
        brand: {
            type: 'string'
        },
        category: {
            type: 'string'
        },
        cardNumber: {
            type: 'string'
        },
        parallel: {
            type: 'string'
        },
        condition: {
            type: 'string'
        },
        gradingCompany: {
            type: 'string'
        },
        purchasePrice: {
            type: 'number'
        },
        purchaseDate: {
            type: 'string'
        },
        sellPrice: {
            type: 'number'
        },
        sellDate: {
            type: 'string'
        },
        currentValue: {
            type: 'number'
        },
        images: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        notes: {
            type: 'string'
        },
        createdAt: {
            type: 'string'
        },
        updatedAt: {
            type: 'string'
        }
    },
    required: ['id', 'player', 'team', 'year', 'brand', 'category', 'cardNumber', 'condition', 'purchasePrice', 'purchaseDate', 'currentValue', 'createdAt', 'updatedAt']
};
class RxDBDatabase {
    constructor() {
        this.db = null;
    }
    static getInstance() {
        if (!RxDBDatabase.instance) {
            RxDBDatabase.instance = new RxDBDatabase();
        }
        return RxDBDatabase.instance;
    }
    async init() {
        try {
            console.log('Initializing RxDB database...');
            // Create a unique database name to avoid conflicts
            const dbName = `sports-card-tracker-${Date.now()}`;
            this.db = await (0, rxdb_1.createRxDatabase)({
                name: dbName,
                storage: (0, storage_memory_1.getRxStorageMemory)(),
                ignoreDuplicate: true
            });
            // Add card collection
            await this.db.addCollections({
                cards: {
                    schema: cardSchema
                }
            });
            console.log('RxDB database initialized successfully');
        }
        catch (error) {
            console.error('Error initializing RxDB database:', error);
            throw error;
        }
    }
    ensureDatabase() {
        if (!this.db) {
            throw new Error('Database not initialized. Call init() first.');
        }
        return this.db;
    }
    async getAllCards() {
        try {
            const db = this.ensureDatabase();
            const cards = await db.cards.find().exec();
            return cards.map(doc => doc.toJSON()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        catch (error) {
            console.error('Error getting all cards:', error);
            throw error;
        }
    }
    async getCardById(id) {
        try {
            const db = this.ensureDatabase();
            const cardDoc = await db.cards.findOne(id).exec();
            return cardDoc ? cardDoc.toJSON() : undefined;
        }
        catch (error) {
            console.error('Error getting card by ID:', error);
            throw error;
        }
    }
    async createCard(cardInput) {
        try {
            const db = this.ensureDatabase();
            const id = (0, uuid_1.v4)();
            const now = new Date().toISOString();
            const card = {
                id,
                ...cardInput,
                createdAt: now,
                updatedAt: now
            };
            const insertedDoc = await db.cards.insert(card);
            return insertedDoc.toJSON();
        }
        catch (error) {
            console.error('Error creating card:', error);
            throw error;
        }
    }
    async updateCard(id, cardInput) {
        try {
            const db = this.ensureDatabase();
            const cardDoc = await db.cards.findOne(id).exec();
            if (!cardDoc) {
                return undefined;
            }
            const updatedAt = new Date().toISOString();
            const updatedCard = {
                ...cardInput,
                id,
                createdAt: cardDoc.createdAt,
                updatedAt
            };
            await cardDoc.patch(updatedCard);
            return cardDoc.toJSON();
        }
        catch (error) {
            console.error('Error updating card:', error);
            throw error;
        }
    }
    async deleteCard(id) {
        try {
            const db = this.ensureDatabase();
            const cardDoc = await db.cards.findOne(id).exec();
            if (!cardDoc) {
                return false;
            }
            await cardDoc.remove();
            return true;
        }
        catch (error) {
            console.error('Error deleting card:', error);
            throw error;
        }
    }
    async close() {
        if (this.db) {
            await this.db.remove();
            this.db = null;
        }
    }
}
RxDBDatabase.instance = null;
exports.default = RxDBDatabase;
//# sourceMappingURL=rxdb-database.js.map