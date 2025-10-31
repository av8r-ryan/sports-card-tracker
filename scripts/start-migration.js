#!/usr/bin/env node

console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   ✅ SUPABASE DATABASE IS READY!                     ║
║                                                       ║
║   All 4 tables exist:                                ║
║   ✅ users                                            ║
║   ✅ collections                                      ║
║   ✅ cards                                            ║
║   ✅ backups                                          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

🚀 TIME TO MIGRATE YOUR DATA!

STEP 1: Open your app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Go to: http://localhost:3000

STEP 2: Open Browser Console
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Press F12 (or Cmd+Option+I on Mac)

STEP 3: Copy and paste this command:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

await migrateToSupabase((progress) => {
  console.log(\`[\${progress.percentage}%] \${progress.step} - \${progress.current}/\${progress.total}\`);
});

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 4: Press Enter and wait
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The migration will:
  [25%] Migrate user
  [50%] Migrate collections
  [75%] Migrate cards (in batches of 100)
  [100%] Verify migration

STEP 5: After success
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You'll see:
  ✅ Migration completed successfully!
  - Cards: X/X migrated
  - Collections: Y/Y migrated
  
  ⚠️  You can now safely clear IndexedDB data
     Run: await clearIndexedDBAfterMigration()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️  Keep browser tab open during migration!
⚠️  Don't close browser until you see "Migration completed"!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// Try to open browser automatically
const open = require('open');
open('http://localhost:3000').catch(() => {
  console.log('\n💡 Could not auto-open browser. Please open manually:\n   http://localhost:3000\n');
});
