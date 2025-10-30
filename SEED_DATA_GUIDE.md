# Seed Data Guide

## ✅ Seed Data Already Configured!

Your app comes with 10 sample sports cards pre-configured in `public/seed-data/cards.json`. These cards will automatically import when users first log in or register.

### Included Sample Cards:

1. **Baseball** - Mike Trout (2011 Topps Update RC)
2. **Baseball** - Shohei Ohtani (2018 Topps Chrome)
3. **Basketball** - Luka Dončić (2018 Panini Prizm)
4. **Basketball** - Giannis Antetokounmpo (2013 Panini Prizm)
5. **Football** - Patrick Mahomes (2017 Panini Prizm)
6. **Football** - Justin Herbert (2020 Panini Select)
7. **Hockey** - Connor McDavid (2015 Upper Deck)
8. **Pokemon** - Charizard (1999 Base Set)
9. **Pokemon** - Pikachu (2016 Evolutions)
10. **Soccer** - Lionel Messi (2004 Panini Mega Cracks)

## How It Works

- **First Login/Register**: Automatically imports 10 seed cards
- **Subsequent Logins**: Skips import (cards already exist)
- **Per User**: Each user gets their own copy of the seed data
- **Offline Ready**: Works without internet after first load

## Updating Seed Data

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
