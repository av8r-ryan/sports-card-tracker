import { db } from '../db/simpleDatabase';
import { collectionsDb } from '../db/collectionsDatabase';

export async function debugDatabase() {
  console.log('=== DATABASE DEBUG ===');
  
  // Check localStorage
  console.log('localStorage user:', localStorage.getItem('user'));
  console.log('localStorage auth-state:', localStorage.getItem('auth-state'));
  
  // Check all cards in database
  try {
    const allCards = await db.cards.toArray();
    console.log('Total cards in database:', allCards.length);
    
    // Group by userId
    const cardsByUser: { [key: string]: any[] } = {};
    allCards.forEach(card => {
      if (!cardsByUser[card.userId]) {
        cardsByUser[card.userId] = [];
      }
      cardsByUser[card.userId].push(card);
    });
    
    console.log('Cards by userId:');
    Object.entries(cardsByUser).forEach(([userId, cards]) => {
      console.log(`  ${userId}: ${cards.length} cards`);
      // Show first card as sample
      if (cards.length > 0) {
        console.log('    Sample card:', {
          id: cards[0].id,
          player: cards[0].player,
          collectionId: cards[0].collectionId
        });
      }
    });
  } catch (error) {
    console.error('Error reading cards:', error);
  }
  
  // Check all collections
  try {
    const allCollections = await collectionsDb.collections.toArray();
    console.log('Total collections in database:', allCollections.length);
    
    // Group by userId
    const collectionsByUser: { [key: string]: any[] } = {};
    allCollections.forEach(collection => {
      if (!collectionsByUser[collection.userId]) {
        collectionsByUser[collection.userId] = [];
      }
      collectionsByUser[collection.userId].push(collection);
    });
    
    console.log('Collections by userId:');
    Object.entries(collectionsByUser).forEach(([userId, collections]) => {
      console.log(`  ${userId}: ${collections.length} collections`);
      collections.forEach(col => {
        console.log(`    - ${col.name} (${col.id}) ${col.isDefault ? '[DEFAULT]' : ''}`);
      });
    });
  } catch (error) {
    console.error('Error reading collections:', error);
  }
  
  console.log('=== END DEBUG ===');
}

// Fix userId mismatches by updating all cards to use the current user's ID
export async function fixUserIdMismatch() {
  console.log('=== FIXING USER ID MISMATCH ===');
  
  // Get current user ID from localStorage
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    console.error('No user found in localStorage');
    return;
  }
  
  try {
    const user = JSON.parse(userStr);
    const currentUserId = user.id;
    console.log('Current user ID:', currentUserId);
    
    // Update all cards to use current user ID
    const allCards = await db.cards.toArray();
    let updatedCount = 0;
    
    for (const card of allCards) {
      if (card.userId !== currentUserId) {
        console.log(`Updating card ${card.id} from userId ${card.userId} to ${currentUserId}`);
        await db.cards.update(card.id, { userId: currentUserId });
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} cards`);
    
    // Also ensure all collections use current user ID
    const allCollections = await collectionsDb.collections.toArray();
    let collectionsUpdated = 0;
    
    for (const collection of allCollections) {
      if (collection.userId !== currentUserId) {
        console.log(`Updating collection ${collection.id} from userId ${collection.userId} to ${currentUserId}`);
        await collectionsDb.collections.update(collection.id, { userId: currentUserId });
        collectionsUpdated++;
      }
    }
    
    console.log(`Updated ${collectionsUpdated} collections`);
    console.log('=== FIX COMPLETE - Please refresh the page ===');
  } catch (error) {
    console.error('Error fixing user ID mismatch:', error);
  }
}

// Make it available globally for debugging
(window as any).debugDatabase = debugDatabase;
(window as any).fixUserIdMismatch = fixUserIdMismatch;