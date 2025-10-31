#!/usr/bin/env node

/**
 * Complete Supabase Setup and Migration
 * This will:
 * 1. Check current Supabase state
 * 2. Create all tables via SQL
 * 3. Migrate data from IndexedDB
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkTables() {
  console.log('🔍 Checking existing tables...\n');
  
  const tables = ['users', 'collections', 'cards', 'backups'];
  const existingTables = [];
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      
      if (!error) {
        existingTables.push(table);
        console.log(`   ✅ Table "${table}" exists`);
      } else {
        console.log(`   ❌ Table "${table}" does not exist`);
      }
    } catch (err) {
      console.log(`   ❌ Table "${table}" does not exist`);
    }
  }
  
  return existingTables;
}

async function createTablesDirectly() {
  console.log('\n📋 Creating tables directly via Supabase API...\n');

  // Read SQL file
  const sqlPath = path.join(__dirname, '../supabase-migration.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('📄 SQL file loaded');
  console.log('⚠️  Note: This SQL must be run in Supabase SQL Editor');
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  MANUAL STEP REQUIRED');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('1. Go to: https://supabase.com/dashboard/project/dicstmwvrpyyszqxubhu/sql/new');
  console.log('');
  console.log('2. Copy the ENTIRE contents of: supabase-migration.sql');
  console.log('');
  console.log('3. Paste into the SQL Editor');
  console.log('');
  console.log('4. Click "Run" (or press Cmd/Ctrl + Enter)');
  console.log('');
  console.log('5. Wait for "Success. No rows returned"');
  console.log('');
  console.log('6. Come back here and press ENTER to continue...');
  console.log('');
  console.log('═══════════════════════════════════════════════════════');

  // Wait for user to press Enter
  await new Promise((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    readline.question('', () => {
      readline.close();
      resolve();
    });
  });

  // Verify tables were created
  console.log('\n🔍 Verifying tables were created...\n');
  const existingTables = await checkTables();

  if (existingTables.length === 4) {
    console.log('\n✅ All tables created successfully!');
    return true;
  } else {
    console.log(`\n⚠️  Only ${existingTables.length}/4 tables found`);
    console.log('Please ensure the SQL ran successfully in Supabase Dashboard');
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Complete Supabase Setup & Migration');
  console.log('  Project: dicstmwvrpyyszqxubhu');
  console.log('═══════════════════════════════════════════════════════\n');

  // Step 1: Check existing tables
  const existingTables = await checkTables();

  if (existingTables.length === 0) {
    console.log('\n⚠️  No tables found in Supabase!');
    console.log('Let\'s create them...\n');
    
    const created = await createTablesDirectly();
    
    if (!created) {
      console.log('\n❌ Tables not created. Please run SQL manually and try again.');
      process.exit(1);
    }
  } else if (existingTables.length < 4) {
    console.log(`\n⚠️  Only ${existingTables.length}/4 tables found`);
    console.log('Please ensure all tables are created in Supabase Dashboard');
    process.exit(1);
  } else {
    console.log('\n✅ All tables exist!');
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Ready for Data Migration');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('📝 To migrate your data:');
  console.log('');
  console.log('1. Make sure your app is running: npm start');
  console.log('');
  console.log('2. Open http://localhost:3000 in your browser');
  console.log('');
  console.log('3. Open Browser Console (F12)');
  console.log('');
  console.log('4. Run this command:');
  console.log('');
  console.log('   await migrateToSupabase((progress) => {');
  console.log('     console.log(`[${progress.percentage}%] ${progress.step}`);');
  console.log('   });');
  console.log('');
  console.log('═══════════════════════════════════════════════════════\n');
}

main().catch(console.error);
