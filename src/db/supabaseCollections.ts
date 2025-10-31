import { supabase } from '../lib/supabase';
import { Collection } from '../types';

// Helper to convert Collection to database format
function collectionToDbFormat(collection: Collection, userId: string) {
  return {
    id: collection.id,
    user_id: userId,
    name: collection.name,
    description: collection.description || null,
    is_default: collection.isDefault || false,
  };
}

// Helper to convert database row to Collection
function dbToCollection(row: any): Collection {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    isDefault: row.is_default,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// Get current user ID
function getCurrentUserId(): string {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.id || 'anonymous';
    } catch (e) {
      console.error('[getCurrentUserId] Error parsing user:', e);
    }
  }

  const authDataStr = localStorage.getItem('auth-state');
  if (authDataStr) {
    try {
      const authData = JSON.parse(authDataStr);
      return authData.user?.id || 'anonymous';
    } catch (e) {
      console.error('[getCurrentUserId] Error parsing auth-state:', e);
      return 'anonymous';
    }
  }

  return 'anonymous';
}

export const supabaseCollectionsDatabase = {
  // Get all collections for current user
  async getAllCollections(): Promise<Collection[]> {
    try {
      const userId = getCurrentUserId();
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[getAllCollections] Supabase error:', error);
        throw error;
      }

      return (data || []).map(dbToCollection);
    } catch (error) {
      console.error('[getAllCollections] Error:', error);
      throw error;
    }
  },

  // Get collection by ID
  async getCollectionById(id: string): Promise<Collection | null> {
    try {
      const userId = getCurrentUserId();
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data ? dbToCollection(data) : null;
    } catch (error) {
      console.error('[getCollectionById] Error:', error);
      throw error;
    }
  },

  // Get default collection
  async getDefaultCollection(): Promise<Collection | null> {
    try {
      const userId = getCurrentUserId();
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data ? dbToCollection(data) : null;
    } catch (error) {
      console.error('[getDefaultCollection] Error:', error);
      throw error;
    }
  },

  // Add new collection
  async addCollection(collection: Collection): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const dbCollection = collectionToDbFormat(collection, userId);

      const { error } = await supabase.from('collections').insert([dbCollection]);

      if (error) {
        console.error('[addCollection] Supabase error:', error);
        throw error;
      }

      console.log('[addCollection] Collection added:', collection.id);
    } catch (error) {
      console.error('[addCollection] Error:', error);
      throw error;
    }
  },

  // Update collection
  async updateCollection(collection: Collection): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const dbCollection = collectionToDbFormat(collection, userId);

      const { error } = await supabase
        .from('collections')
        .update(dbCollection)
        .eq('id', collection.id)
        .eq('user_id', userId);

      if (error) {
        console.error('[updateCollection] Supabase error:', error);
        throw error;
      }

      console.log('[updateCollection] Collection updated:', collection.id);
    } catch (error) {
      console.error('[updateCollection] Error:', error);
      throw error;
    }
  },

  // Delete collection
  async deleteCollection(id: string): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const { error } = await supabase.from('collections').delete().eq('id', id).eq('user_id', userId);

      if (error) {
        console.error('[deleteCollection] Supabase error:', error);
        throw error;
      }

      console.log('[deleteCollection] Collection deleted:', id);
    } catch (error) {
      console.error('[deleteCollection] Error:', error);
      throw error;
    }
  },

  // Initialize user collections (create default if none exist)
  async initializeUserCollections(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase.from('collections').select('*').eq('user_id', userId).limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        const defaultCollection = {
          id: `collection-${Date.now()}`,
          user_id: userId,
          name: 'My Collection',
          description: 'Default collection',
          is_default: true,
        };

        const { error: insertError } = await supabase.from('collections').insert([defaultCollection]);

        if (insertError) throw insertError;

        console.log('[initializeUserCollections] Default collection created');
      }
    } catch (error) {
      console.error('[initializeUserCollections] Error:', error);
      throw error;
    }
  },

  // Clear all collections
  async clearAllCollections(): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const { error } = await supabase.from('collections').delete().eq('user_id', userId);

      if (error) {
        console.error('[clearAllCollections] Supabase error:', error);
        throw error;
      }

      console.log('[clearAllCollections] All collections cleared');
    } catch (error) {
      console.error('[clearAllCollections] Error:', error);
      throw error;
    }
  },
};
