import sqlite3 from 'sqlite3';
import { Card, CardInput } from './types';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

sqlite3.verbose();

class Database {
  private db: sqlite3.Database;

  constructor() {
    const dbPath = path.join(__dirname, '../database.sqlite');
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.initTables();
      }
    });
  }

  private initTables(): void {
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
      } else {
        console.log('Cards table ready');
      }
    });
  }

  public getAllCards(): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM cards ORDER BY createdAt DESC', (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          // Convert database rows to Card objects with proper types
          const cards: Card[] = rows.map(row => ({
            ...row,
            images: JSON.parse(row.images || '[]')
          }));
          resolve(cards);
        }
      });
    });
  }

  public getCardById(id: string): Promise<Card | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM cards WHERE id = ?', [id], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            resolve({
              ...row,
              images: JSON.parse(row.images || '[]')
            });
          } else {
            resolve(undefined);
          }
        }
      });
    });
  }

  public createCard(cardInput: CardInput): Promise<Card> {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const card: Card = {
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

      this.db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(card);
        }
      });
    });
  }

  public updateCard(id: string, cardInput: CardInput): Promise<Card | undefined> {
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

      this.db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            // Return the updated card
            resolve({
              id,
              ...cardInput,
              images: cardInput.images, // Keep as array for type consistency
              createdAt: new Date().toISOString(),
              updatedAt
            } as Card);
          } else {
            resolve(undefined);
          }
        }
      });
    });
  }

  public deleteCard(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM cards WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  public close(): void {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

export default Database;