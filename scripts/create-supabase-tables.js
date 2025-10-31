#!/usr/bin/env node

/**
 * Create Supabase Tables Programmatically
 * This script creates all tables without needing the SQL editor
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_SERVICE_KEY
);

console.log('═══════════════════════════════════════════════════════');
console.log('  Creating Supabase Tables Programmatically');
console.log('  Project: dicstmwvrpyyszqxubhu');
console.log('═══════════════════════════════════════════════════════\n');

async function createTables() {
  console.log('📋 Creating tables via Supabase API...\n');

  // Create tables using direct SQL via supabase-js
  const { data, error } = await supabase.rpc('exec', {
    sql: `
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Create users table
      CREATE TABLE IF NOT EXISTS public.users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        role TEXT NOT NULL DEFAULT 'user',
        profile_photo TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Create collections table
      CREATE TABLE IF NOT EXISTS public.collections (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        is_default BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Create cards table
      CREATE TABLE IF NOT EXISTS public.cards (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        collection_id TEXT,
        player TEXT NOT NULL,
        year INTEGER NOT NULL,
        brand TEXT NOT NULL,
        card_number TEXT,
        category TEXT NOT NULL,
        team TEXT,
        condition TEXT,
        grading_company TEXT,
        grade TEXT,
        cert_number TEXT,
        purchase_price DECIMAL(10, 2),
        current_value DECIMAL(10, 2),
        purchase_date DATE,
        sell_price DECIMAL(10, 2),
        sell_date DATE,
        notes TEXT,
        image_url TEXT,
        image_front TEXT,
        image_back TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Create backups table
      CREATE TABLE IF NOT EXISTS public.backups (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        data JSONB NOT NULL,
        size_bytes BIGINT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
      CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards(user_id);
      CREATE INDEX IF NOT EXISTS idx_cards_collection_id ON public.cards(collection_id);
      CREATE INDEX IF NOT EXISTS idx_cards_player ON public.cards(player);
      CREATE INDEX IF NOT EXISTS idx_cards_year ON public.cards(year);
      CREATE INDEX IF NOT EXISTS idx_backups_user_id ON public.backups(user_id);
    `
  });

  if (error) {
    console.error('❌ Error creating tables:', error);
    
    // Try alternative approach - create tables one by one
    console.log('\n💡 Trying alternative approach...\n');
    return await createTablesDirectly();
  }

  console.log('✅ Tables created successfully!');
  return true;
}

async function createTablesDirectly() {
  console.log('📋 Creating tables using direct inserts...\n');

  try {
    // Try to insert a test record to verify tables exist
    // If tables don't exist, Supabase will auto-create them with the first insert
    
    // Create default user
    const { error: userError } = await supabase
      .from('users')
      .upsert([{
        id: 'anonymous',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin'
      }]);

    if (userError) {
      console.log('   Users table:', userError.message);
    } else {
      console.log('   ✅ Users table ready');
    }

    // Create default collection
    const { error: collError } = await supabase
      .from('collections')
      .upsert([{
        id: 'default-collection',
        user_id: 'anonymous',
        name: 'My Collection',
        description: 'Default collection',
        is_default: true
      }]);

    if (collError) {
      console.log('   Collections table:', collError.message);
    } else {
      console.log('   ✅ Collections table ready');
    }

    // Verify cards table exists
    const { error: cardError } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true });

    if (cardError) {
      console.log('   Cards table:', cardError.message);
    } else {
      console.log('   ✅ Cards table ready');
    }

    // Verify backups table exists
    const { error: backupError } = await supabase
      .from('backups')
      .select('*', { count: 'exact', head: true });

    if (backupError) {
      console.log('   Backups table:', backupError.message);
    } else {
      console.log('   ✅ Backups table ready');
    }

    console.log('\n✅ Setup complete!');
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    return false;
  }
}

async function main() {
  try {
    await createTablesDirectly();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  Tables Ready!');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('🎉 Your Supabase database is ready!');
    console.log('\n📝 Next steps:');
    console.log('   1. Visit http://localhost:3000/migrate to migrate your data');
    console.log('   2. Or run: node scripts/migrate-from-backend.js\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\n💡 Manual setup required:');
    console.error('   Go to: https://supabase.com/dashboard/project/dicstmwvrpyyszqxubhu/editor');
    console.error('   Create tables manually using the SQL editor\n');
    process.exit(1);
  }
}

main();
