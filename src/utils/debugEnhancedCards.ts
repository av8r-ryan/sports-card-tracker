// Debug utility for enhanced cards in localStorage

export const debugEnhancedCards = () => {
  console.log('=== Enhanced Cards Debug ===');

  // Get all localStorage keys
  const keys = Object.keys(localStorage);
  const enhancedKeys = keys.filter((key) => key.startsWith('enhanced_card_'));

  console.log(`Found ${enhancedKeys.length} enhanced cards in localStorage`);

  enhancedKeys.forEach((key) => {
    console.log(`\nKey: ${key}`);
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log('Data:', parsed);
      } catch (e) {
        console.error('Failed to parse:', e);
      }
    }
  });

  console.log('=== End Debug ===');
};

// Clear all enhanced card data (use with caution!)
export const clearEnhancedCards = () => {
  const keys = Object.keys(localStorage);
  const enhancedKeys = keys.filter((key) => key.startsWith('enhanced_card_'));

  enhancedKeys.forEach((key) => {
    localStorage.removeItem(key);
  });

  console.log(`Cleared ${enhancedKeys.length} enhanced cards from localStorage`);
};

// Get enhanced card data by ID
export const getEnhancedCardById = (cardId: string) => {
  const key = `enhanced_card_${cardId}`;
  const data = localStorage.getItem(key);

  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse enhanced card data:', e);
      return null;
    }
  }

  return null;
};

// Add to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).debugEnhancedCards = debugEnhancedCards;
  (window as any).clearEnhancedCards = clearEnhancedCards;
  (window as any).getEnhancedCardById = getEnhancedCardById;
}
