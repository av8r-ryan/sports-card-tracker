#!/usr/bin/env node

/**
 * Data Migration Script: IndexedDB → Supabase
 * 
 * This script runs in the browser context to access IndexedDB
 * and migrate data to Supabase.
 */

console.log(`
═══════════════════════════════════════════════════════
  Data Migration: IndexedDB → Supabase
  Sports Card Tracker
═══════════════════════════════════════════════════════

📋 Instructions:

1. Start your development server:
   npm start

2. Open your application in browser:
   http://localhost:3000

3. Open Browser Console (F12 or Cmd+Option+I)

4. Run the migration command:
   await migrateToSupabase((progress) => {
     console.log(\`\${progress.step}: \${progress.percentage}%\`);
   });

5. Wait for migration to complete

6. Verify your data in Supabase Dashboard:
   https://supabase.com/dashboard/project/dicstmwvrpyyszqxubhu/editor

7. Optional - Clear IndexedDB:
   await clearIndexedDBAfterMigration();

═══════════════════════════════════════════════════════

⚠️  Important Notes:
   - Keep browser tab open during migration
   - Don't close browser until migration completes
   - Check console for any errors
   - Data is copied (not moved) until you run cleanup

🔧 Available Commands:
   migrateToSupabase()          - Start migration
   clearIndexedDBAfterMigration() - Clean up local storage
   rollbackMigration()          - Restore from Supabase to IndexedDB

═══════════════════════════════════════════════════════
`);
