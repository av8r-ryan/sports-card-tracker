import { cardDatabase } from './simpleDatabase';
import { collectionsDatabase } from './collectionsDatabase';
import { supabaseCardDatabase } from './supabaseDatabase';
import { supabaseCollectionsDatabase } from './supabaseCollections';
import { supabase } from '../lib/supabase';

export interface MigrationProgress {
  step: string;
  current: number;
  total: number;
  percentage: number;
}

export interface MigrationResult {
  success: boolean;
  cardsMigrated: number;
  collectionsMigrated: number;
  usersMigrated: number;
  errors: string[];
}

/**
 * Migrate all data from IndexedDB to Supabase
 */
export async function migrateToSupabase(
  onProgress?: (progress: MigrationProgress) => void
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    cardsMigrated: 0,
    collectionsMigrated: 0,
    usersMigrated: 0,
    errors: [],
  };

  try {
    console.log('🚀 Starting migration from IndexedDB to Supabase...');

    // Step 1: Migrate user
    onProgress?.({ step: 'Migrating user', current: 1, total: 4, percentage: 25 });
    await migrateUser();
    result.usersMigrated = 1;
    console.log('✅ User migrated');

    // Step 2: Migrate collections
    onProgress?.({ step: 'Migrating collections', current: 2, total: 4, percentage: 50 });
    const collections = await collectionsDatabase.getUserCollections();
    for (const collection of collections) {
      try {
        await supabaseCollectionsDatabase.addCollection(collection);
        result.collectionsMigrated++;
      } catch (error) {
        const errorMsg = `Failed to migrate collection ${collection.name}: ${error}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }
    console.log(`✅ ${result.collectionsMigrated} collections migrated`);

    // Step 3: Migrate cards
    onProgress?.({ step: 'Migrating cards', current: 3, total: 4, percentage: 75 });
    const cards = await cardDatabase.getAllCards();
    console.log(`Found ${cards.length} cards to migrate`);

    // Migrate in batches of 100
    const batchSize = 100;
    for (let i = 0; i < cards.length; i += batchSize) {
      const batch = cards.slice(i, i + batchSize);
      try {
        await supabaseCardDatabase.addCards(batch);
        result.cardsMigrated += batch.length;
        console.log(`Migrated ${result.cardsMigrated}/${cards.length} cards`);
      } catch (error) {
        const errorMsg = `Failed to migrate batch ${i}-${i + batch.length}: ${error}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }
    console.log(`✅ ${result.cardsMigrated} cards migrated`);

    // Step 4: Verify migration
    onProgress?.({ step: 'Verifying migration', current: 4, total: 4, percentage: 100 });
    const migratedCards = await supabaseCardDatabase.getAllCards();
    const migratedCollections = await supabaseCollectionsDatabase.getAllCollections();

    console.log(`\n📊 Migration Summary:`);
    console.log(`- Cards: ${result.cardsMigrated}/${cards.length}`);
    console.log(`- Collections: ${result.collectionsMigrated}/${collections.length}`);
    console.log(`- Verified cards in Supabase: ${migratedCards.length}`);
    console.log(`- Verified collections in Supabase: ${migratedCollections.length}`);

    result.success = result.errors.length === 0 && result.cardsMigrated === cards.length;

    if (result.success) {
      console.log('✅ Migration completed successfully!');
      console.log('\n⚠️  You can now safely clear IndexedDB data');
      console.log('   Run: clearIndexedDBAfterMigration()');
    } else {
      console.log('⚠️  Migration completed with errors');
      console.log(`Errors: ${result.errors.length}`);
    }

    return result;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    result.errors.push(`Migration failed: ${error}`);
    return result;
  }
}

/**
 * Migrate user data
 */
async function migrateUser(): Promise<void> {
  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('No user found in localStorage');
  }

  const user = JSON.parse(userStr);

  // Check if user already exists in Supabase
  const { data: existingUser } = await supabase.from('users').select('*').eq('id', user.id).single();

  if (!existingUser) {
    // Insert user
    const { error } = await supabase.from('users').insert([
      {
        id: user.id,
        username: user.username,
        email: user.email || null,
        role: user.role || 'user',
        profile_photo: user.profilePhoto || null,
      },
    ]);

    if (error) {
      throw new Error(`Failed to migrate user: ${error.message}`);
    }
  }
}

/**
 * Clear IndexedDB data after successful migration
 * WARNING: This will delete all local data!
 */
export async function clearIndexedDBAfterMigration(): Promise<void> {
  const confirmed = window.confirm(
    '⚠️  WARNING: This will permanently delete all data from IndexedDB.\n\n' +
      'Make sure your data has been successfully migrated to Supabase first!\n\n' +
      'Do you want to continue?'
  );

  if (!confirmed) {
    console.log('Cancelled IndexedDB cleanup');
    return;
  }

  try {
    console.log('🗑️  Clearing IndexedDB data...');

    // Clear cards
    await cardDatabase.clearAllCards();
    console.log('✅ Cards cleared from IndexedDB');

    // Clear collections
    await collectionsDatabase.clearAllCollections();
    console.log('✅ Collections cleared from IndexedDB');

    console.log('✅ IndexedDB cleanup complete!');
  } catch (error) {
    console.error('❌ Failed to clear IndexedDB:', error);
    throw error;
  }
}

/**
 * Rollback migration - copy data from Supabase back to IndexedDB
 * Use this if you need to revert the migration
 */
export async function rollbackMigration(): Promise<void> {
  const confirmed = window.confirm(
    '⚠️  This will copy data from Supabase back to IndexedDB.\n\n' +
      'Your current IndexedDB data will be overwritten!\n\n' +
      'Do you want to continue?'
  );

  if (!confirmed) {
    console.log('Cancelled rollback');
    return;
  }

  try {
    console.log('🔄 Starting rollback from Supabase to IndexedDB...');

    // Get data from Supabase
    const cards = await supabaseCardDatabase.getAllCards();
    const collections = await supabaseCollectionsDatabase.getAllCollections();

    // Clear IndexedDB
    await cardDatabase.clearAllCards();
    // Note: collectionsDatabase doesn't have clearAllCollections, so we skip it

    // Restore collections
    for (const collection of collections) {
      await collectionsDatabase.addCollection(collection);
    }

    // Restore cards
    for (const card of cards) {
      await cardDatabase.addCard(card);
    }

    console.log('✅ Rollback complete!');
    console.log(`- ${collections.length} collections restored`);
    console.log(`- ${cards.length} cards restored`);
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

// Make functions available globally for console use
if (typeof window !== 'undefined') {
  (window as any).migrateToSupabase = migrateToSupabase;
  (window as any).clearIndexedDBAfterMigration = clearIndexedDBAfterMigration;
  (window as any).rollbackMigration = rollbackMigration;

  console.log('🔧 Migration tools available:');
  console.log('  migrateToSupabase() - Migrate data to Supabase');
  console.log('  clearIndexedDBAfterMigration() - Clear IndexedDB after migration');
  console.log('  rollbackMigration() - Restore data from Supabase to IndexedDB');
}
