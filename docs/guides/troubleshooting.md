# 🔧 Troubleshooting Guide

Quick solutions to common issues with Sports Card Tracker.

## 🚨 Common Issues

### Login/Authentication Issues

#### Can't Log In
**Symptoms**: Login button doesn't work, wrong password error

**Solutions**:
1. Clear browser cache and cookies
2. Try incognito/private mode
3. Reset password using "Forgot Password"
4. Check if Caps Lock is on
5. Ensure JavaScript is enabled

#### Session Expires Frequently
**Symptoms**: Logged out unexpectedly

**Solutions**:
1. Check "Remember Me" when logging in
2. Disable aggressive browser privacy settings
3. Add site to trusted sites
4. Check system time is correct

### Data Issues

#### Cards Not Saving
**Symptoms**: Add card form doesn't save, no confirmation

**Solutions**:
```javascript
// Check browser console for errors
1. Press F12 to open developer tools
2. Click Console tab
3. Look for red error messages
4. Screenshot and report errors
```

**Common Fixes**:
- Ensure all required fields are filled
- Check date format (YYYY-MM-DD)
- Remove special characters from text fields
- Verify number fields don't contain text

#### Missing Cards
**Symptoms**: Cards disappeared from inventory

**Solutions**:
1. Check active filters
2. Search for specific card
3. Check "Show Sold Cards" toggle
4. Look in different categories
5. Try logging out and back in

#### Incorrect Calculations
**Symptoms**: ROI, totals, or values wrong

**Solutions**:
1. Verify purchase prices are entered
2. Check for $0 current values
3. Ensure dates are accurate
4. Recalculate totals (Settings → Recalculate)
5. Check for duplicate entries

### Performance Issues

#### Slow Loading
**Symptoms**: Pages take long to load, timeout errors

**Solutions**:
1. **Check Internet Speed**
   ```bash
   # Run speed test
   https://fast.com
   ```

2. **Clear Browser Cache**
   - Chrome: `Ctrl+Shift+Del`
   - Safari: `Cmd+Shift+Del`
   - Firefox: `Ctrl+Shift+Del`

3. **Optimize Collection Size**
   - Archive sold cards
   - Limit dashboard date range
   - Use pagination in inventory

4. **Browser Settings**
   - Disable unnecessary extensions
   - Update to latest browser version
   - Try different browser

#### App Crashes/Freezes
**Symptoms**: Page unresponsive, browser crashes

**Solutions**:
1. Reduce number of cards displayed
2. Disable image loading temporarily
3. Close other browser tabs
4. Increase browser memory limit
5. Use desktop instead of mobile

### Import/Export Issues

#### CSV Import Fails
**Symptoms**: Error message, cards not imported

**Common Errors & Fixes**:

| Error | Solution |
|-------|----------|
| "Invalid date format" | Use YYYY-MM-DD format |
| "Unknown category" | Use exact category names |
| "Missing required field" | Check player, year, brand columns |
| "File too large" | Split into batches of 500 |
| "Encoding error" | Save as UTF-8 CSV |

**CSV Template**:
```csv
player,year,brand,cardNumber,category,condition,purchasePrice,currentValue
"Mike Trout",2011,"Topps Update","US175","Baseball","Near Mint",500,2500
```

#### Export Not Working
**Symptoms**: Download doesn't start, corrupted file

**Solutions**:
1. Check popup blocker
2. Try different browser
3. Export smaller batches
4. Use different format (CSV vs PDF)
5. Check available disk space

### Image Issues

#### Images Not Uploading
**Symptoms**: Upload fails, no preview

**Solutions**:
1. **Check File Requirements**
   - Format: JPEG, PNG, GIF
   - Size: Under 100MB
   - Dimensions: Reasonable size

2. **Browser Issues**
   - Enable JavaScript
   - Allow site permissions
   - Clear browser cache

3. **File Fixes**
   - Rename without spaces
   - Resize large images
   - Convert HEIC to JPEG
   - Remove metadata

#### Images Not Displaying
**Symptoms**: Broken image icons, blank spaces

**Solutions**:
1. Refresh page (`Ctrl+F5`)
2. Check internet connection
3. Disable ad blockers
4. Clear image cache
5. Re-upload images

### Report Generation Issues

#### Reports Won't Generate
**Symptoms**: Stuck on loading, error messages

**Solutions**:
1. Reduce date range
2. Select fewer categories
3. Clear browser cache
4. Try different report type
5. Export as CSV instead of PDF

#### PDF Export Problems
**Symptoms**: Blank PDF, formatting issues

**Solutions**:
1. Update browser
2. Enable popup windows
3. Check PDF viewer
4. Try "Print to PDF"
5. Use Chrome for best results

### eBay Integration Issues

#### Recommendations Not Loading
**Symptoms**: No listing suggestions appear

**Solutions**:
1. Ensure cards have current values
2. Check category assignments
3. Update browser cache
4. Verify at least 10 cards in inventory

#### Export File Invalid
**Symptoms**: eBay rejects import file

**Solutions**:
1. Use eBay File Exchange format
2. Check category IDs are valid
3. Remove special characters from titles
4. Ensure prices are numeric
5. Limit title length to 80 characters

## 🛠️ Advanced Troubleshooting

### Browser Console Debugging

Access developer tools:
- **Chrome/Edge**: `F12` or `Ctrl+Shift+I`
- **Firefox**: `F12` or `Ctrl+Shift+I`
- **Safari**: `Cmd+Option+I`

Look for:
- Red error messages
- Failed network requests
- JavaScript errors
- 404 not found errors

### Local Storage Issues

Clear application data:
1. Open Developer Tools
2. Go to Application/Storage tab
3. Click "Clear storage"
4. Select all checkboxes
5. Click "Clear site data"

**Warning**: This will log you out and clear preferences

### Network Diagnostics

Check API connectivity:
```javascript
// In browser console
fetch('http://localhost:8000/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Expected response:
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

## 🔄 Reset Procedures

### Soft Reset
1. Log out
2. Clear browser cache
3. Close browser
4. Reopen and log in

### Hard Reset
1. Export all data first
2. Clear local storage
3. Delete browser data
4. Reinstall if necessary

### Data Recovery
If data is lost:
1. Check browser backups
2. Look for auto-saves
3. Contact support with details
4. Provide last known good date

## 📱 Mobile-Specific Issues

### iOS Safari
- Enable JavaScript
- Allow cookies
- Disable private browsing
- Update to latest iOS

### Android Chrome
- Clear app cache
- Enable desktop mode
- Check data saver settings
- Update Chrome app

### Progressive Web App
- Clear app data
- Reinstall PWA
- Check permissions
- Enable notifications

## 🆘 When to Contact Support

Contact support if:
- Data loss occurs
- Account access issues persist
- Payment/billing problems
- Bug affects multiple users
- Security concerns

**Information to Provide**:
1. Browser and version
2. Operating system
3. Screenshots of errors
4. Steps to reproduce
5. Time issue occurred

## 📞 Support Channels

### Self-Service
- [FAQ](faq.md)
- [Documentation](../README.md)
- [Video Tutorials](https://youtube.com/sportscardtracker)

### Direct Support
- Email: Sookie@Zylt.AI
- Response time: 24-48 hours
- Include ticket number in replies

### Community
- [Forum](https://community.sportscardtracker.com)
- [Discord](https://discord.gg/sportscards)
- [Reddit](https://reddit.com/r/sportscardtracker)

## 🔐 Security Issues

If you suspect security issues:
1. Change password immediately
2. Log out all devices
3. Check recent activity
4. Enable 2FA
5. Contact support urgently

---

Still need help? Email Sookie@Zylt.AI with your issue details.