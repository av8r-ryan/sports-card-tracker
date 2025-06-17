"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
sqlite3_1.default.verbose();
class Database {
    constructor() {
        const dbPath = path_1.default.join(__dirname, '../database.sqlite');
        this.db = new sqlite3_1.default.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err);
            }
            else {
                console.log('Connected to SQLite database');
                this.initTables();
            }
        });
    }
    initTables() {
        const createCardsTable = `
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        player TEXT NOT NULL,
        team TEXT NOT NULL,
        year INTEGER NOT NULL,
        brand TEXT NOT NULL,
        category TEXT NOT NULL,
        cardNumber TEXT NOT NULL,
        parallel TEXT,
        condition TEXT NOT NULL,
        gradingCompany TEXT,
        purchasePrice REAL NOT NULL,
        purchaseDate TEXT NOT NULL,
        sellPrice REAL,
        sellDate TEXT,
        currentValue REAL NOT NULL,
        images TEXT NOT NULL DEFAULT '[]',
        notes TEXT NOT NULL DEFAULT '',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `;
        this.db.run(createCardsTable, (err) => {
            if (err) {
                console.error('Error creating cards table:', err);
            }
            else {
                console.log('Cards table ready');
            }
        });
    }
    getAllCards() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM cards ORDER BY createdAt DESC', (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    // Convert database rows to Card objects with proper types
                    const cards = rows.map(row => ({
                        ...row,
                        images: JSON.parse(row.images || '[]')
                    }));
                    resolve(cards);
                }
            });
        });
    }
    getCardById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM cards WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    if (row) {
                        resolve({
                            ...row,
                            images: JSON.parse(row.images || '[]')
                        });
                    }
                    else {
                        resolve(undefined);
                    }
                }
            });
        });
    }
    createCard(cardInput) {
        return new Promise((resolve, reject) => {
            const id = (0, uuid_1.v4)();
            const now = new Date().toISOString();
            const card = {
                id,
                ...cardInput,
                images: cardInput.images, // Keep as array for type consistency
                createdAt: now,
                updatedAt: now
            };
            const sql = `
        INSERT INTO cards (
          id, player, team, year, brand, category, cardNumber, parallel, 
          condition, gradingCompany, purchasePrice, purchaseDate, sellPrice, 
          sellDate, currentValue, images, notes, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const values = [
                card.id, card.player, card.team, card.year, card.brand, card.category,
                card.cardNumber, card.parallel, card.condition, card.gradingCompany,
                card.purchasePrice, card.purchaseDate, card.sellPrice, card.sellDate,
                card.currentValue, JSON.stringify(card.images), card.notes, card.createdAt, card.updatedAt
            ];
            this.db.run(sql, values, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(card);
                }
            });
        });
    }
    updateCard(id, cardInput) {
        return new Promise((resolve, reject) => {
            const updatedAt = new Date().toISOString();
            const sql = `
        UPDATE cards SET 
          player = ?, team = ?, year = ?, brand = ?, category = ?, cardNumber = ?,
          parallel = ?, condition = ?, gradingCompany = ?, purchasePrice = ?,
          purchaseDate = ?, sellPrice = ?, sellDate = ?, currentValue = ?,
          images = ?, notes = ?, updatedAt = ?
        WHERE id = ?
      `;
            const values = [
                cardInput.player, cardInput.team, cardInput.year, cardInput.brand,
                cardInput.category, cardInput.cardNumber, cardInput.parallel,
                cardInput.condition, cardInput.gradingCompany, cardInput.purchasePrice,
                cardInput.purchaseDate, cardInput.sellPrice, cardInput.sellDate,
                cardInput.currentValue, JSON.stringify(cardInput.images), cardInput.notes,
                updatedAt, id
            ];
            this.db.run(sql, values, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    if (this.changes > 0) {
                        // Return the updated card
                        resolve({
                            id,
                            ...cardInput,
                            images: cardInput.images, // Keep as array for type consistency
                            createdAt: new Date().toISOString(),
                            updatedAt
                        });
                    }
                    else {
                        resolve(undefined);
                    }
                }
            });
        });
    }
    deleteCard(id) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM cards WHERE id = ?', [id], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this.changes > 0);
                }
            });
        });
    }
    close() {
        this.db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            }
            else {
                console.log('Database connection closed');
            }
        });
    }
}
exports.default = Database;
//# sourceMappingURL=database.js.map