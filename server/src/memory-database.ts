import { v4 as uuidv4 } from 'uuid';
import { Card, CardInput } from './types';

class MemoryDatabase {
  private cards: Map<string, Card> = new Map();
  private static instance: MemoryDatabase | null = null;

  public static getInstance(): MemoryDatabase {
    if (!MemoryDatabase.instance) {
      MemoryDatabase.instance = new MemoryDatabase();
    }
    return MemoryDatabase.instance;
  }

  async init(): Promise<void> {
    console.log('Initializing in-memory database...');
    // Initialize with empty state
    this.cards.clear();
    console.log('In-memory database ready');
  }

  public async getAllCards(): Promise<Card[]> {
    try {
      const cards = Array.from(this.cards.values());
      return cards.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting all cards:', error);
      throw error;
    }
  }

  public async getCardById(id: string): Promise<Card | undefined> {
    try {
      return this.cards.get(id);
    } catch (error) {
      console.error('Error getting card by ID:', error);
      throw error;
    }
  }

  public async createCard(cardInput: CardInput): Promise<Card> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const card: Card = {
        id,
        ...cardInput,
        createdAt: now,
        updatedAt: now
      };

      this.cards.set(id, card);
      console.log(`Created card: ${card.player} - ${card.year}`);
      return card;
    } catch (error) {
      console.error('Error creating card:', error);
      throw error;
    }
  }

  public async updateCard(id: string, cardInput: CardInput): Promise<Card | undefined> {
    try {
      const existingCard = this.cards.get(id);
      
      if (!existingCard) {
        return undefined;
      }

      const updatedAt = new Date().toISOString();
      const updatedCard: Card = {
        ...cardInput,
        id,
        createdAt: existingCard.createdAt,
        updatedAt
      };

      this.cards.set(id, updatedCard);
      console.log(`Updated card: ${updatedCard.player} - ${updatedCard.year}`);
      return updatedCard;
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  }

  public async deleteCard(id: string): Promise<boolean> {
    try {
      const existed = this.cards.has(id);
      if (existed) {
        this.cards.delete(id);
        console.log(`Deleted card: ${id}`);
      }
      return existed;
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    // Nothing to close for in-memory database
    this.cards.clear();
  }

  // Utility method to get database stats
  public getStats(): { totalCards: number; memoryUsage: string } {
    return {
      totalCards: this.cards.size,
      memoryUsage: `${this.cards.size} cards in memory`
    };
  }
}

export default MemoryDatabase;