// Integration utilities for enhanced card data

import { Card } from '../types';
import { EnhancedCard } from '../types/card-enhanced';
import { migrateCardToEnhanced, hasEnhancedFields } from './cardMigration';

// Convert enhanced card back to basic card for storage
export const enhancedToBasicCard = (enhancedCard: Partial<EnhancedCard>): Card => {
  // Extract basic fields
  const basicCard: Card = {
    id: enhancedCard.id || `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: enhancedCard.createdAt || new Date(),
    updatedAt: new Date(),
    
    // Core fields
    player: enhancedCard.player || '',
    team: enhancedCard.team || '',
    year: enhancedCard.year || new Date().getFullYear(),
    brand: enhancedCard.brand || '',
    category: enhancedCard.category || '',
    cardNumber: enhancedCard.cardNumber || '',
    parallel: enhancedCard.parallel,
    condition: enhancedCard.condition || 'RAW',
    gradingCompany: enhancedCard.gradingCompany,
    
    // Financial
    purchasePrice: enhancedCard.purchasePrice || 0,
    purchaseDate: enhancedCard.purchaseDate || new Date(),
    sellPrice: enhancedCard.sellPrice,
    sellDate: enhancedCard.sellDate,
    currentValue: enhancedCard.currentValue || 0,
    
    // Images & Notes
    images: enhancedCard.images || [],
    notes: generateEnhancedNotes(enhancedCard)
  };
  
  return basicCard;
};

// Generate comprehensive notes from enhanced fields
const generateEnhancedNotes = (card: Partial<EnhancedCard>): string => {
  const notes: string[] = [];
  
  // Add existing notes
  if (card.notes) {
    notes.push(card.notes);
  }
  
  // Add enhanced field information
  if (card.identification) {
    const id = card.identification;
    if (id.serialNumber) notes.push(`Serial: ${id.serialNumber}`);
    if (id.printRun) notes.push(`Print Run: ${id.printRun}`);
    if (id.subset) notes.push(`Subset: ${id.subset}`);
    if (id.insert) notes.push(`Insert: ${id.insert}`);
  }
  
  if (card.playerMetadata) {
    const meta = card.playerMetadata;
    if (meta.isRookie) notes.push('ROOKIE CARD');
    if (meta.isHallOfFame) notes.push(`HOF (${meta.inductionYear})`);
    if (meta.jerseyNumber) notes.push(`Jersey #${meta.jerseyNumber}`);
    if (meta.position) notes.push(`Position: ${meta.position}`);
  }
  
  if (card.specialFeatures) {
    const features = card.specialFeatures;
    if (features.hasAutograph) {
      notes.push(`Autograph: ${features.autographType || 'Unknown type'}`);
      if (features.autographColor) notes.push(`Auto Color: ${features.autographColor}`);
    }
    if (features.hasMemorabilia) {
      notes.push('Memorabilia Card');
      if (features.isPatch) notes.push('PATCH');
      if (features.isGameUsed) notes.push('Game Used');
    }
    if (features.is1of1) notes.push('1/1 ONE OF ONE');
  }
  
  if (card.authentication) {
    const auth = card.authentication;
    if (auth.certificationNumber) notes.push(`Cert #${auth.certificationNumber}`);
    if (auth.populationHigher !== undefined) {
      notes.push(`Pop Report: ${auth.populationHigher} higher, ${auth.populationEqual} equal`);
    }
  }
  
  if (card.marketData) {
    const market = card.marketData;
    if (market.purchaseVenue) notes.push(`Purchased from: ${market.purchaseVenue}`);
    if (market.trendDirection) notes.push(`Market Trend: ${market.trendDirection}`);
  }
  
  if (card.storage) {
    const storage = card.storage;
    if (storage.storageLocation) notes.push(`Location: ${storage.storageLocation}`);
    if (storage.boxNumber) notes.push(`Box: ${storage.boxNumber}`);
  }
  
  if (card.collectionMeta) {
    const meta = card.collectionMeta;
    if (meta.personalStory) notes.push(`Story: ${meta.personalStory}`);
    if (meta.willingToTrade) notes.push('AVAILABLE FOR TRADE');
  }
  
  return notes.join(' | ');
};

// Store enhanced data in localStorage
export const saveEnhancedData = (cardId: string, enhancedData: Partial<EnhancedCard>) => {
  const key = `enhanced_card_${cardId}`;
  const dataToStore = {
    identification: enhancedData.identification,
    playerMetadata: enhancedData.playerMetadata,
    authentication: enhancedData.authentication,
    specialFeatures: enhancedData.specialFeatures,
    marketData: enhancedData.marketData,
    physicalAttributes: enhancedData.physicalAttributes,
    storage: enhancedData.storage,
    transaction: enhancedData.transaction,
    digital: enhancedData.digital,
    analytics: enhancedData.analytics,
    collectionMeta: enhancedData.collectionMeta
  };
  
  localStorage.setItem(key, JSON.stringify(dataToStore));
};

// Retrieve enhanced data from localStorage
export const loadEnhancedData = (cardId: string): Partial<EnhancedCard> | null => {
  const key = `enhanced_card_${cardId}`;
  const data = localStorage.getItem(key);
  
  if (data) {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing enhanced card data:', error);
      return null;
    }
  }
  
  return null;
};

// Merge basic card with enhanced data
export const mergeCardWithEnhanced = (card: Card): EnhancedCard => {
  const enhancedData = loadEnhancedData(card.id);
  
  if (enhancedData) {
    return {
      ...card,
      ...enhancedData
    };
  }
  
  return migrateCardToEnhanced(card);
};

// Save complete enhanced card
export const saveEnhancedCard = async (
  enhancedCard: Partial<EnhancedCard>,
  addCard: (card: Card) => Promise<void>,
  updateCard: (card: Card) => Promise<void>
): Promise<void> => {
  // Convert to basic card for database
  const basicCard = enhancedToBasicCard(enhancedCard);
  
  // Save enhanced data to localStorage
  saveEnhancedData(basicCard.id, enhancedCard);
  
  // Save to database
  if (enhancedCard.createdAt) {
    await updateCard(basicCard);
  } else {
    await addCard(basicCard);
  }
};