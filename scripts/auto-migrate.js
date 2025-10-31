#!/usr/bin/env node

/**
 * Complete Programmatic Migration from IndexedDB to Supabase
 * This script will:
 * 1. Connect to both IndexedDB (via file system) and Supabase
 * 2. Export all data from IndexedDB
 * 3. Import all data to Supabase
 * 4. Verify the migration
 */

const { createClient } = require('@supabase/supabase-js');
const Dexie = require('dexie');
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

console.log('═══════════════════════════════════════════════════════');
console.log('  Programmatic Migration: IndexedDB → Supabase');
console.log('  Sports Card Tracker');
console.log('═══════════════════════════════════════════════════════\n');

console.log('⚠️  This script cannot access browser IndexedDB from Node.js');
console.log('IndexedDB is a browser-only API.\n');
console.log('However, I can create a script that runs IN THE BROWSER\n');
console.log('Let me create an auto-run migration page...\n');

// Create an HTML file that will auto-run the migration
const fs = require('fs');
const path = require('path');

const migrationHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto Migration - Sports Card Tracker</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        .status {
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
            font-family: monospace;
        }
        .info { background: #e3f2fd; border-left: 4px solid #2196F3; }
        .success { background: #e8f5e9; border-left: 4px solid #4CAF50; }
        .error { background: #ffebee; border-left: 4px solid #f44336; }
        .warning { background: #fff3e0; border-left: 4px solid #ff9800; }
        .progress {
            width: 100%;
            height: 30px;
            background: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        #log {
            background: #263238;
            color: #aed581;
            padding: 15px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            max-height: 400px;
            overflow-y: auto;
            margin-top: 20px;
        }
        .log-line {
            margin: 5px 0;
            padding: 3px 0;
        }
        button {
            background: #2196F3;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 5px;
        }
        button:hover { background: #1976D2; }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .button-danger { background: #f44336; }
        .button-danger:hover { background: #d32f2f; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Automatic Migration to Supabase</h1>
        
        <div id="status" class="status info">
            Ready to migrate your data from IndexedDB to Supabase PostgreSQL
        </div>

        <div class="progress" id="progress-container" style="display:none;">
            <div class="progress-bar" id="progress-bar" style="width:0%">0%</div>
        </div>

        <div>
            <button id="start-btn" onclick="startMigration()">Start Migration</button>
            <button id="verify-btn" onclick="verifyData()" style="display:none;">Verify Data</button>
            <button id="clear-btn" onclick="clearIndexedDB()" class="button-danger" style="display:none;">Clear IndexedDB</button>
        </div>

        <div id="log"></div>
    </div>

    <script type="module">
        import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

        const supabase = createClient(
            '${process.env.REACT_APP_SUPABASE_URL}',
            '${process.env.REACT_APP_SUPABASE_ANON_KEY}'
        );

        let migrationResult = null;

        function log(message, type = 'info') {
            const logDiv = document.getElementById('log');
            const line = document.createElement('div');
            line.className = 'log-line';
            const timestamp = new Date().toLocaleTimeString();
            line.textContent = \`[\${timestamp}] \${message}\`;
            logDiv.appendChild(line);
            logDiv.scrollTop = logDiv.scrollHeight;
            console.log(message);
        }

        function updateStatus(message, type) {
            const statusDiv = document.getElementById('status');
            statusDiv.textContent = message;
            statusDiv.className = \`status \${type}\`;
        }

        function updateProgress(percentage, step) {
            const progressContainer = document.getElementById('progress-container');
            const progressBar = document.getElementById('progress-bar');
            progressContainer.style.display = 'block';
            progressBar.style.width = \`\${percentage}%\`;
            progressBar.textContent = \`\${percentage}% - \${step}\`;
        }

        window.startMigration = async function() {
            const startBtn = document.getElementById('start-btn');
            startBtn.disabled = true;
            startBtn.textContent = 'Migrating...';

            try {
                log('🚀 Starting migration...');
                updateStatus('Migration in progress...', 'info');

                // Import the migration function
                const { migrateToSupabase } = await import('/src/db/migrationTools.ts');

                // Run migration with progress updates
                migrationResult = await migrateToSupabase((progress) => {
                    updateProgress(progress.percentage, progress.step);
                    log(\`[\${progress.percentage}%] \${progress.step} - \${progress.current}/\${progress.total}\`);
                });

                if (migrationResult.success) {
                    updateStatus(\`✅ Migration completed successfully! Cards: \${migrationResult.cardsMigrated}, Collections: \${migrationResult.collectionsMigrated}\`, 'success');
                    log(\`✅ Migration complete! \${migrationResult.cardsMigrated} cards, \${migrationResult.collectionsMigrated} collections\`);
                    document.getElementById('verify-btn').style.display = 'inline-block';
                    document.getElementById('clear-btn').style.display = 'inline-block';
                } else {
                    updateStatus(\`⚠️ Migration completed with errors. Check logs.\`, 'warning');
                    log(\`⚠️ Errors: \${migrationResult.errors.join(', ')}\`);
                }

            } catch (error) {
                updateStatus(\`❌ Migration failed: \${error.message}\`, 'error');
                log(\`❌ Error: \${error.message}\`);
                console.error(error);
                startBtn.disabled = false;
                startBtn.textContent = 'Retry Migration';
            }
        };

        window.verifyData = async function() {
            log('🔍 Verifying data in Supabase...');
            
            try {
                const { data: cards, error: cardsError } = await supabase
                    .from('cards')
                    .select('*', { count: 'exact' });
                
                const { data: collections, error: collectionsError } = await supabase
                    .from('collections')
                    .select('*', { count: 'exact' });

                if (cardsError || collectionsError) {
                    log(\`❌ Verification failed: \${cardsError?.message || collectionsError?.message}\`);
                    return;
                }

                log(\`✅ Found \${cards?.length || 0} cards in Supabase\`);
                log(\`✅ Found \${collections?.length || 0} collections in Supabase\`);
                updateStatus(\`✅ Verification complete: \${cards?.length || 0} cards, \${collections?.length || 0} collections\`, 'success');

            } catch (error) {
                log(\`❌ Verification error: \${error.message}\`);
            }
        };

        window.clearIndexedDB = async function() {
            if (!confirm('⚠️  WARNING: This will permanently delete all data from IndexedDB!\\n\\nMake sure your data is safely in Supabase first!\\n\\nDo you want to continue?')) {
                return;
            }

            try {
                log('🗑️  Clearing IndexedDB...');
                const { clearIndexedDBAfterMigration } = await import('/src/db/migrationTools.ts');
                await clearIndexedDBAfterMigration();
                log('✅ IndexedDB cleared successfully');
                updateStatus('✅ IndexedDB cleared. All data is now in Supabase only.', 'success');
                document.getElementById('clear-btn').style.display = 'none';
            } catch (error) {
                log(\`❌ Error clearing IndexedDB: \${error.message}\`);
                updateStatus(\`❌ Failed to clear IndexedDB: \${error.message}\`, 'error');
            }
        };

        // Auto-start migration after 2 seconds
        setTimeout(() => {
            log('⏱️  Auto-starting migration in 2 seconds...');
            log('📝 Click "Start Migration" to begin now, or wait...');
        }, 500);

        setTimeout(() => {
            if (document.getElementById('start-btn').disabled === false) {
                startMigration();
            }
        }, 3000);
    </script>
</body>
</html>`;

// Write the HTML file
const outputPath = path.join(__dirname, '../public/auto-migrate.html');
fs.writeFileSync(outputPath, migrationHTML);

console.log('✅ Created auto-migration page!');
console.log('');
console.log('📄 File created: public/auto-migrate.html');
console.log('');
console.log('🚀 Opening migration page...');
console.log('');
console.log('Visit: http://localhost:3000/auto-migrate.html');
console.log('');
console.log('The migration will start automatically after 3 seconds!');
console.log('');

// Try to open the browser
const { exec } = require('child_process');
const url = 'http://localhost:3000/auto-migrate.html';

// Detect OS and open browser
const openCommand = process.platform === 'darwin' ? 'open' :
                    process.platform === 'win32' ? 'start' : 'xdg-open';

exec(`${openCommand} ${url}`, (error) => {
  if (error) {
    console.log('💡 Could not auto-open browser. Please visit manually:');
    console.log('   http://localhost:3000/auto-migrate.html\n');
  } else {
    console.log('✅ Browser opened!\n');
  }
});

console.log('═══════════════════════════════════════════════════════');
