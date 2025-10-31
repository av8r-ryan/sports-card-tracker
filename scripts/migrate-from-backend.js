#!/usr/bin/env node

/**
 * Complete CLI Migration: Backend Database (port 8000) → Supabase
 * 
 * This script will:
 * 1. Connect to your backend API on localhost:8000
 * 2. Fetch all cards and collections
 * 3. Migrate everything to Supabase
 * 4. Verify the migration
 */

const { createClient } = require('@supabase/supabase-js');
const http = require('http');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

// Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Backend API config
const BACKEND_HOST = 'localhost';
const BACKEND_PORT = 8000;

console.log('═══════════════════════════════════════════════════════');
console.log('  CLI Migration: Backend DB → Supabase');
console.log('  Sports Card Tracker');
console.log('═══════════════════════════════════════════════════════\n');

// Helper to make HTTP requests to backend
function backendRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function checkBackendServer() {
  console.log('🔍 Checking backend server...');
  
  try {
    await backendRequest('/api/health');
    console.log(`✅ Backend server running on http://${BACKEND_HOST}:${BACKEND_PORT}\n`);
    return true;
  } catch (error) {
    console.log(`❌ Backend server not running on port ${BACKEND_PORT}`);
    console.log('   Please start it with: cd server && npm start\n');
    return false;
  }
}

async function fetchBackendData() {
  console.log('📥 Fetching data from backend database...\n');

  try {
    // Fetch cards
    console.log('   Fetching cards...');
    const cards = await backendRequest('/api/cards');
    console.log(`   ✅ Found ${cards.length} cards`);

    // Backend doesn't have collections or users endpoints
    // Create default data
    console.log('   ℹ️  Backend only stores cards, creating default user and collection');

    const users = [{
      id: 'anonymous',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
    }];

    const collections = [{
      id: 'default-collection',
      userId: 'anonymous',
      name: 'My Collection',
      description: 'Default collection',
      isDefault: true,
    }];

    // If backend has no cards, check if we should load from IndexedDB instead
    if (cards.length === 0) {
      console.log('\n   ⚠️  Backend database is empty!');
      console.log('   💡 Options:');
      console.log('      1. Add cards through your app first (http://localhost:3000)');
      console.log('      2. Use the browser migration tool at http://localhost:3000/migrate');
      console.log('      3. Backend stores data in-memory only (resets on restart)');
      console.log('\n   ℹ️  To migrate existing data, use the browser-based migration.');
    }

    return { cards, collections, users };
  } catch (error) {
    console.error('❌ Failed to fetch backend data:', error.message);
    throw error;
  }
}

async function migrateUsers(users) {
  console.log('\n📤 Migrating users...');

  if (!users || users.length === 0) {
    // Create default user
    const defaultUser = {
      id: 'anonymous',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
    };

    const { error } = await supabase.from('users').upsert([defaultUser]);
    
    if (error && !error.message.includes('duplicate')) {
      throw error;
    }

    console.log('   ✅ Created default user');
    return 1;
  }

  let migrated = 0;
  for (const user of users) {
    const { error } = await supabase.from('users').upsert([{
      id: user.id || user._id,
      username: user.username,
      email: user.email || null,
      role: user.role || 'user',
      profile_photo: user.profilePhoto || user.profile_photo || null,
    }]);

    if (error && !error.message.includes('duplicate')) {
      console.log(`   ⚠️  Failed to migrate user ${user.username}: ${error.message}`);
    } else {
      migrated++;
    }
  }

  console.log(`   ✅ Migrated ${migrated} users`);
  return migrated;
}

async function migrateCollections(collections) {
  console.log('\n📤 Migrating collections...');

  if (!collections || collections.length === 0) {
    console.log('   ℹ️  No collections to migrate');
    return 0;
  }

  let migrated = 0;
  for (const collection of collections) {
    const { error } = await supabase.from('collections').upsert([{
      id: collection.id || collection._id,
      user_id: collection.userId || collection.user_id || 'anonymous',
      name: collection.name,
      description: collection.description || null,
      is_default: collection.isDefault || collection.is_default || false,
    }]);

    if (error && !error.message.includes('duplicate')) {
      console.log(`   ⚠️  Failed to migrate collection ${collection.name}: ${error.message}`);
    } else {
      migrated++;
    }
  }

  console.log(`   ✅ Migrated ${migrated} collections`);
  return migrated;
}

async function migrateCards(cards) {
  console.log('\n📤 Migrating cards...');

  if (!cards || cards.length === 0) {
    console.log('   ℹ️  No cards to migrate');
    return 0;
  }

  console.log(`   Processing ${cards.length} cards in batches of 100...`);

  let migrated = 0;
  const batchSize = 100;

  for (let i = 0; i < cards.length; i += batchSize) {
    const batch = cards.slice(i, i + batchSize);
    
    const cardData = batch.map(card => ({
      id: card.id || card._id,
      user_id: card.userId || card.user_id || 'anonymous',
      collection_id: card.collectionId || card.collection_id || null,
      player: card.player,
      year: parseInt(card.year),
      brand: card.brand,
      card_number: card.cardNumber || card.card_number || null,
      category: card.category,
      team: card.team || null,
      condition: card.condition || null,
      grading_company: card.gradingCompany || card.grading_company || null,
      grade: card.grade || null,
      cert_number: card.certNumber || card.cert_number || null,
      purchase_price: card.purchasePrice || card.purchase_price || null,
      current_value: card.currentValue || card.current_value || null,
      purchase_date: card.purchaseDate || card.purchase_date || null,
      sell_price: card.sellPrice || card.sell_price || null,
      sell_date: card.sellDate || card.sell_date || null,
      notes: card.notes || null,
      image_url: card.imageUrl || card.image_url || null,
      image_front: card.imageFront || card.image_front || null,
      image_back: card.imageBack || card.image_back || null,
    }));

    const { error } = await supabase.from('cards').upsert(cardData);

    if (error) {
      console.log(`   ⚠️  Batch ${i}-${i + batch.length} failed: ${error.message}`);
    } else {
      migrated += batch.length;
      console.log(`   ✅ Migrated ${migrated}/${cards.length} cards`);
    }
  }

  console.log(`   ✅ Completed migration of ${migrated} cards`);
  return migrated;
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...\n');

  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact' });

    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*', { count: 'exact' });

    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*', { count: 'exact' });

    if (usersError || collectionsError || cardsError) {
      throw new Error('Verification failed');
    }

    console.log('   📊 Supabase Database:');
    console.log(`      Users:       ${users?.length || 0}`);
    console.log(`      Collections: ${collections?.length || 0}`);
    console.log(`      Cards:       ${cards?.length || 0}`);

    return { users: users?.length || 0, collections: collections?.length || 0, cards: cards?.length || 0 };
  } catch (error) {
    console.error('   ❌ Verification failed:', error.message);
    throw error;
  }
}

async function main() {
  try {
    // Step 1: Check backend server
    const serverRunning = await checkBackendServer();
    if (!serverRunning) {
      process.exit(1);
    }

    // Step 2: Fetch data from backend
    const { cards, collections, users } = await fetchBackendData();

    // Step 3: Migrate to Supabase
    console.log('\n🚀 Starting migration to Supabase...');

    const userCount = await migrateUsers(users);
    const collectionCount = await migrateCollections(collections);
    const cardCount = await migrateCards(cards);

    // Step 4: Verify
    const verified = await verifyMigration();

    // Summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  Migration Complete!');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📊 Migration Summary:');
    console.log(`   Users:       ${userCount} migrated`);
    console.log(`   Collections: ${collectionCount} migrated`);
    console.log(`   Cards:       ${cardCount} migrated`);
    
    console.log('\n📊 Supabase Verification:');
    console.log(`   Users:       ${verified.users}`);
    console.log(`   Collections: ${verified.collections}`);
    console.log(`   Cards:       ${verified.cards}`);

    if (verified.cards === cardCount && verified.collections === collectionCount) {
      console.log('\n✅ SUCCESS! All data migrated successfully!');
      console.log('\n🎉 You can now use Supabase as your database!');
      console.log('   View your data: https://supabase.com/dashboard/project/dicstmwvrpyyszqxubhu/editor\n');
    } else {
      console.log('\n⚠️  Migration completed but verification shows differences');
      console.log('   Please check the Supabase dashboard\n');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
main();
