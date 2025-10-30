import Dexie, { Table } from 'dexie';

import { Collection } from '../types/collection';

class CollectionsDatabase extends Dexie {
  collections!: Table<Collection>;

  constructor() {
    super('CollectionsDatabase');

    // Define schema
    this.version(1).stores({
      collections: 'id, userId, name, isDefault, [userId+name], [userId+isDefault], createdAt',
    });
  }
}

const db = new CollectionsDatabase();

// Get current user ID from auth state
function getCurrentUserId(): string {
  // First check the 'user' localStorage item
  const userStr = localStorage.getItem('user');

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const userId = user.id || 'anonymous';
      return userId;
    } catch (e) {
      console.error('[collectionsDB getCurrentUserId] Error parsing user:', e);
    }
  }

  // Fall back to auth-state
  const authDataStr = localStorage.getItem('auth-state');

  if (authDataStr) {
    try {
      const authData = JSON.parse(authDataStr);
      const userId = authData.user?.id || 'anonymous';
      return userId;
    } catch (e) {
      console.error('[collectionsDB getCurrentUserId] Error parsing auth-state:', e);
      return 'anonymous';
    }
  }

  return 'anonymous';
}

export const collectionsDatabase = {
  // Initialize default collection for user
  async initializeUserCollections(userId: string): Promise<void> {
    try {
      console.log('[CollectionsDB] Initializing collections for user:', userId);

      // Check if user already has a default collection
      const existingDefault = await db.collections
        .where('userId')
        .equals(userId)
        .and((collection) => collection.isDefault === true)
        .first();

      console.log('[CollectionsDB] Existing default collection:', existingDefault);

      if (!existingDefault) {
        console.log('[CollectionsDB] Creating default collection...');

        // Create default collection
        const defaultCollection: Collection = {
          id: `collection-default-${userId}`,
          userId,
          name: 'My Collection',
          description: 'Default collection for all cards',
          color: '#4F46E5',
          icon: '📦',
          isDefault: true,
          visibility: 'private',
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.collections.add(defaultCollection);
        console.log('[CollectionsDB] Default collection created successfully');
      } else {
        console.log('[CollectionsDB] Default collection already exists');
      }
    } catch (error) {
      console.error('[CollectionsDB] Error initializing user collections:', error);
      // Don't re-throw the error - just log it and continue
      console.warn('[CollectionsDB] Continuing without collections initialization');
    }
  },

  // Get all collections for current user
  async getUserCollections(): Promise<Collection[]> {
    try {
      const userId = getCurrentUserId();
      const collections = await db.collections.where('userId').equals(userId).toArray();

      // Sort by default first, then by name
      return collections.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error getting user collections:', error);
      return [];
    }
  },

  // Get collection by ID
  async getCollectionById(id: string): Promise<Collection | null> {
    try {
      const collection = await db.collections.get(id);
      if (collection && collection.userId === getCurrentUserId()) {
        return collection;
      }
      return null;
    } catch (error) {
      console.error('Error getting collection:', error);
      return null;
    }
  },

  // Get default collection for current user
  async getDefaultCollection(): Promise<Collection | null> {
    try {
      const userId = getCurrentUserId();
      console.log('[getDefaultCollection] Getting default collection for userId:', userId);

      const defaultCollection = await db.collections
        .where('userId')
        .equals(userId)
        .and((collection) => collection.isDefault === true)
        .first();

      console.log('[getDefaultCollection] Found default collection:', defaultCollection);

      if (!defaultCollection) {
        console.log('[getDefaultCollection] No default collection found, initializing...');
        // Initialize if not found
        await this.initializeUserCollections(userId);
        const newDefault =
          (await db.collections
            .where('userId')
            .equals(userId)
            .and((collection) => collection.isDefault === true)
            .first()) || null;
        console.log('[getDefaultCollection] Created new default collection:', newDefault);
        return newDefault;
      }

      return defaultCollection;
    } catch (error) {
      console.error('[getDefaultCollection] Error getting default collection:', error);
      return null;
    }
  },

  // Create new collection
  async createCollection(
    collectionData: Omit<Collection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<Collection> {
    try {
      const userId = getCurrentUserId();

      // Check if name already exists for this user
      const existing = await db.collections
        .where('userId')
        .equals(userId)
        .and((collection) => collection.name === collectionData.name)
        .first();

      if (existing) {
        throw new Error('Collection with this name already exists');
      }

      const newCollection: Collection = {
        ...collectionData,
        id: `collection-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        userId,
        isDefault: false, // New collections are never default
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collections.add(newCollection);
      return newCollection;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  },

  // Update collection
  async updateCollection(
    id: string,
    updates: Partial<Omit<Collection, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Collection | null> {
    try {
      const collection = await this.getCollectionById(id);
      if (!collection) {
        throw new Error('Collection not found');
      }

      // Prevent changing default collection's isDefault status
      if (collection.isDefault && updates.hasOwnProperty('isDefault') && !updates.isDefault) {
        throw new Error('Cannot remove default status from default collection');
      }

      // Check for duplicate names
      if (updates.name && updates.name !== collection.name) {
        const existing = await db.collections
          .where('userId')
          .equals(collection.userId)
          .and((col) => col.name === updates.name)
          .first();

        if (existing) {
          throw new Error('Collection with this name already exists');
        }
      }

      const updatedCollection = {
        ...collection,
        ...updates,
        updatedAt: new Date(),
      };

      await db.collections.put(updatedCollection);
      return updatedCollection;
    } catch (error) {
      console.error('Error updating collection:', error);
      throw error;
    }
  },

  // Delete collection
  async deleteCollection(id: string): Promise<boolean> {
    try {
      const collection = await this.getCollectionById(id);
      if (!collection) {
        throw new Error('Collection not found');
      }

      if (collection.isDefault) {
        throw new Error('Cannot delete default collection');
      }

      // Check if collection has cards
      const { cardDatabase } = await import('./simpleDatabase');
      const cards = await cardDatabase.getAllCards(id);

      if (cards.length > 0) {
        throw new Error(`Cannot delete collection with ${cards.length} cards. Move or delete cards first.`);
      }

      await db.collections.delete(id);
      return true;
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  },

  // Get collection statistics
  async getCollectionStats(collectionId: string): Promise<{
    cardCount: number;
    totalValue: number;
    totalCost: number;
    categoryBreakdown: { [category: string]: number };
  }> {
    try {
      const { cardDatabase } = await import('./simpleDatabase');
      const cards = await cardDatabase.getAllCards();
      const collectionCards = cards.filter((card) => card.collectionId === collectionId);

      const stats = {
        cardCount: collectionCards.length,
        totalValue: collectionCards.reduce((sum, card) => sum + card.currentValue, 0),
        totalCost: collectionCards.reduce((sum, card) => sum + card.purchasePrice, 0),
        categoryBreakdown: {} as { [category: string]: number },
      };

      // Calculate category breakdown
      collectionCards.forEach((card) => {
        stats.categoryBreakdown[card.category] = (stats.categoryBreakdown[card.category] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting collection stats:', error);
      return {
        cardCount: 0,
        totalValue: 0,
        totalCost: 0,
        categoryBreakdown: {},
      };
    }
  },

  // Set collection as default
  async setCollectionAsDefault(collectionId: string): Promise<void> {
    try {
      const collection = await this.getCollectionById(collectionId);
      if (!collection) {
        throw new Error('Collection not found');
      }

      const userId = collection.userId;

      // Start a transaction to ensure atomicity
      await db.transaction('rw', db.collections, async () => {
        // First, unset any existing default collection for this user
        const currentDefault = await db.collections
          .where('userId')
          .equals(userId)
          .and((col) => col.isDefault === true)
          .first();

        if (currentDefault && currentDefault.id !== collectionId) {
          await db.collections.update(currentDefault.id, { isDefault: false });
        }

        // Then set the new collection as default
        await db.collections.update(collectionId, { isDefault: true });
      });
    } catch (error) {
      console.error('Error setting default collection:', error);
      throw error;
    }
  },

  // Unset collection as default (only if another collection exists)
  async unsetCollectionAsDefault(collectionId: string): Promise<void> {
    try {
      const collection = await this.getCollectionById(collectionId);
      if (!collection) {
        throw new Error('Collection not found');
      }

      if (!collection.isDefault) {
        throw new Error('Collection is not currently set as default');
      }

      const userId = collection.userId;

      // Check if there are other collections
      const allCollections = await db.collections.where('userId').equals(userId).toArray();

      if (allCollections.length <= 1) {
        throw new Error('Cannot unset default when only one collection exists');
      }

      // Start a transaction
      await db.transaction('rw', db.collections, async () => {
        // Unset current default
        await db.collections.update(collectionId, { isDefault: false });

        // Set the first other collection as default
        const otherCollection = allCollections.find((c) => c.id !== collectionId);
        if (otherCollection) {
          await db.collections.update(otherCollection.id, { isDefault: true });
        }
      });
    } catch (error) {
      console.error('Error unsetting default collection:', error);
      throw error;
    }
  },

  // Move cards to different collection
  async moveCardsToCollection(cardIds: string[], targetCollectionId: string): Promise<void> {
    try {
      console.log('[moveCardsToCollection] Moving cards:', cardIds, 'to collection:', targetCollectionId);
      const { cardDatabase } = await import('./simpleDatabase');

      // Verify target collection exists and belongs to user
      const targetCollection = await this.getCollectionById(targetCollectionId);
      if (!targetCollection) {
        throw new Error('Target collection not found');
      }
      console.log('[moveCardsToCollection] Target collection found:', targetCollection.name);

      // Update each card
      for (const cardId of cardIds) {
        const card = await cardDatabase.getAllCards().then((cards) => cards.find((c) => c.id === cardId));

        console.log('[moveCardsToCollection] Found card:', card?.id, 'current collectionId:', card?.collectionId);

        if (card && card.userId === getCurrentUserId()) {
          console.log('[moveCardsToCollection] Updating card', cardId, 'to collection', targetCollectionId);
          const updatedCard = {
            ...card,
            collectionId: targetCollectionId,
          };
          console.log('[moveCardsToCollection] Card object to update:', updatedCard);
          await cardDatabase.updateCard(updatedCard);
          console.log('[moveCardsToCollection] Card updated successfully');

          // Verify the update
          const verifyCard = await cardDatabase.getAllCards().then((cards) => cards.find((c) => c.id === cardId));
          console.log(
            '[moveCardsToCollection] Verification - card collectionId after update:',
            verifyCard?.collectionId
          );
        } else {
          console.log('[moveCardsToCollection] Card not found or user mismatch for cardId:', cardId);
        }
      }
    } catch (error) {
      console.error('Error moving cards:', error);
      throw error;
    }
  },
};

// Export the db instance for direct access if needed
export { db as collectionsDb };
