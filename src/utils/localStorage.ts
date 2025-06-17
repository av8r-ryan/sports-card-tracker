import { Card } from '../types';
import { logDebug, logInfo, logWarn, logError } from './logger';

const STORAGE_KEY = 'sports-card-tracker-cards';

export const saveCardsToStorage = (cards: Card[]): void => {
  try {
    if (!Array.isArray(cards)) {
      logWarn('LocalStorage', 'saveCardsToStorage: cards is not an array, defaulting to empty array');
      cards = [];
    }
    
    logDebug('LocalStorage', 'Saving cards to storage', { count: cards.length });
    
    // Ensure all cards have proper structure before saving
    const validCards = cards.filter(card => {
      if (!card || typeof card !== 'object' || !card.id) {
        logWarn('LocalStorage', 'Invalid card found, filtering out', card);
        return false;
      }
      return true;
    });
    
    if (validCards.length !== cards.length) {
      logWarn('LocalStorage', 'Some cards were filtered out', { 
        original: cards.length, 
        valid: validCards.length 
      });
    }
    
    const serializedCards = JSON.stringify(validCards);
    localStorage.setItem(STORAGE_KEY, serializedCards);
    logInfo('LocalStorage', 'Cards saved successfully', { count: validCards.length });
  } catch (error) {
    logError('LocalStorage', 'Error saving cards to localStorage', error as Error);
  }
};

export const loadCardsFromStorage = (): Card[] => {
  try {
    logDebug('LocalStorage', 'Loading cards from storage');
    const serializedCards = localStorage.getItem(STORAGE_KEY);
    if (serializedCards === null) {
      logInfo('LocalStorage', 'No cards found in storage');
      return [];
    }
    
    const cards = JSON.parse(serializedCards);
    
    const parsedCards = cards.map((card: any) => ({
      ...card,
      purchaseDate: new Date(card.purchaseDate),
      sellDate: card.sellDate ? new Date(card.sellDate) : undefined,
      createdAt: new Date(card.createdAt),
      updatedAt: new Date(card.updatedAt)
    }));
    
    logInfo('LocalStorage', 'Cards loaded successfully', { count: parsedCards.length });
    return parsedCards;
  } catch (error) {
    logError('LocalStorage', 'Error loading cards from localStorage', error as Error);
    return [];
  }
};

export const clearCardsFromStorage = (): void => {
  try {
    logInfo('LocalStorage', 'Clearing cards from storage');
    localStorage.removeItem(STORAGE_KEY);
    logInfo('LocalStorage', 'Cards cleared successfully');
  } catch (error) {
    logError('LocalStorage', 'Error clearing cards from localStorage', error as Error);
  }
};

export const exportCardsAsJSON = (cards: Card[]): string => {
  return JSON.stringify(cards, null, 2);
};

export const exportCardsAsCSV = (cards: Card[]): string => {
  if (cards.length === 0) return '';
  
  const headers = [
    'ID', 'Player', 'Team', 'Year', 'Brand', 'Category', 'Card Number',
    'Parallel', 'Condition', 'Grading Company', 'Purchase Price', 'Purchase Date',
    'Sell Price', 'Sell Date', 'Current Value', 'Notes'
  ];
  
  const csvRows = [
    headers.join(','),
    ...cards.map(card => [
      card.id,
      `"${card.player}"`,
      `"${card.team}"`,
      card.year,
      `"${card.brand}"`,
      `"${card.category}"`,
      `"${card.cardNumber}"`,
      `"${card.parallel || ''}"`,
      `"${card.condition}"`,
      `"${card.gradingCompany || ''}"`,
      card.purchasePrice,
      card.purchaseDate.toISOString().split('T')[0],
      card.sellPrice || '',
      card.sellDate ? card.sellDate.toISOString().split('T')[0] : '',
      card.currentValue,
      `"${card.notes.replace(/"/g, '""')}"`
    ].join(','))
  ];
  
  return csvRows.join('\n');
};

export const importCardsFromJSON = (jsonString: string): Card[] => {
  try {
    const cards = JSON.parse(jsonString);
    return cards.map((card: any) => ({
      ...card,
      purchaseDate: new Date(card.purchaseDate),
      sellDate: card.sellDate ? new Date(card.sellDate) : undefined,
      createdAt: new Date(card.createdAt || Date.now()),
      updatedAt: new Date(card.updatedAt || Date.now())
    }));
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
};