import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback, useMemo } from 'react';

import { supabase } from '../lib/supabase';
import { Card, PortfolioStats } from '../types';

interface CardState {
  cards: Card[];
  loading: boolean;
  error: string | null;
}

interface CardContextType {
  state: CardState;
  addCard: (card: Card) => Promise<void>;
  updateCard: (card: Card) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  setCards: (cards: Card[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getPortfolioStats: () => PortfolioStats;
  clearAllCards: () => Promise<void>;
}

const CardContext = createContext<CardContextType | undefined>(undefined);

export const CardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CardState>({
    cards: [],
    loading: false,
    error: null,
  });

  // Load cards from Supabase on mount
  useEffect(() => {
    let isMounted = true;

    const loadCards = async () => {
      try {
        console.log('Loading cards from Supabase...');
        setState((prev) => ({ ...prev, loading: true }));

        const { data, error } = await supabase.from('cards').select('*').order('created_at', { ascending: false });

        if (error) throw error;

        if (isMounted) {
          console.log(`Loaded ${data?.length || 0} cards from Supabase`);
          setState({
            cards: data || [],
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error loading cards from Supabase:', error);
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load cards',
          }));
        }
      }
    };

    loadCards();

    return () => {
      isMounted = false;
    };
  }, []);

  const addCard = useCallback(async (card: Card) => {
    try {
      console.log('Adding card to Supabase:', card.player);

      // Map card properties to match Supabase schema
      const cardData = {
        id: card.id,
        user_id: 'anonymous', // Default user
        collection_id: null,
        player: card.player,
        year: card.year,
        brand: card.brand,
        card_number: card.cardNumber || null,
        category: card.category,
        team: card.team || null,
        condition: card.condition || null,
        grading_company: card.gradingCompany || null,
        purchase_price: card.purchasePrice || null,
        current_value: card.currentValue || null,
        // Persist dates as ISO yyyy-mm-dd strings when available
        purchase_date: card.purchaseDate ? new Date(card.purchaseDate).toISOString().split('T')[0] : null,
        sell_price: card.sellPrice || null,
        sell_date: card.sellDate ? new Date(card.sellDate).toISOString().split('T')[0] : null,
        notes: card.notes || null,
        // images array is not directly stored in separate columns in this context
      };

      const { error } = await supabase.from('cards').insert([cardData]);

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        cards: [card, ...prev.cards],
      }));

      console.log('Card added successfully');
    } catch (error) {
      console.error('Error adding card to Supabase:', error);
      throw error;
    }
  }, []);

  const updateCard = useCallback(async (card: Card) => {
    try {
      console.log('Updating card in Supabase:', card.id);

      const cardData = {
        player: card.player,
        year: card.year,
        brand: card.brand,
        card_number: card.cardNumber || null,
        category: card.category,
        team: card.team || null,
        condition: card.condition || null,
        grading_company: card.gradingCompany || null,
        purchase_price: card.purchasePrice || null,
        current_value: card.currentValue || null,
        purchase_date: card.purchaseDate ? new Date(card.purchaseDate).toISOString().split('T')[0] : null,
        sell_price: card.sellPrice || null,
        sell_date: card.sellDate ? new Date(card.sellDate).toISOString().split('T')[0] : null,
        notes: card.notes || null,
        // images array not mapped to individual columns here
      };

      const { error } = await supabase.from('cards').update(cardData).eq('id', card.id);

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        cards: prev.cards.map((c) => (c.id === card.id ? card : c)),
      }));

      console.log('Card updated successfully');
    } catch (error) {
      console.error('Error updating card in Supabase:', error);
      throw error;
    }
  }, []);

  const deleteCard = useCallback(async (id: string) => {
    try {
      console.log('Deleting card from Supabase:', id);

      const { error } = await supabase.from('cards').delete().eq('id', id);

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        cards: prev.cards.filter((c) => c.id !== id),
      }));

      console.log('Card deleted successfully');
    } catch (error) {
      console.error('Error deleting card from Supabase:', error);
      throw error;
    }
  }, []);

  const clearAllCards = useCallback(async () => {
    try {
      console.log('Clearing all cards from Supabase...');

      const { error } = await supabase.from('cards').delete().neq('id', '');

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        cards: [],
      }));

      console.log('All cards cleared successfully');
    } catch (error) {
      console.error('Error clearing cards from Supabase:', error);
      throw error;
    }
  }, []);

  const setCards = useCallback((cards: Card[]) => {
    setState((prev) => ({ ...prev, cards }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const getPortfolioStats = useCallback((): PortfolioStats => {
    const { cards } = state;

    const totalCards = cards.length;
    const totalValue = cards.reduce((sum, card) => sum + (card.currentValue || 0), 0);
    const totalInvested = cards.reduce((sum, card) => sum + (card.purchasePrice || 0), 0);
    const netGainLoss = totalValue - totalInvested;
    const roi = totalInvested > 0 ? (netGainLoss / totalInvested) * 100 : 0;

    return {
      totalCards,
      totalValue,
      totalInvested,
      netGainLoss,
      roi,
    };
  }, [state]);

  const contextValue = useMemo(
    () => ({
      state,
      addCard,
      updateCard,
      deleteCard,
      setCards,
      setLoading,
      setError,
      getPortfolioStats,
      clearAllCards,
    }),
    [state, addCard, updateCard, deleteCard, setCards, setLoading, setError, getPortfolioStats, clearAllCards]
  );

  return <CardContext.Provider value={contextValue}>{children}</CardContext.Provider>;
};

export const useCards = (): CardContextType => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('useCards must be used within a CardProvider');
  }
  return context;
};
