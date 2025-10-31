#!/usr/bin/env node

/**
 * Automated Supabase Database Setup Script
 * This script will:
 * 1. Connect to Supabase
 * 2. Run the SQL migration script
 * 3. Verify the setup
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  console.error('Please ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_SERVICE_KEY are set.');
  process.exit(1);
}

// Create Supabase admin client (with service role key)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  console.log('🚀 Starting Supabase database setup...\n');

  try {
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, '../supabase-migration.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Reading migration SQL file...');

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('/*') || statement.trim().length === 0) {
        continue;
      }

      process.stdout.write(`Executing statement ${i + 1}/${statements.length}... `);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          // Some errors are acceptable (like table already exists)
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist')) {
            console.log('⚠️  Skipped (already exists)');
          } else {
            console.log('❌ Error:', error.message);
            errorCount++;
          }
        } else {
          console.log('✅');
          successCount++;
        }
      } catch (err) {
        console.log('❌ Error:', err.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    // Verify tables were created
    console.log('\n🔍 Verifying database setup...');

    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.log('⚠️  Could not verify tables:', tablesError.message);
    } else {
      console.log('\n📋 Tables in database:');
      const tableNames = ['users', 'collections', 'cards', 'backups'];
      tableNames.forEach(name => {
        const exists = tables?.some(t => t.table_name === name);
        console.log(`   ${exists ? '✅' : '❌'} ${name}`);
      });
    }

    console.log('\n✅ Database setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start your application: npm start');
    console.log('   2. Open browser console');
    console.log('   3. Run: await migrateToSupabase()');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Alternative: Run SQL directly via REST API
async function runMigrationDirect() {
  console.log('🚀 Starting Supabase database setup (Direct method)...\n');

  try {
    const sqlPath = path.join(__dirname, '../supabase-migration.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 SQL migration file loaded');
    console.log('⚠️  Note: Run this SQL directly in Supabase Dashboard > SQL Editor\n');
    console.log('📋 Instructions:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/dicstmwvrpyyszqxubhu/editor');
    console.log('   2. Click "New Query"');
    console.log('   3. Copy the contents of supabase-migration.sql');
    console.log('   4. Paste and click "Run"\n');

    // Check if tables exist
    console.log('🔍 Checking current database state...\n');

    const tables = ['users', 'collections', 'cards', 'backups'];
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          if (error.message.includes('does not exist')) {
            console.log(`❌ Table "${table}" does not exist - needs to be created`);
          } else {
            console.log(`⚠️  Table "${table}": ${error.message}`);
          }
        } else {
          console.log(`✅ Table "${table}" exists (${count || 0} rows)`);
        }
      } catch (err) {
        console.log(`❌ Table "${table}": ${err.message}`);
      }
    }

    console.log('\n📝 If tables don\'t exist, run the SQL manually in Supabase Dashboard.');
    console.log('📝 Once tables are created, you can run the data migration.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the migration
console.log('═══════════════════════════════════════════════════════');
console.log('  Supabase Database Setup for Sports Card Tracker');
console.log('  Project: dicstmwvrpyyszqxubhu');
console.log('═══════════════════════════════════════════════════════\n');

runMigrationDirect()
  .then(() => {
    console.log('\n✅ Setup check complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });
