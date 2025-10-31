# 🚀 Migration Guide: IndexedDB to Supabase PostgreSQL

This guide will help you migrate your Sports Card Tracker data from local IndexedDB storage to Supabase PostgreSQL cloud database.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Migration](#database-migration)
5. [Testing](#testing)
6. [Cleanup](#cleanup)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting the migration, ensure you have:
- ✅ A Supabase account (free tier works)
- ✅ Your existing data in IndexedDB (browser local storage)
- ✅ Node.js and npm installed
- ✅ Access to your Supabase project dashboard

---

## 🎯 Supabase Setup

### Step 1: Run the SQL Migration Script

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/dicstmwvrpyyszqxubhu
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-migration.sql` from the project root
5. Paste it into the SQL editor
6. Click **Run** to execute the script

This will create:
- ✅ `users` table
- ✅ `collections` table
- ✅ `cards` table
- ✅ `backups` table
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Helper functions

### Step 2: Get Your API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Find the **Project URL**: `https://dicstmwvrpyyszqxubhu.supabase.co`
3. Copy the **anon public** key (starts with `eyJ...`)
4. Keep these handy for the next step

---

## ⚙️ Environment Configuration

### Step 1: Create Environment File

```bash
# Copy the example file
cp .env.example .env.local
```

### Step 2: Add Your Supabase Key

Open `.env.local` and add your key:

```env
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_KEY_HERE
```

### Step 3: Restart Development Server

```bash
# Stop the server (Ctrl+C)
# Then restart
npm start
```

---

## 🔄 Database Migration

### Step 1: Open Browser Console

1. Open your application in the browser
2. Open Developer Tools (F12 or Right-click → Inspect)
3. Go to the **Console** tab

### Step 2: Start Migration

Run the migration command in the console:

```javascript
await migrateToSupabase((progress) => {
  console.log(`${progress.step}: ${progress.percentage}%`);
});
```

This will:
1. ✅ Migrate your user profile
2. ✅ Migrate all collections
3. ✅ Migrate all cards (in batches of 100)
4. ✅ Verify the migration

### Step 3: Review Migration Results

The console will show:
```
📊 Migration Summary:
- Cards: X/X
- Collections: Y/Y
- Verified cards in Supabase: X
- Verified collections in Supabase: Y
✅ Migration completed successfully!
```

---

## 🧪 Testing

### Verify Your Data

1. **Check Supabase Dashboard:**
   - Go to **Table Editor** in Supabase
   - Browse `cards`, `collections`, and `users` tables
   - Verify row counts match your IndexedDB data

2. **Test in Application:**
   - Navigate through your cards
   - Create a new card
   - Update an existing card
   - Delete a test card
   - All should work seamlessly with Supabase

3. **Check Browser Console:**
   - Look for `[Supabase]` log messages
   - No errors should appear

---

## 🧹 Cleanup (Optional)

### Clear IndexedDB After Successful Migration

⚠️ **WARNING:** Only do this after confirming your data is safely in Supabase!

```javascript
await clearIndexedDBAfterMigration();
```

This will:
- Delete all data from local IndexedDB
- Free up browser storage space
- Your data remains safe in Supabase

---

## 🔧 Troubleshooting

### Migration Fails

**Problem:** Migration stops with errors

**Solutions:**
1. Check your internet connection
2. Verify Supabase API key is correct in `.env.local`
3. Check browser console for specific error messages
4. Ensure SQL migration script ran successfully

### Data Mismatch

**Problem:** Card counts don't match

**Solutions:**
1. Check for errors in console during migration
2. Run migration again (it won't duplicate data)
3. Manually verify specific cards in Supabase dashboard

### Need to Rollback

**Problem:** Want to go back to IndexedDB

**Solution:**
```javascript
await rollbackMigration();
```

This copies data from Supabase back to IndexedDB.

### API Key Issues

**Problem:** "API key not set" warning

**Solutions:**
1. Ensure `.env.local` file exists in project root
2. Verify key starts with `REACT_APP_` prefix
3. Restart development server after creating/updating `.env.local`
4. Check key doesn't have extra spaces or quotes

### RLS Policy Errors

**Problem:** "RLS policy violation" errors

**Solutions:**
1. Verify SQL migration script ran completely
2. Check RLS policies in Supabase dashboard under Authentication → Policies
3. Ensure `auth.uid()` matches your user ID
4. For testing, you can temporarily disable RLS (not recommended for production)

---

## 📊 Migration Checklist

Use this checklist to track your progress:

- [ ] Created Supabase project
- [ ] Ran SQL migration script
- [ ] Copied API keys
- [ ] Created `.env.local` file
- [ ] Added REACT_APP_SUPABASE_ANON_KEY
- [ ] Restarted development server
- [ ] Ran `migrateToSupabase()`
- [ ] Verified migration results
- [ ] Tested application functionality
- [ ] Checked Supabase dashboard
- [ ] (Optional) Cleared IndexedDB

---

## 🎉 Post-Migration

### What Changes

**Before (IndexedDB):**
- ❌ Data stored locally in browser
- ❌ Data lost if browser cache cleared
- ❌ Can't access from different devices
- ❌ No backup/sync capabilities

**After (Supabase):**
- ✅ Data stored in cloud PostgreSQL database
- ✅ Data persists across devices
- ✅ Access from any browser/device
- ✅ Automatic backups
- ✅ Better performance for large datasets
- ✅ Real-time sync capabilities
- ✅ Row Level Security

### Performance

- Faster queries for large collections (1000+ cards)
- Better search functionality
- Real-time updates
- No storage limits (compared to browser 50MB limit)

---

## 🆘 Need Help?

If you encounter issues:

1. Check browser console for error messages
2. Review Supabase logs in dashboard
3. Verify all environment variables are set
4. Contact support: Sookie@Zylt.AI

---

## 🔐 Security Notes

- ✅ All data is protected by Row Level Security (RLS)
- ✅ Users can only access their own data
- ✅ API keys are safe to commit (anon key is public)
- ✅ Sensitive data should use service_role key (not included in frontend)
- ✅ HTTPS encryption for all API calls

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

**Ready to migrate? Let's go! 🚀**
