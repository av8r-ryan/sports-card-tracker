#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_SERVICE_KEY
);

async function verifyProjectAndCreateTables() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Verifying Supabase Project');
  console.log('  URL:', process.env.REACT_APP_SUPABASE_URL);
  console.log('  Project ID: dicstmwvrpyyszqxubhu');
  console.log('═══════════════════════════════════════════════════════\n');

  // Try to query each table
  console.log('🔍 Checking for tables...\n');
  
  const tables = ['users', 'collections', 'cards', 'backups'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        results[table] = false;
      } else {
        console.log(`✅ ${table}: EXISTS`);
        results[table] = true;
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
      results[table] = false;
    }
  }

  const existingCount = Object.values(results).filter(Boolean).length;
  
  console.log(`\n📊 Result: ${existingCount}/4 tables exist\n`);

  if (existingCount === 0) {
    console.log('⚠️  NO TABLES FOUND - Your Supabase database is empty!\n');
    console.log('Let me create them now...\n');
    
    // Read and execute SQL
    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(path.join(__dirname, '../supabase-migration.sql'), 'utf8');
    
    console.log('📋 Attempting to create tables via Supabase REST API...\n');
    
    // Try using Supabase Management API
    const projectRef = 'dicstmwvrpyyszqxubhu';
    const https = require('https');
    
    const options = {
      hostname: `${projectRef}.supabase.co`,
      path: '/rest/v1/rpc/exec',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.REACT_APP_SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_SERVICE_KEY}`,
      },
    };

    console.log('⚠️  The REST API cannot execute raw SQL.');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  REQUIRED: Manual SQL Execution');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('Please follow these steps:');
    console.log('');
    console.log('1. Open: https://supabase.com/dashboard/project/dicstmwvrpyyszqxubhu/sql/new');
    console.log('');
    console.log('2. Copy ALL contents from: supabase-migration.sql');
    console.log('');
    console.log('3. Paste into SQL Editor');
    console.log('');
    console.log('4. Click "RUN" button');
    console.log('');
    console.log('5. Wait for "Success" message');
    console.log('');
    console.log('6. Then run this script again to verify');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    
    process.exit(1);
  } else if (existingCount < 4) {
    console.log(`⚠️  Only ${existingCount}/4 tables exist. Please run the full SQL script.`);
    process.exit(1);
  } else {
    console.log('✅ All tables exist! Ready for data migration.\n');
    return true;
  }
}

verifyProjectAndCreateTables().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
