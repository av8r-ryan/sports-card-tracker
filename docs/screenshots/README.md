# 📸 Screenshots Directory

This directory contains screenshots for the Sports Card Tracker documentation.

## 📋 Screenshot Requirements

When adding screenshots, please follow these guidelines:

### Naming Convention
- Use descriptive, kebab-case names
- Include the feature/section name
- Add version number if needed

Examples:
- `dashboard.png`
- `add-card-form.png`
- `executive-dashboard.png`
- `tax-report.png`
- `ebay-integration.png`

### Image Specifications
- **Format**: PNG (preferred) or JPEG
- **Resolution**: 1920x1080 or higher
- **File Size**: Optimize to under 500KB
- **Background**: Clean, no personal data visible

### Required Screenshots

#### Core Features
- [ ] `dashboard.png` - Main dashboard view
- [ ] `card-list.png` - Inventory grid view
- [ ] `card-details.png` - Single card detail view
- [ ] `add-card-form.png` - Classic add card form
- [ ] `enhanced-form.png` - Enhanced add card form
- [ ] `bulk-import.png` - CSV import interface

#### Reports
- [ ] `portfolio-report.png` - Portfolio performance report
- [ ] `tax-report.png` - Tax documentation report
- [ ] `insurance-report.png` - Insurance appraisal report
- [ ] `executive-dashboard.png` - Executive dashboard view
- [ ] `market-analysis.png` - Market analysis report

#### Features
- [ ] `ebay-integration.png` - eBay recommendations
- [ ] `ebay-export.png` - Bulk export interface
- [ ] `search-filters.png` - Advanced search/filter UI
- [ ] `settings.png` - User settings page

#### Mobile Views
- [ ] `mobile-dashboard.png` - Mobile responsive dashboard
- [ ] `mobile-card-list.png` - Mobile card list
- [ ] `mobile-menu.png` - Mobile navigation

## 🎨 Screenshot Guidelines

### Before Taking Screenshots

1. **Use Demo Data**: Never include real personal information
2. **Clear Browser**: Use incognito/private mode
3. **Hide Extensions**: Disable browser extensions
4. **Check Resolution**: Use standard 1920x1080
5. **Update Content**: Ensure UI shows latest version

### Demo Data to Use

```javascript
// Example cards for screenshots
{
  player: "Mike Trout",
  year: 2011,
  brand: "Topps Update",
  cardNumber: "US175",
  value: "$2,500",
  roi: "+400%"
}

{
  player: "LeBron James",
  year: 2003,
  brand: "Topps Chrome",
  cardNumber: "111",
  value: "$5,000",
  roi: "+250%"
}
```

### Taking Screenshots

#### macOS
- Full screen: `Cmd + Shift + 3`
- Selection: `Cmd + Shift + 4`
- Window: `Cmd + Shift + 4` then `Space`

#### Windows
- Full screen: `Windows + PrtScn`
- Selection: `Windows + Shift + S`
- Active window: `Alt + PrtScn`

#### Chrome DevTools
1. Open DevTools (`F12`)
2. Click device toolbar icon
3. Select device/resolution
4. Click three dots → "Capture screenshot"

### Post-Processing

1. **Crop**: Remove unnecessary browser chrome
2. **Annotate**: Add arrows/highlights if needed
3. **Optimize**: Use tools like TinyPNG
4. **Verify**: Check no personal data visible

## 🔄 Updating Screenshots

When updating screenshots:

1. Keep the same filename
2. Update documentation if UI changed
3. Note version/date in commit message
4. Check all references still valid

## 📝 Screenshot Placeholder

Until actual screenshots are available, use placeholder images with these dimensions:

- Dashboard: 1920x1080
- Reports: 1920x1200
- Mobile: 375x812
- Tablets: 768x1024

## 🎯 Priority Screenshots

High priority screenshots needed:

1. Main dashboard with data
2. Card list/inventory view
3. Add card form (both versions)
4. At least one report type
5. Mobile responsive view

---

To contribute screenshots, please follow the guidelines above and submit a PR with your images.