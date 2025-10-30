# Seed Data Export Instructions

## Step 1: Export Your Current Database

1. Open your app in the browser (locally)
2. Login with your admin account
3. Open the browser console (F12)
4. Run this command to download your cards:

```javascript
await window.seedData.download()
```

This will download a file called `cards-export-YYYY-MM-DD.json`

## Step 2: Add Seed Data to Your Project

1. Create the directory: `public/seed-data/`
2. Rename the downloaded file to `cards.json`
3. Move `cards.json` into `public/seed-data/`

Your file should be at: `public/seed-data/cards.json`

## Step 3: Deploy

Once you commit and push, the seed data will be included in your Vercel deployment.

## How It Works

- **First Login**: Automatically imports seed cards into IndexedDB
- **Subsequent Logins**: Skips import (cards already exist)
- **New Users**: Each user gets their own copy of the seed data

## Development Console Commands

In development mode, you can use these commands in the browser console:

```javascript
// Export cards to JSON string
await window.seedData.export()

// Download cards as JSON file
await window.seedData.download()

// Manually import seed data (provide user ID)
await window.seedData.import('your-user-id')

// Reset import flag (to re-import seed data)
window.seedData.reset()
```

## Testing the Import

1. Clear your IndexedDB:
   - Open DevTools (F12)
   - Go to Application → Storage → IndexedDB
   - Delete `SportsCardDatabase`
   
2. Reload the page

3. Login - seed data should auto-import

4. Check the console for import messages

## Seed Data File Format

```json
{
  "version": "1.0.0",
  "cards": [
    {
      "id": "...",
      "userId": "...",
      "player": "...",
      // ... all card fields
    }
  ],
  "lastUpdated": "2025-10-30T00:00:00.000Z"
}
```

## Updating Seed Data

To update seed data in the future:

1. Export new cards using `window.seedData.download()`
2. Replace `public/seed-data/cards.json`
3. Update the `version` field in the JSON
4. Commit and deploy

Users will automatically get the new data on next login (if version changed).
