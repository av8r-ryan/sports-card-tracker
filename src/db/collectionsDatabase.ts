import { supabase } from '../lib/supabase';
import { supabaseCollectionsDatabase } from './supabaseCollections';
import { supabaseCardDatabase } from './supabaseDatabase';
import { Collection } from '../types/collection';

// Helper to get current user id from stored session
function getCurrentUserId(): string {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.id || 'anonymous';
    } catch {}
  }
  const auth = localStorage.getItem('auth-state');
  if (auth) {
    try {
      const a = JSON.parse(auth);
      return a.user?.id || 'anonymous';
    } catch {}
  }
  return 'anonymous';
}

// Supabase-backed facade preserving the legacy API used across the app
export const collectionsDatabase = {
  async initializeUserCollections(userId: string): Promise<void> {
    return supabaseCollectionsDatabase.initializeUserCollections(userId);
  },

  async getUserCollections(): Promise<Collection[]> {
    // Legacy alias
    return supabaseCollectionsDatabase.getAllCollections();
  },

  async getCollectionById(id: string): Promise<Collection | null> {
    return supabaseCollectionsDatabase.getCollectionById(id);
  },

  async getDefaultCollection(): Promise<Collection | null> {
    return supabaseCollectionsDatabase.getDefaultCollection();
  },

  async createCollection(
    data: Omit<Collection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<Collection> {
    const userId = getCurrentUserId();
    const collection: Collection = {
      id: `collection-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      userId,
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
      isDefault: false,
      visibility: data.visibility,
      tags: data.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await supabaseCollectionsDatabase.addCollection(collection);
    return collection;
  },

  async updateCollection(id: string, data: Partial<Collection>): Promise<Collection | null> {
    const current = await supabaseCollectionsDatabase.getCollectionById(id);
    if (!current) return null;
    const merged: Collection = {
      ...current,
      ...data,
      updatedAt: new Date(),
    } as Collection;
    await supabaseCollectionsDatabase.updateCollection(merged);
    return merged;
  },

  async deleteCollection(id: string): Promise<boolean> {
    await supabaseCollectionsDatabase.deleteCollection(id);
    return true;
  },

  async getCollectionStats(collectionId: string): Promise<{
    cardCount: number;
    totalValue: number;
    totalCost: number;
    categoryBreakdown: { [category: string]: number };
  }> {
    const cards = await supabaseCardDatabase.getCardsByCollection(collectionId);
    const stats = {
      cardCount: cards.length,
      totalValue: cards.reduce((s, c) => s + (c.currentValue || 0), 0),
      totalCost: cards.reduce((s, c) => s + (c.purchasePrice || 0), 0),
      categoryBreakdown: {} as Record<string, number>,
    };
    for (const card of cards) {
      stats.categoryBreakdown[card.category] = (stats.categoryBreakdown[card.category] || 0) + 1;
    }
    return stats;
  },

  async setCollectionAsDefault(collectionId: string): Promise<void> {
    const userId = getCurrentUserId();
    // Unset existing default(s)
    await supabase.from('collections').update({ is_default: false }).eq('user_id', userId);
    // Set new default
    await supabase.from('collections').update({ is_default: true }).eq('id', collectionId).eq('user_id', userId);
  },

  async unsetCollectionAsDefault(_collectionId: string): Promise<void> {
    // No-op for now
    return;
  },

  async moveCardsToCollection(cardIds: string[], targetCollectionId: string): Promise<void> {
    const userId = getCurrentUserId();
    const { error } = await supabase
      .from('cards')
      .update({ collection_id: targetCollectionId })
      .in('id', cardIds)
      .eq('user_id', userId);
    if (error) throw error;
  },
};

// Legacy export retained for compatibility with old debug tooling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const collectionsDb: any = undefined;
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

  import { supabase } from '../lib/supabase';
  import { supabaseCollectionsDatabase } from './supabaseCollections';
  import { supabaseCardDatabase } from './supabaseDatabase';
  import { Collection } from '../types/collection';

  // Helper to get current user id
  function getCurrentUserId(): string {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || 'anonymous';
      } catch {}
    }
    const auth = localStorage.getItem('auth-state');
    if (auth) {
      try {
        const a = JSON.parse(auth);
        return a.user?.id || 'anonymous';
      } catch {}
    }
    return 'anonymous';
  }

  export const collectionsDatabase = {
    // Backwards-compatible APIs using Supabase under the hood
    async initializeUserCollections(userId: string): Promise<void> {
      return supabaseCollectionsDatabase.initializeUserCollections(userId);
    },

    async getUserCollections(): Promise<Collection[]> {
      return supabaseCollectionsDatabase.getAllCollections();
    },

    async getCollectionById(id: string): Promise<Collection | null> {
      return supabaseCollectionsDatabase.getCollectionById(id);
    },

    async getDefaultCollection(): Promise<Collection | null> {
      return supabaseCollectionsDatabase.getDefaultCollection();
    },

    async createCollection(
      data: Omit<Collection, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    ): Promise<Collection> {
      const userId = getCurrentUserId();
      const collection: Collection = {
        id: `collection-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        userId,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        isDefault: false,
        visibility: data.visibility,
        tags: data.tags,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await supabaseCollectionsDatabase.addCollection(collection);
      return collection;
    },

    async updateCollection(id: string, data: Partial<Collection>): Promise<Collection | null> {
      const current = await supabaseCollectionsDatabase.getCollectionById(id);
      if (!current) return null;
      const merged: Collection = {
        ...current,
        ...data,
        updatedAt: new Date(),
      } as Collection;
      await supabaseCollectionsDatabase.updateCollection(merged);
      return merged;
    },

    async deleteCollection(id: string): Promise<boolean> {
      await supabaseCollectionsDatabase.deleteCollection(id);
      return true;
    },

    async getCollectionStats(collectionId: string): Promise<{
      cardCount: number;
      totalValue: number;
      totalCost: number;
      categoryBreakdown: { [category: string]: number };
    }> {
      const cards = await supabaseCardDatabase.getCardsByCollection(collectionId);
      const stats = {
        cardCount: cards.length,
        totalValue: cards.reduce((s, c) => s + (c.currentValue || 0), 0),
        totalCost: cards.reduce((s, c) => s + (c.purchasePrice || 0), 0),
        categoryBreakdown: {} as Record<string, number>,
      };
      for (const card of cards) {
        stats.categoryBreakdown[card.category] = (stats.categoryBreakdown[card.category] || 0) + 1;
      }
      return stats;
    },

    async setCollectionAsDefault(collectionId: string): Promise<void> {
      const userId = getCurrentUserId();
      // Unset existing defaults
      await supabase.from('collections').update({ is_default: false }).eq('user_id', userId);
      // Set new default
      await supabase.from('collections').update({ is_default: true }).eq('id', collectionId).eq('user_id', userId);
    },

    async unsetCollectionAsDefault(_collectionId: string): Promise<void> {
      // Optional: Keep no-op or ensure another default exists; for now no-op to preserve behavior
      return;
    },

    async moveCardsToCollection(cardIds: string[], targetCollectionId: string): Promise<void> {
      const userId = getCurrentUserId();
      const { error } = await supabase
        .from('cards')
        .update({ collection_id: targetCollectionId })
        .in('id', cardIds)
        .eq('user_id', userId);
      if (error) throw error;
    },
  };

  // Legacy export retained for compatibility with debug tooling
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const collectionsDb: any = undefined;
    }
