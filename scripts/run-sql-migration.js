#!/usr/bin/env node

/**
 * Direct SQL Execution Script for Supabase
 * This will execute the SQL migration directly via the Supabase API
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;
const projectId = 'dicstmwvrpyyszqxubhu';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });

    const options = {
      hostname: `${projectId}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: body });
        } else {
          resolve({ success: false, error: body, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function runMigration() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Supabase SQL Migration Execution');
  console.log('  Project: dicstmwvrpyyszqxubhu');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../supabase-migration.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Reading migration SQL file...');
    console.log(`📊 File size: ${(sqlContent.length / 1024).toFixed(2)} KB\n`);

    // Execute the entire SQL script
    console.log('🚀 Executing SQL migration...\n');
    console.log('This may take a minute...\n');

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Split into statements and execute
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/));

    console.log(`Found ${statements.length} SQL statements\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip empty or comment-only statements
      if (statement.trim() === ';' || statement.trim().startsWith('/*')) {
        continue;
      }

      // Show progress
      const progress = Math.round(((i + 1) / statements.length) * 100);
      process.stdout.write(`\r[${progress}%] Executing statement ${i + 1}/${statements.length}...`);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          if (error.message && (
            error.message.includes('already exists') ||
            error.message.includes('does not exist') ||
            error.message.includes('duplicate')
          )) {
            skipCount++;
          } else {
            errorCount++;
            errors.push({ statement: i + 1, error: error.message });
          }
        } else {
          successCount++;
        }
      } catch (err) {
        errorCount++;
        errors.push({ statement: i + 1, error: err.message });
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('\n\n📊 Migration Results:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⚠️  Skipped: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    if (errors.length > 0 && errors.length < 5) {
      console.log('\n⚠️  Errors encountered:');
      errors.forEach(e => {
        console.log(`   Statement ${e.statement}: ${e.error}`);
      });
    }

    // Verify tables
    console.log('\n🔍 Verifying tables...\n');
    
    const tables = ['users', 'collections', 'cards', 'backups'];
    let allTablesExist = true;

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`   ❌ Table "${table}" - ${error.message}`);
          allTablesExist = false;
        } else {
          console.log(`   ✅ Table "${table}" exists (${count || 0} rows)`);
        }
      } catch (err) {
        console.log(`   ❌ Table "${table}" - ${err.message}`);
        allTablesExist = false;
      }
    }

    if (allTablesExist) {
      console.log('\n✅ Database setup complete!');
      console.log('\n📝 Next steps:');
      console.log('   1. Run: npm start');
      console.log('   2. Open browser console');
      console.log('   3. Run: await migrateToSupabase()');
    } else {
      console.log('\n⚠️  Some tables are missing. You may need to run the SQL manually.');
      console.log('   Go to: https://supabase.com/dashboard/project/dicstmwvrpyyszqxubhu/editor');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Try running the SQL manually in Supabase Dashboard:');
    console.error('   https://supabase.com/dashboard/project/dicstmwvrpyyszqxubhu/editor');
    process.exit(1);
  }
}

runMigration();
