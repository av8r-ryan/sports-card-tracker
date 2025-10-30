import { Card } from '../types';
import { logInfo, logError } from './logger';

interface SeedData {
  version: string;
  cards: Card[];
  lastUpdated: string;
}

const SEED_DATA_URL = '/seed-data/cards.json';
const SEED_VERSION_KEY = 'seed-data-version';

class SeedDataManager {
  /**
   * Export all cards from IndexedDB to JSON format
   * Use this to create seed-data/cards.json
   */
  async exportCardsToJSON(): Promise<string> {
    try {
      logInfo('SeedDataManager', 'Exporting cards from IndexedDB');

      // Lazy import to avoid circular dependency
      const { cardDatabase } = await import('../db/simpleDatabase');
      const allCards = await cardDatabase.getAllCards();

      const seedData: SeedData = {
        version: '1.0.0',
        cards: allCards,
        lastUpdated: new Date().toISOString(),
      };

      const jsonString = JSON.stringify(seedData, null, 2);

      logInfo('SeedDataManager', `Exported ${allCards.length} cards to JSON`, {
        cardCount: allCards.length,
        jsonSize: `${(jsonString.length / 1024).toFixed(2)} KB`,
      });

      return jsonString;
    } catch (error) {
      logError('SeedDataManager', 'Failed to export cards', error as Error);
      throw error;
    }
  }

  /**
   * Download cards as JSON file
   */
  async downloadCardsAsJSON(): Promise<void> {
    try {
      const jsonString = await this.exportCardsToJSON();

      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cards-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logInfo('SeedDataManager', 'Cards downloaded successfully');
    } catch (error) {
      logError('SeedDataManager', 'Failed to download cards', error as Error);
      throw error;
    }
  }

  /**
   * Load seed data from static JSON file
   */
  async loadSeedData(): Promise<SeedData | null> {
    try {
      logInfo('SeedDataManager', 'Fetching seed data from static file');

      const response = await fetch(SEED_DATA_URL);

      if (!response.ok) {
        if (response.status === 404) {
          logInfo('SeedDataManager', 'No seed data file found - skipping import');
          return null;
        }
        throw new Error(`Failed to fetch seed data: ${response.statusText}`);
      }

      const seedData: SeedData = await response.json();

      logInfo('SeedDataManager', 'Seed data loaded successfully', {
        version: seedData.version,
        cardCount: seedData.cards.length,
        lastUpdated: seedData.lastUpdated,
      });

      return seedData;
    } catch (error) {
      logError('SeedDataManager', 'Failed to load seed data', error as Error);
      return null;
    }
  }

  /**
   * Check if seed data should be imported
   */
  async shouldImportSeedData(): Promise<boolean> {
    try {
      // Check if we've already imported this version
      const importedVersion = localStorage.getItem(SEED_VERSION_KEY);

      // Lazy import to avoid circular dependency
      const { cardDatabase } = await import('../db/simpleDatabase');

      // Check if there are any cards in the database
      const existingCards = await cardDatabase.getAllCards();

      // Import if no cards exist or version has changed
      return existingCards.length === 0 || !importedVersion;
    } catch (error) {
      logError('SeedDataManager', 'Failed to check seed data status', error as Error);
      return false;
    }
  }

  /**
   * Import seed data into IndexedDB
   */
  async importSeedData(userId: string): Promise<number> {
    try {
      const shouldImport = await this.shouldImportSeedData();

      if (!shouldImport) {
        logInfo('SeedDataManager', 'Seed data already imported - skipping');
        return 0;
      }

      const seedData = await this.loadSeedData();

      if (!seedData) {
        logInfo('SeedDataManager', 'No seed data available to import');
        return 0;
      }

      logInfo('SeedDataManager', 'Starting seed data import', {
        userId,
        cardCount: seedData.cards.length,
      });

      // Lazy import to avoid circular dependency
      const { cardDatabase } = await import('../db/simpleDatabase');

      let importedCount = 0;

      // Import cards with the current user's ID
      for (const card of seedData.cards) {
        try {
          // Update the card with current user's ID
          const cardToImport = {
            ...card,
            userId,
            id: `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          };

          await cardDatabase.addCard(cardToImport);
          importedCount++;
        } catch (error) {
          logError('SeedDataManager', 'Failed to import card', error as Error, { card });
        }
      }

      // Mark this version as imported
      localStorage.setItem(SEED_VERSION_KEY, seedData.version);

      logInfo('SeedDataManager', 'Seed data import completed', {
        imported: importedCount,
        total: seedData.cards.length,
      });

      return importedCount;
    } catch (error) {
      logError('SeedDataManager', 'Failed to import seed data', error as Error);
      throw error;
    }
  }

  /**
   * Reset seed data import flag (for testing)
   */
  resetImportFlag(): void {
    localStorage.removeItem(SEED_VERSION_KEY);
    logInfo('SeedDataManager', 'Reset seed data import flag');
  }
}

export const seedDataManager = new SeedDataManager();

// Expose debug functions in development
if (process.env.NODE_ENV === 'development') {
  (window as any).seedData = {
    export: () => seedDataManager.exportCardsToJSON(),
    download: () => seedDataManager.downloadCardsAsJSON(),
    import: (userId: string) => seedDataManager.importSeedData(userId),
    reset: () => seedDataManager.resetImportFlag(),
  };
}
