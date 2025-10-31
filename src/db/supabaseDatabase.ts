import { supabase } from '../lib/supabase';
import { Card } from '../types';

// Helper to convert Card to database format
function cardToDbFormat(card: Card, userId: string) {
  return {
    id: card.id,
    user_id: userId,
    collection_id: card.collectionId || null,
    player: card.player,
    year: card.year,
    brand: card.brand,
    card_number: card.cardNumber || null,
    category: card.category,
    team: card.team || null,
    condition: card.condition || null,
    grading_company: card.gradingCompany || null,
    grade: card.grade || null,
    cert_number: card.certNumber || null,
    purchase_price: card.purchasePrice || null,
    current_value: card.currentValue || null,
    purchase_date: card.purchaseDate ? card.purchaseDate.toISOString().split('T')[0] : null,
    sell_price: card.sellPrice || null,
    sell_date: card.sellDate ? card.sellDate.toISOString().split('T')[0] : null,
    notes: card.notes || null,
    image_url: card.imageUrl || null,
    image_front: card.imageFront || null,
    image_back: card.imageBack || null,
  };
}

// Helper to convert database row to Card
function dbToCard(row: any): Card {
  return {
    id: row.id,
    userId: row.user_id,
    collectionId: row.collection_id,
    player: row.player,
    year: row.year,
    brand: row.brand,
    cardNumber: row.card_number,
    category: row.category,
    team: row.team,
    condition: row.condition,
    gradingCompany: row.grading_company,
    grade: row.grade,
    certNumber: row.cert_number,
    purchasePrice: row.purchase_price ? parseFloat(row.purchase_price) : undefined,
    currentValue: row.current_value ? parseFloat(row.current_value) : undefined,
    purchaseDate: row.purchase_date ? new Date(row.purchase_date) : new Date(),
    sellPrice: row.sell_price ? parseFloat(row.sell_price) : undefined,
    sellDate: row.sell_date ? new Date(row.sell_date) : undefined,
    notes: row.notes,
    imageUrl: row.image_url,
    imageFront: row.image_front,
    imageBack: row.image_back,
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

export const supabaseCardDatabase = {
  // Get all cards for current user
  async getAllCards(collectionId?: string): Promise<Card[]> {
    try {
      const userId = getCurrentUserId();
      console.log('[getAllCards] Getting cards for userId:', userId);

      let query = supabase.from('cards').select('*').eq('user_id', userId).order('created_at', { ascending: false });

      if (collectionId) {
        query = query.eq('collection_id', collectionId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[getAllCards] Supabase error:', error);
        throw error;
      }

      console.log('[getAllCards] Found cards:', data?.length || 0);
      return (data || []).map(dbToCard);
    } catch (error) {
      console.error('[getAllCards] Error:', error);
      throw error;
    }
  },

  // Get card by ID
  async getCardById(id: string): Promise<Card | null> {
    try {
      const userId = getCurrentUserId();
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data ? dbToCard(data) : null;
    } catch (error) {
      console.error('[getCardById] Error:', error);
      throw error;
    }
  },

  // Add new card
  async addCard(card: Card): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const dbCard = cardToDbFormat(card, userId);

      const { error } = await supabase.from('cards').insert([dbCard]);

      if (error) {
        console.error('[addCard] Supabase error:', error);
        throw error;
      }

      console.log('[addCard] Card added successfully:', card.id);
    } catch (error) {
      console.error('[addCard] Error:', error);
      throw error;
    }
  },

  // Update existing card
  async updateCard(card: Card): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const dbCard = cardToDbFormat(card, userId);

      const { error } = await supabase.from('cards').update(dbCard).eq('id', card.id).eq('user_id', userId);

      if (error) {
        console.error('[updateCard] Supabase error:', error);
        throw error;
      }

      console.log('[updateCard] Card updated successfully:', card.id);
    } catch (error) {
      console.error('[updateCard] Error:', error);
      throw error;
    }
  },

  // Delete card
  async deleteCard(id: string): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const { error } = await supabase.from('cards').delete().eq('id', id).eq('user_id', userId);

      if (error) {
        console.error('[deleteCard] Supabase error:', error);
        throw error;
      }

      console.log('[deleteCard] Card deleted successfully:', id);
    } catch (error) {
      console.error('[deleteCard] Error:', error);
      throw error;
    }
  },

  // Bulk add cards
  async addCards(cards: Card[]): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const dbCards = cards.map((card) => cardToDbFormat(card, userId));

      const { error } = await supabase.from('cards').insert(dbCards);

      if (error) {
        console.error('[addCards] Supabase error:', error);
        throw error;
      }

      console.log('[addCards] Cards added successfully:', cards.length);
    } catch (error) {
      console.error('[addCards] Error:', error);
      throw error;
    }
  },

  // Clear all cards for current user
  async clearAllCards(): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const { error } = await supabase.from('cards').delete().eq('user_id', userId);

      if (error) {
        console.error('[clearAllCards] Supabase error:', error);
        throw error;
      }

      console.log('[clearAllCards] All cards cleared');
    } catch (error) {
      console.error('[clearAllCards] Error:', error);
      throw error;
    }
  },

  // Move card to different collection
  async moveCardToCollection(cardId: string, collectionId: string | null): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const { error } = await supabase
        .from('cards')
        .update({ collection_id: collectionId })
        .eq('id', cardId)
        .eq('user_id', userId);

      if (error) {
        console.error('[moveCardToCollection] Supabase error:', error);
        throw error;
      }

      console.log('[moveCardToCollection] Card moved:', cardId, 'to collection:', collectionId);
    } catch (error) {
      console.error('[moveCardToCollection] Error:', error);
      throw error;
    }
  },

  // Get cards by collection
  async getCardsByCollection(collectionId: string): Promise<Card[]> {
    return this.getAllCards(collectionId);
  },

  // Search cards
  async searchCards(query: string): Promise<Card[]> {
    try {
      const userId = getCurrentUserId();
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId)
        .or(`player.ilike.%${query}%,brand.ilike.%${query}%,team.ilike.%${query}%,notes.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[searchCards] Supabase error:', error);
        throw error;
      }

      return (data || []).map(dbToCard);
    } catch (error) {
      console.error('[searchCards] Error:', error);
      throw error;
    }
  },
};
