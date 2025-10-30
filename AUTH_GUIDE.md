# Local Authentication Guide

## Default Login Credentials

The app uses local IndexedDB storage for authentication. Multiple default admin accounts are automatically created. You can use any of these:

- **Email**: `admin@localhost` | **Password**: `admin`
- **Email**: `admin@sportscard.local` | **Password**: `admin`
- **Email**: `admin` | **Password**: `admin`

## First-Time Login

On the deployed site (Vercel), the admin user is created automatically when you first visit the site. If you're having trouble logging in:

1. **Try registering a new account** instead of using the admin account
2. **Clear your browser data** (IndexedDB) and reload the page
3. **Use the browser console** to debug (see below)

## Creating a New User

Simply click "Register" and create a new account with any email/password. All data is stored locally in your browser.

## Debugging (Development Mode)

In development, you can access debug functions in the browser console:

```javascript
// List all users
await window.debugAuth.listUsers()

// Check if a user exists (try all variations)
await window.debugAuth.checkUser('admin@localhost')
await window.debugAuth.checkUser('admin@sportscard.local')
await window.debugAuth.checkUser('admin')

// Manually create the admin users
await window.debugAuth.createAdmin()
```

## Troubleshooting

### "Invalid email or password" error

1. Clear your browser's IndexedDB storage:
   - Open DevTools (F12)
   - Go to Application tab > Storage > IndexedDB
   - Delete `LocalAuthDatabase` and `SportsCardDatabase`
   - Reload the page

2. Try registering a new account instead

### Can't access the site

The app works completely offline once loaded. No backend server is required.

## Security Note

This implementation uses SHA-256 hashing for passwords, which is suitable for local-only storage but NOT for production applications with real user data. For production use, implement proper backend authentication with bcrypt or similar.
