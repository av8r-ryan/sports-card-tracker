// Utility to migrate existing cards to enhanced format

import { Card } from '../types';
import { EnhancedCard, SpecialFeatures, StorageData, MarketData } from '../types/card-enhanced';

export const migrateCardToEnhanced = (card: Card): EnhancedCard => {
  // Start with all existing fields
  const enhancedCard: EnhancedCard = {
    ...card,
    
    // Initialize new structures with sensible defaults
    identification: {
      playerName: card.player,
      teamName: card.team,
      manufacturer: extractManufacturer(card.brand),
      brand: card.brand,
      setName: `${card.year} ${card.brand}`,
      cardNumber: card.cardNumber,
      parallels: card.parallel ? [card.parallel] : undefined,
      era: determineEra(card.year)
    },
    
    playerMetadata: {
      isRookie: detectRookie(card.notes),
      rookieYear: detectRookie(card.notes) ? card.year : undefined,
      isActionShot: false,
      isPortrait: true
    },
    
    specialFeatures: {
      hasAutograph: detectAutograph(card.notes),
      hasMemorabilia: detectMemorabilia(card.notes),
      is1of1: detect1of1(card.notes || card.parallel || '')
    },
    
    marketData: {
      purchaseVenue: 'Private Sale',
      priceHistory: [{
        date: card.purchaseDate,
        price: card.purchasePrice,
        source: 'Purchase',
        condition: card.condition
      }],
      lastSaleComps: [],
      holdingPeriodDays: calculateHoldingDays(card.purchaseDate, card.sellDate),
      trendDirection: 'Stable',
      demandLevel: 'Warm'
    },
    
    storage: {
      storageLocation: 'Collection',
      storageMethod: card.gradingCompany ? 'Graded Slab' : 'Toploader',
      collectionCategory: card.sellDate ? 'Investment' : 'PC',
      displayStatus: 'Stored'
    },
    
    transaction: {
      insuredValue: card.currentValue,
      acquisitionType: 'Purchase',
      taxBasis: card.purchasePrice
    },
    
    analytics: calculateAnalytics(card),
    
    collectionMeta: {
      sentimentalValue: 'Medium',
      willingToTrade: false,
      personalGrade: extractGradeNumber(card.condition)
    }
  };
  
  // Add authentication data if graded
  if (card.gradingCompany) {
    enhancedCard.authentication = {
      gradingCompany: card.gradingCompany,
      gradeNumeric: extractGradeNumber(card.condition),
      gradeLabel: card.condition,
      certificationNumber: 'Unknown', // Would need to be added manually
      gradingDate: card.purchaseDate // Estimate
    };
  }
  
  return enhancedCard;
};

// Helper functions
const extractManufacturer = (brand: string): string => {
  const manufacturers: Record<string, string> = {
    'Topps': 'The Topps Company',
    'Panini': 'Panini America',
    'Upper Deck': 'Upper Deck Company',
    'Bowman': 'The Topps Company',
    'Donruss': 'Panini America',
    'Fleer': 'Fleer Corporation',
    'Score': 'Panini America',
    'Prizm': 'Panini America',
    'Select': 'Panini America',
    'Mosaic': 'Panini America',
    'Chronicles': 'Panini America',
    'Pokemon': 'The Pokemon Company'
  };
  
  for (const [key, value] of Object.entries(manufacturers)) {
    if (brand.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return brand;
};

const determineEra = (year: number): 'Vintage' | 'Junk Wax' | 'Modern' | 'Ultra-Modern' => {
  if (year < 1980) return 'Vintage';
  if (year >= 1986 && year <= 1993) return 'Junk Wax';
  if (year >= 1994 && year <= 2009) return 'Modern';
  return 'Ultra-Modern';
};

const detectRookie = (notes?: string): boolean => {
  if (!notes) return false;
  const rookieKeywords = ['rookie', 'rc', 'first year', '1st year', 'debut'];
  return rookieKeywords.some(keyword => 
    notes.toLowerCase().includes(keyword)
  );
};

const detectAutograph = (notes?: string): boolean => {
  if (!notes) return false;
  const autoKeywords = ['auto', 'autograph', 'signed', 'signature'];
  return autoKeywords.some(keyword => 
    notes.toLowerCase().includes(keyword)
  );
};

const detectMemorabilia = (notes?: string): boolean => {
  if (!notes) return false;
  const memoKeywords = ['jersey', 'patch', 'relic', 'memorabilia', 'swatch', 'bat', 'game-used', 'game used'];
  return memoKeywords.some(keyword => 
    notes.toLowerCase().includes(keyword)
  );
};

const detect1of1 = (text: string): boolean => {
  const patterns = ['1/1', '1 of 1', 'one of one'];
  return patterns.some(pattern => 
    text.toLowerCase().includes(pattern)
  );
};

const calculateHoldingDays = (purchaseDate: Date, sellDate?: Date): number => {
  const endDate = sellDate || new Date();
  const diffTime = Math.abs(endDate.getTime() - purchaseDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const extractGradeNumber = (condition: string): number => {
  const match = condition.match(/(\d+\.?\d*)/);
  if (match) {
    return parseFloat(match[1]);
  }
  return condition === 'RAW' ? 0 : 5;
};

const calculateAnalytics = (card: Card): any => {
  const totalReturn = card.currentValue - card.purchasePrice;
  const percentageReturn = (totalReturn / card.purchasePrice) * 100;
  
  return {
    totalReturn,
    percentageReturn,
    growthPotential: percentageReturn > 50 ? 'High' : percentageReturn > 20 ? 'Medium' : 'Low',
    sellRecommendation: card.sellDate ? 'Sold' : percentageReturn > 100 ? 'Sell' : 'Hold'
  };
};

// Batch migration function
export const migrateAllCards = (cards: Card[]): EnhancedCard[] => {
  return cards.map(card => migrateCardToEnhanced(card));
};

// Check if a card has enhanced fields
export const hasEnhancedFields = (card: any): boolean => {
  return !!(card.identification || card.playerMetadata || card.specialFeatures);
};