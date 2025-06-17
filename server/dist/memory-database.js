"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class MemoryDatabase {
    constructor() {
        this.cards = new Map();
    }
    static getInstance() {
        if (!MemoryDatabase.instance) {
            MemoryDatabase.instance = new MemoryDatabase();
        }
        return MemoryDatabase.instance;
    }
    async init() {
        console.log('Initializing in-memory database...');
        // Initialize with empty state
        this.cards.clear();
        console.log('In-memory database ready');
    }
    async getAllCards() {
        try {
            const cards = Array.from(this.cards.values());
            return cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        catch (error) {
            console.error('Error getting all cards:', error);
            throw error;
        }
    }
    async getCardById(id) {
        try {
            return this.cards.get(id);
        }
        catch (error) {
            console.error('Error getting card by ID:', error);
            throw error;
        }
    }
    async createCard(cardInput) {
        try {
            const id = (0, uuid_1.v4)();
            const now = new Date().toISOString();
            const card = {
                id,
                ...cardInput,
                createdAt: now,
                updatedAt: now
            };
            this.cards.set(id, card);
            console.log(`Created card: ${card.player} - ${card.year}`);
            return card;
        }
        catch (error) {
            console.error('Error creating card:', error);
            throw error;
        }
    }
    async updateCard(id, cardInput) {
        try {
            const existingCard = this.cards.get(id);
            if (!existingCard) {
                return undefined;
            }
            const updatedAt = new Date().toISOString();
            const updatedCard = {
                ...cardInput,
                id,
                createdAt: existingCard.createdAt,
                updatedAt
            };
            this.cards.set(id, updatedCard);
            console.log(`Updated card: ${updatedCard.player} - ${updatedCard.year}`);
            return updatedCard;
        }
        catch (error) {
            console.error('Error updating card:', error);
            throw error;
        }
    }
    async deleteCard(id) {
        try {
            const existed = this.cards.has(id);
            if (existed) {
                this.cards.delete(id);
                console.log(`Deleted card: ${id}`);
            }
            return existed;
        }
        catch (error) {
            console.error('Error deleting card:', error);
            throw error;
        }
    }
    async close() {
        // Nothing to close for in-memory database
        this.cards.clear();
    }
    // Utility method to get database stats
    getStats() {
        return {
            totalCards: this.cards.size,
            memoryUsage: `${this.cards.size} cards in memory`
        };
    }
}
MemoryDatabase.instance = null;
exports.default = MemoryDatabase;
//# sourceMappingURL=memory-database.js.map