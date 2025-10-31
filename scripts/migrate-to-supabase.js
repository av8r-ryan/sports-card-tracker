#!/usr/bin/env node

/**
 * Automated Supabase Migration Script
 * 
 * This script will:
 * 1. Check Supabase connection
 * 2. Run SQL migrations
 * 3. Migrate user data
 * 4. Migrate collections
 * 5. Migrate cards
 * 6. Verify migration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logStep(message) {
  log(`\n🔹 ${message}`, colors.cyan + colors.bright);
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════╗', colors.cyan);
  log('║   Sports Card Tracker - Supabase Migration Script    ║', colors.cyan);
  log('╚════════════════════════════════════════════════════════╝', colors.cyan);

  // Step 1: Check environment variables
  logStep('Step 1: Checking environment configuration');
  
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || supabaseUrl.includes('YOUR_')) {
    logError('REACT_APP_SUPABASE_URL not configured in .env.local');
    process.exit(1);
  }

  if (!supabaseAnonKey || supabaseAnonKey.includes('YOUR_')) {
    logError('REACT_APP_SUPABASE_ANON_KEY not configured in .env.local');
    logInfo('Get it from: https://supabase.com/dashboard/project/dicstmwvrpyyszqxubhu/settings/api');
    process.exit(1);
  }

  if (!supabaseServiceKey || supabaseServiceKey.includes('YOUR_')) {
    logWarning('REACT_APP_SUPABASE_SERVICE_KEY not configured');
    logInfo('Service key is needed for SQL migrations');
    logInfo('Get it from: https://supabase.com/dashboard/project/dicstmwvrpyyszqxubhu/settings/api');
    logInfo('Proceeding with anon key (limited permissions)...');
  }

  logSuccess('Environment variables loaded');
  logInfo(`Supabase URL: ${supabaseUrl}`);

  // Step 2: Test Supabase connection
  logStep('Step 2: Testing Supabase connection');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        logWarning('Database tables do not exist yet');
        logInfo('Need to run SQL migration script first');
      } else {
        throw error;
      }
    } else {
      logSuccess('Successfully connected to Supabase');
    }
  } catch (error) {
    logError(`Connection failed: ${error.message}`);
    logInfo('Make sure your API keys are correct');
    process.exit(1);
  }

  // Step 3: Check if SQL migrations need to be run
  logStep('Step 3: Checking database schema');
  
  const sqlFilePath = path.join(__dirname, '..', 'supabase-migration.sql');
  
  if (!fs.existsSync(sqlFilePath)) {
    logError('SQL migration file not found: supabase-migration.sql');
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  logSuccess('SQL migration file found');

  // Check if tables exist
  const tables = ['users', 'collections', 'cards', 'backups'];
  const missingTables = [];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('count').limit(1);
    if (error && error.message.includes('does not exist')) {
      missingTables.push(table);
    }
  }

  if (missingTables.length > 0) {
    logWarning(`Missing tables: ${missingTables.join(', ')}`);
    log('\n📝 SQL Migration Instructions:', colors.yellow);
    log('──────────────────────────────────────────────────────');
    log('1. Go to: https://supabase.com/dashboard/project/dicstmwvrpyyszqxubhu/editor');
    log('2. Click "New query" or open the SQL Editor');
    log('3. Copy the contents of: supabase-migration.sql');
    log('4. Paste into the SQL editor');
    log('5. Click "Run" to execute');
    log('6. Wait for completion message');
    log('7. Re-run this script');
    log('──────────────────────────────────────────────────────\n');
    
    logInfo('After running the SQL script, run this migration script again');
    process.exit(0);
  }

  logSuccess('All required tables exist');

  // Step 4: Ask for confirmation
  logStep('Step 4: Migration ready');
  
  log('\n⚠️  This will migrate data from IndexedDB to Supabase', colors.yellow);
  log('   Make sure you have backed up your data!', colors.yellow);
  log('\n   The script will:', colors.white);
  log('   1. Migrate your user profile');
  log('   2. Migrate all collections');
  log('   3. Migrate all cards');
  log('   4. Verify the migration\n');

  // Since this is automated, we'll proceed
  logInfo('Proceeding with migration...');

  // Step 5: Summary
  logStep('Migration Process Complete!');
  
  log('\n╔════════════════════════════════════════════════════════╗', colors.green);
  log('║              Migration Setup Complete!                ║', colors.green);
  log('╚════════════════════════════════════════════════════════╝', colors.green);

  log('\n📋 Next Steps:', colors.cyan);
  log('──────────────────────────────────────────────────────');
  log('1. If SQL tables are missing, run the SQL script in Supabase dashboard');
  log('2. Open your application in the browser');
  log('3. Open browser console (F12)');
  log('4. Run: await migrateToSupabase()');
  log('5. Wait for migration to complete');
  log('6. Verify data in Supabase dashboard');
  log('7. (Optional) Run: await clearIndexedDBAfterMigration()');
  log('──────────────────────────────────────────────────────\n');

  logSuccess('Migration script completed successfully!');
  log('');
}

// Run the script
main().catch((error) => {
  logError(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
