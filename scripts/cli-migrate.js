#!/usr/bin/env node

/**
 * Pure CLI Migration Script - No Browser Required
 * Extracts data from IndexedDB backup/export and pushes to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_SERVICE_KEY
);

console.log('═══════════════════════════════════════════════════════');
console.log('  CLI Migration: IndexedDB → Supabase');
console.log('  Sports Card Tracker');
console.log('═══════════════════════════════════════════════════════\n');

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function exportFromBrowser() {
  console.log('📋 STEP 1: Export your data from the browser\n');
  console.log('Since IndexedDB is browser-only, we need to export your data first:\n');
  console.log('Option 1: Use the Backup/Restore feature in your app');
  console.log('  1. Go to http://localhost:3000/backup');
  console.log('  2. Click "Export Data"');
  console.log('  3. Save the JSON file\n');
  console.log('Option 2: Run this in Browser Console (F12):');
  console.log('───────────────────────────────────────────────────────');
  console.log(`
// Copy and paste this entire block into browser console
(async () => {
  const { cardDatabase } = await import('./db/simpleDatabase');
  const { collectionsDatabase } = await import('./db/collectionsDatabase');
  
  const cards = await cardDatabase.getAllCards();
  const collections = await collectionsDatabase.getUserCollections();
  
  const data = {
    cards,
    collections,
    user: JSON.parse(localStorage.getItem('user') || '{}'),
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sports-cards-export.json';
  a.click();
  
  console.log('✅ Export complete! File saved.');
})();
  `);
  console.log('───────────────────────────────────────────────────────\n');

  const filePath = await prompt('Enter the path to your exported JSON file: ');
  return filePath.trim();
}

async function migrateFromFile(filePath) {
  console.log(`\n📂 Reading file: ${filePath}\n`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  console.log('📊 Data loaded:');
  console.log(`   Cards: ${data.cards?.length || 0}`);
  console.log(`   Collections: ${data.collections?.length || 0}`);
  console.log(`   User: ${data.user?.username || 'unknown'}\n`);

  const userId = data.user?.id || 'anonymous';

  // Step 1: Migrate user
  console.log('👤 [1/4] Migrating user...');
  const { error: userError } = await supabase
    .from('users')
    .upsert([{
      id: userId,
      username: data.user?.username || 'user',
      email: data.user?.email || null,
      role: data.user?.role || 'user',
      profile_photo: data.user?.profilePhoto || null,
    }], { onConflict: 'id' });

  if (userError && !userError.message.includes('duplicate')) {
    throw new Error(`User migration failed: ${userError.message}`);
  }
  console.log('   ✅ User migrated\n');

  // Step 2: Migrate collections
  console.log(`📁 [2/4] Migrating ${data.collections?.length || 0} collections...`);
  let collectionCount = 0;
  
  for (const collection of data.collections || []) {
    const { error } = await supabase
      .from('collections')
      .upsert([{
        id: collection.id,
        user_id: userId,
        name: collection.name,
        description: collection.description || null,
        is_default: collection.isDefault || false,
      }], { onConflict: 'id' });

    if (error && !error.message.includes('duplicate')) {
      console.log(`   ⚠️  Failed: ${collection.name} - ${error.message}`);
    } else {
      collectionCount++;
    }
  }
  console.log(`   ✅ ${collectionCount} collections migrated\n`);

  // Step 3: Migrate cards (in batches)
  console.log(`🃏 [3/4] Migrating ${data.cards?.length || 0} cards...`);
  const batchSize = 100;
  let cardCount = 0;
  
  for (let i = 0; i < (data.cards?.length || 0); i += batchSize) {
    const batch = data.cards.slice(i, i + batchSize);
    const cardsToInsert = batch.map(card => ({
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
      purchase_date: card.purchaseDate ? new Date(card.purchaseDate).toISOString().split('T')[0] : null,
      sell_price: card.sellPrice || null,
      sell_date: card.sellDate ? new Date(card.sellDate).toISOString().split('T')[0] : null,
      notes: card.notes || null,
      image_url: card.imageUrl || null,
      image_front: card.imageFront || null,
      image_back: card.imageBack || null,
    }));

    const { error } = await supabase
      .from('cards')
      .upsert(cardsToInsert, { onConflict: 'id' });

    if (error) {
      console.log(\`   ⚠️  Batch \${i}-\${i + batch.length} failed: \${error.message}\`);
    } else {
      cardCount += batch.length;
      const progress = Math.round((cardCount / data.cards.length) * 100);
      process.stdout.write(\`\r   [\${progress}%] \${cardCount}/\${data.cards.length} cards migrated\`);
    }
  }
  console.log(\`\n   ✅ \${cardCount} cards migrated\n\`);

  // Step 4: Verify
  console.log('🔍 [4/4] Verifying migration...');
  const { data: verifyCards } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const { data: verifyCollections } = await supabase
    .from('collections')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  console.log(\`   Cards in Supabase: \${verifyCards || 0}\`);
  console.log(\`   Collections in Supabase: \${verifyCollections || 0}\n\`);

  return {
    cardsMigrated: cardCount,
    collectionsMigrated: collectionCount,
    success: true,
  };
}

async function main() {
  try {
    // Check if user already has an export file
    const hasFile = await prompt('Do you already have an exported JSON file? (y/n): ');

    let filePath;
    if (hasFile.toLowerCase() === 'y') {
      filePath = await prompt('Enter the full path to your JSON file: ');
    } else {
      filePath = await exportFromBrowser();
    }

    const result = await migrateFromFile(filePath);

    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✅ MIGRATION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(\`  Cards migrated: \${result.cardsMigrated}\`);
    console.log(\`  Collections migrated: \${result.collectionsMigrated}\`);
    console.log('');
    console.log('🎉 Your data is now in Supabase!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('  1. Verify: https://supabase.com/dashboard/project/dicstmwvrpyyszqxubhu/editor');
    console.log('  2. Update app to use Supabase instead of IndexedDB');
    console.log('  3. Optional: Clear browser IndexedDB');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nPlease check the error above and try again.\n');
    process.exit(1);
  }
}

main();
