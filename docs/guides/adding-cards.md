# 📝 Adding Cards - Complete Guide

Learn everything about adding cards to your Sports Card Tracker collection, from basic entries to advanced features.

## 📋 Table of Contents

- [Overview](#overview)
- [Classic Form](#classic-form)
- [Enhanced Form](#enhanced-form)
- [Bulk Import](#bulk-import)
- [Image Upload](#image-upload)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Sports Card Tracker offers three ways to add cards:

1. **Classic Form** - Quick entry for basic information
2. **Enhanced Form** - Comprehensive data entry with 100+ fields
3. **Bulk Import** - Add multiple cards via CSV

## 📱 Classic Form

The Classic Form is perfect for quickly adding cards with essential information.

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| Player Name | Full name of the player | "Mike Trout" |
| Year | Card year | "2011" |
| Brand | Card manufacturer | "Topps" |
| Card Number | Number on the card | "330" |
| Category | Sport category | "Baseball" |

### Optional Fields

| Field | Description | Example |
|-------|-------------|---------|
| Team | Player's team | "Angels" |
| Condition | Card condition | "Near Mint" |
| Purchase Price | What you paid | "$50.00" |
| Current Value | Market value | "$150.00" |
| Purchase Date | When acquired | "01/15/2023" |
| Notes | Additional info | "Rookie card" |

### Step-by-Step Instructions

1. Navigate to **Add Card** in the main menu
2. Select **Classic Form**
3. Fill in the required fields:
   ```
   Player: Ken Griffey Jr
   Year: 1989
   Brand: Upper Deck
   Card Number: 1
   Category: Baseball
   ```
4. Add optional information:
   ```
   Team: Mariners
   Condition: Mint
   Purchase Price: $75
   Current Value: $300
   ```
5. Click **Add Card**

![Classic Form Example](../screenshots/classic-form.png)

## 🚀 Enhanced Form

The Enhanced Form provides comprehensive tracking with over 100 fields across 11 categories.

### Categories Overview

#### 1. Basic Information
- Player details
- Card identification
- Team and category

#### 2. Card Details
- Set information
- Parallel/variation
- Print run
- Population data

#### 3. Collection Information
- Purchase details
- Current valuation
- Location tracking
- Acquisition source

#### 4. Grading Information
- Grading company (PSA, BGS, SGC, etc.)
- Grade and subgrades
- Certification number
- Population report data

#### 5. Authentication & Features
- Autograph authentication
- Memorabilia details
- Special features (1/1, rookie, etc.)

#### 6. Player Metadata
- Career statistics
- Achievements
- Hall of Fame status
- Active years

#### 7. Market Analysis
- Price trends
- Comparable sales
- Market demand
- Investment rating

#### 8. Investment Details
- ROI calculations
- Hold/sell recommendations
- Target prices
- Risk assessment

#### 9. Storage Information
- Physical location
- Protection method
- Insurance details
- Accessibility

#### 10. History & Provenance
- Previous owners
- Exhibition history
- Publication features
- Notable sales

#### 11. Additional Notes
- Personal notes
- Reminders
- Custom tags

### Enhanced Form Best Practices

1. **Start with Basic Info**
   - Fill required fields first
   - Add details progressively

2. **Use Auto-Complete**
   - Player names
   - Team names
   - Brand names

3. **Leverage Templates**
   - Save common entries
   - Reuse for similar cards

### Example: Adding a Graded Card

```yaml
# Basic Information
Player: Michael Jordan
Year: 1986
Brand: Fleer
Card Number: 57
Category: Basketball

# Grading Information
Grading Company: PSA
Grade: 9
Cert Number: 12345678
Population Higher: 315
Population Equal: 1250

# Collection Information
Purchase Price: $5,000
Current Value: $8,500
Purchase Date: 06/15/2023
Seller: PWCC Auction

# Investment Details
Investment Rating: Buy/Hold
Target Sell Price: $10,000
Risk Level: Medium
Expected Hold: 2-3 years
```

## 📊 Bulk Import

Import multiple cards at once using CSV files.

### Step 1: Download Template

1. Go to **Add Card** → **Bulk Import**
2. Click **Download CSV Template**
3. Open in Excel or Google Sheets

### Step 2: Fill in Your Data

The CSV template includes these columns:

```csv
player,year,brand,cardNumber,team,category,condition,purchasePrice,currentValue,purchaseDate,gradingCompany,grade
"Mike Trout",2011,"Topps Update","US175","Angels","Baseball","Near Mint",500,2500,"2020-01-15","PSA",9
"LeBron James",2003,"Topps Chrome","111","Cavaliers","Basketball","Mint",1000,5000,"2021-06-20","BGS",9.5
```

### Step 3: Import Your File

1. Save your CSV file
2. Click **Choose File** in the import section
3. Select your CSV
4. Review the preview
5. Click **Import Cards**

### Import Tips

- ✅ Maximum 1000 cards per import
- ✅ Dates must be in YYYY-MM-DD format
- ✅ Leave cells empty for optional fields
- ✅ Use exact category names: Baseball, Basketball, Football, Pokemon, Other

### Common Import Errors

| Error | Solution |
|-------|----------|
| "Invalid date format" | Use YYYY-MM-DD format |
| "Unknown category" | Check spelling of category |
| "Duplicate card" | Review existing inventory |
| "Missing required field" | Ensure player, year, brand are filled |

## 🖼️ Image Upload

Add images to your cards for visual reference.

### Image Requirements

- **Format**: JPEG, PNG, GIF
- **Size**: Up to 100MB per image
- **Recommended**: 800x1200 pixels
- **Multiple Images**: Front and back supported

### How to Upload Images

1. **During Card Creation**:
   - Click "Add Image" button
   - Select your image file
   - Preview will appear
   - Image uploads with card

2. **To Existing Cards**:
   - Click on the card
   - Select "Edit"
   - Click "Add/Change Image"
   - Save changes

### Image Best Practices

- 📸 Use good lighting
- 🔍 Include both front and back
- 📏 Maintain aspect ratio
- 🗜️ Compress large files
- 🏷️ Name files descriptively

## ✨ Best Practices

### 1. Consistency is Key

- **Player Names**: Use full names consistently
  - ✅ "Michael Jordan"
  - ❌ "MJ" or "M. Jordan"

- **Brand Names**: Use official names
  - ✅ "Topps Chrome"
  - ❌ "Topps Chr" or "Chrome"

### 2. Accurate Pricing

- Update values monthly
- Use recent sales data
- Consider condition carefully
- Factor in market trends

### 3. Detailed Descriptions

Good example:
```
"1989 Upper Deck Ken Griffey Jr RC #1, PSA 9. 
Centered 55/45 L/R, sharp corners, no print defects. 
Purchased from authenticated dealer with receipt."
```

Poor example:
```
"Griffey rookie, good condition"
```

### 4. Organization Tips

- Use consistent categories
- Add tags for easy filtering
- Include purchase receipts
- Document grading history

## 🔧 Troubleshooting

### Common Issues

**Card Won't Save**
- Check all required fields
- Ensure price format is correct (no $ symbol needed)
- Verify date format

**Image Won't Upload**
- Check file size (under 100MB)
- Ensure correct format (JPEG/PNG)
- Try a different browser

**Duplicate Card Warning**
- Review your existing inventory
- Check for typos in player name
- Verify card number

**Import Fails**
- Download fresh template
- Check CSV formatting
- Ensure no special characters

### Getting Help

If you encounter issues:

1. Check the error message carefully
2. Review this guide's requirements
3. Try the [Troubleshooting Guide](troubleshooting.md)
4. Contact support with:
   - Error message
   - Steps to reproduce
   - Browser/device info

## 🎯 Quick Reference

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Next field |
| `Shift + Tab` | Previous field |
| `Ctrl/Cmd + S` | Save card |
| `Esc` | Cancel form |

### Field Validation

| Field | Validation |
|-------|------------|
| Year | 1900-current year |
| Price | Positive numbers only |
| Grade | 1-10 (0.5 increments) |
| Card # | Alphanumeric |

### Supported Grading Companies

- PSA (Professional Sports Authenticator)
- BGS (Beckett Grading Services)
- SGC (Sportscard Guaranty)
- CGC (Certified Guaranty Company)
- HGA (Hybrid Grading Approach)
- CSG (Certified Sports Guaranty)

---

Next: [Collection Management Guide](collection-management.md) →