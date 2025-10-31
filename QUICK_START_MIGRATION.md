# 🚀 Supabase Migration - Quick Start

## Step 1: Get Your Supabase API Keys

1. Go to: https://supabase.com/dashboard/project/dicstmwvrpyyszqxubhu/settings/api
2. Copy these two keys:
   - **anon public** key (safe for client-side)
   - **service_role** key (for migrations only, keep secret!)

## Step 2: Configure Environment

Open `.env.local` in the project root and replace the placeholders:

```env
REACT_APP_SUPABASE_URL=https://dicstmwvrpyyszqxubhu.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-actual-anon-key-here
REACT_APP_SUPABASE_SERVICE_KEY=your-actual-service-key-here
```

## Step 3: Run SQL Migration

1. Go to: https://supabase.com/dashboard/project/dicstmwvrpyyszqxubhu/editor
2. Click "New query"
3. Copy the entire contents of `supabase-migration.sql`
4. Paste and click "Run"
5. Wait for "Success" message

## Step 4: Test Connection

```bash
npm run migrate:supabase
```

This will verify your configuration and database setup.

## Step 5: Migrate Your Data

1. Start your application:
   ```bash
   npm start
   ```

2. Open browser console (F12)

3. Run migration:
   ```javascript
   await migrateToSupabase((progress) => {
     console.log(`${progress.step}: ${progress.percentage}%`);
   });
   ```

4. Wait for completion (may take a few minutes for large datasets)

## Step 6: Verify Migration

Check the Supabase dashboard:
- https://supabase.com/dashboard/project/dicstmwvrpyyszqxubhu/editor

Browse tables to verify your data was migrated correctly.

## Step 7: Clean Up (Optional)

After confirming everything works, clear local IndexedDB:

```javascript
await clearIndexedDBAfterMigration();
```

## Need Help?

- **Full Guide**: See `MIGRATION_GUIDE.md`
- **Rollback**: Run `await rollbackMigration()` in console
- **Support**: Sookie@Zylt.AI

---

**That's it! Your data is now in Supabase! 🎉**
