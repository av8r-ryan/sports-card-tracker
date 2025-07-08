// Test script to debug collection move issues
import { db } from '../db/simpleDatabase';

export async function testDirectCollectionUpdate(cardId: string, targetCollectionId: string) {
  console.log('=== Testing Direct Collection Update ===');
  
  try {
    // 1. Get the card directly from Dexie
    const card = await db.cards.get(cardId);
    console.log('1. Original card:', card);
    
    if (!card) {
      console.log('Card not found!');
      return;
    }
    
    // 2. Update the card directly in Dexie
    console.log('2. Updating card with collectionId:', targetCollectionId);
    await db.cards.update(cardId, { collectionId: targetCollectionId });
    
    // 3. Verify the update
    const updatedCard = await db.cards.get(cardId);
    console.log('3. Updated card:', updatedCard);
    console.log('4. CollectionId changed:', card.collectionId, '->', updatedCard?.collectionId);
    
    return updatedCard;
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

// Export to window for easy testing in console
if (typeof window !== 'undefined') {
  (window as any).testDirectCollectionUpdate = testDirectCollectionUpdate;
}