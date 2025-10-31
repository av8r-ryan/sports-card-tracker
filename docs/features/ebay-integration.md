# 🏷️ eBay Integration Guide

Maximize your card sales with intelligent listing recommendations and bulk export tools.

## 🎯 Overview

The eBay Integration feature helps you:
- 🤖 Get AI-powered listing recommendations
- 💰 Optimize pricing strategies
- 📤 Export listings in bulk
- 📊 Track sales performance
- ⏰ Time your listings perfectly

![eBay Integration Dashboard](../screenshots/ebay-integration.png)

## 🚀 Getting Started

### Prerequisites
- Active eBay seller account
- Completed card inventory
- Updated card values

### Initial Setup

1. Navigate to **eBay** in the main menu
2. Review the listing recommendations
3. Configure your export preferences
4. Start with a small test batch

## 🤖 Smart Listing Recommendations

### AI Scoring Algorithm

Each card receives a score (0-100) based on:

#### Market Factors (40%)
- Current demand trends
- Recent sales velocity
- Seasonal patterns
- Market saturation

#### Card Attributes (30%)
- Player performance/news
- Condition/grading
- Rarity/print run
- Set popularity

#### Financial Metrics (30%)
- ROI potential
- Holding period
- Price appreciation
- Market volatility

### Understanding Scores

| Score | Recommendation | Action |
|-------|----------------|---------|
| 80-100 | 🔥 Hot - Sell Now | List immediately |
| 60-79 | 👍 Good - Consider Selling | List strategically |
| 40-59 | 🤔 Hold - Monitor Market | Wait for better conditions |
| 0-39 | ❄️ Cold - Keep Holding | Do not list |

### Recommendation Details

Each recommendation includes:

```
Example Card: 2018 Shohei Ohtani Rookie PSA 10
Score: 92/100 🔥

Why Sell Now:
✓ Recent MVP announcement (+25 points)
✓ High market demand (+20 points)
✓ Limited supply on eBay (+15 points)
✓ 45% price increase last 30 days (+20 points)
✓ Optimal ROI achieved (+12 points)

Suggested Price: $450-500
Optimal Listing Time: Sunday 7-9 PM EST
Expected Sale Time: 3-5 days
```

## 💰 Pricing Optimization

### Pricing Strategy Tools

#### 1. Competitive Analysis
- Live eBay pricing data
- Sold listings comparison
- Active listing analysis
- Price trend visualization

#### 2. Smart Pricing Suggestions
- **Starting Price**: Attracts bidders
- **Buy It Now**: Quick sale price
- **Reserve Price**: Minimum acceptable
- **Best Offer**: Negotiation starting point

#### 3. Dynamic Pricing Factors
- Card condition premium/discount
- Grading company preferences
- Market timing adjustments
- Seller rating impact

### Pricing Examples

```
Base Market Value: $100

Condition Adjustments:
- PSA 10: +50% = $150
- PSA 9: +20% = $120
- Raw NM: -10% = $90

Market Timing:
- Sunday evening: +5%
- Holiday season: +10%
- Off-season: -15%
```

## 📤 Bulk Export Tools

### Export Formats

#### 1. eBay File Exchange (Recommended)
- Direct upload to eBay
- All fields pre-mapped
- Bulk editing support
- Error validation

#### 2. CSV Format
- Universal compatibility
- Excel editing
- Custom templates
- Manual upload

#### 3. Turbo Lister Format
- Desktop software compatible
- Advanced features
- Scheduled listings
- Template support

### Export Options

#### Quick Export (One-Click)
1. Click **"Export All Unsold"**
2. Select format
3. Download file
4. Upload to eBay

#### Advanced Export
1. Click **"Export with Options"**
2. Configure:
   - Filter by score
   - Select categories
   - Set price ranges
   - Choose timeframe
3. Preview selections
4. Export customized file

### Bulk Export Fields

| Field | Description | Example |
|-------|-------------|---------|
| Title | Optimized listing title | "2021 Topps Chrome Mike Trout #100 PSA 10 GEM MINT MVP" |
| Category | eBay category ID | "64482" (Baseball Cards) |
| StartPrice | Opening bid/BIN price | "99.99" |
| BuyItNowPrice | Fixed price option | "149.99" |
| Duration | Listing duration | "7" (days) |
| Description | HTML formatted | Full description with images |
| Pictures | Image URLs | Up to 12 images |
| Shipping | Shipping details | Calculated or flat rate |

## 📝 Listing Templates

### Pre-Built Templates

#### 1. Graded Card Template
```html
<div class="graded-card-listing">
  <h2>[PLAYER] [YEAR] [BRAND] #[NUMBER]</h2>
  <h3>Grade: [GRADE] by [GRADING_COMPANY]</h3>
  
  <p><strong>Certification #:</strong> [CERT_NUMBER]</p>
  
  <h4>Condition Details:</h4>
  <ul>
    <li>Centering: [CENTERING]</li>
    <li>Corners: [CORNERS]</li>
    <li>Edges: [EDGES]</li>
    <li>Surface: [SURFACE]</li>
  </ul>
  
  <p>[CUSTOM_DESCRIPTION]</p>
</div>
```

#### 2. Raw Card Template
```html
<div class="raw-card-listing">
  <h2>[PLAYER] [YEAR] [BRAND] #[NUMBER]</h2>
  
  <h4>Condition: [CONDITION]</h4>
  
  <p><strong>Details:</strong></p>
  <p>[DETAILED_CONDITION_NOTES]</p>
  
  <p><strong>Please see photos for exact condition</strong></p>
</div>
```

### Custom Templates

Create your own templates:

1. Go to **Settings** → **eBay Templates**
2. Click **"New Template"**
3. Use variables: `[PLAYER]`, `[YEAR]`, etc.
4. Preview with sample data
5. Save for future use

## 📊 Sales Performance Tracking

### Post-Sale Analytics

Track your eBay sales:

#### Sales Metrics
- Total revenue
- Average sale price
- Sell-through rate
- Time to sale
- Category performance

#### ROI Analysis
- Actual vs. expected price
- Profit margins
- Fee calculations
- Net proceeds

### Performance Dashboard

![eBay Sales Dashboard](../screenshots/ebay-sales.png)

View:
- Monthly sales trends
- Best performing categories
- Buyer demographics
- Pricing effectiveness

## ⏰ Optimal Listing Times

### Best Times to List

Based on eBay data analysis:

#### By Day
1. **Sunday**: 6-9 PM EST (highest traffic)
2. **Thursday**: 7-10 PM EST
3. **Monday**: 8-10 PM EST

#### By Category
- **Baseball**: April-October
- **Basketball**: October-June
- **Football**: August-February
- **Pokemon**: Year-round, peaks in December

### Auction vs. Fixed Price

| Format | Best For | Duration |
|--------|----------|----------|
| Auction | Rare/graded cards | 7 days |
| Fixed Price | Common cards | 30 days |
| Best Offer | Mid-range cards | 30 days |

## 🛡️ Listing Best Practices

### Title Optimization

#### Include Key Terms
✅ DO Include:
- Player full name
- Year
- Brand and subset
- Card number
- Condition/Grade
- Key designations (RC, SP, etc.)

❌ DON'T Include:
- Excessive punctuation
- All caps
- Keyword stuffing
- False claims

#### Title Examples

Good:
```
2011 Topps Update Mike Trout RC Rookie #US175 PSA 10 GEM MINT Angels MVP
```

Bad:
```
MIKE TROUT ROOKIE!!!! BEST CARD EVER!!! L@@K!!! HOT HOT HOT
```

### Photo Guidelines

#### Requirements
- Minimum 1600x1200 pixels
- Show front and back
- Include corners close-up
- Show grading label clearly
- Natural lighting preferred

#### Photo Order
1. Front full card
2. Back full card
3. PSA/BGS label
4. All four corners
5. Any defects/features
6. Certification verification

### Description Best Practices

#### Essential Information
- Accurate condition description
- Shipping methods and timing
- Return policy
- Payment methods
- Combined shipping discounts

#### Trust Builders
- Seller experience
- Authentication details
- High-resolution photos
- Prompt communication
- Professional packaging

## 🔧 Troubleshooting

### Common Issues

**Export File Errors**
- Check field formatting
- Remove special characters
- Verify category IDs
- Ensure price formats

**Image Upload Issues**
- Resize to under 12MB
- Use JPEG format
- Check file names
- Remove spaces

**Listing Rejections**
- Review eBay policies
- Check prohibited terms
- Verify category selection
- Update product identifiers

## 💡 Pro Tips

### 1. Batch Processing
- List similar cards together
- Use bulk editing tools
- Schedule listings
- Automate repricing

### 2. Market Research
- Study completed listings
- Monitor competitor pricing
- Track market trends
- Adjust strategies

### 3. Customer Service
- Respond within 24 hours
- Provide tracking immediately
- Package professionally
- Request feedback

### 4. Fee Optimization
- Utilize free listings
- Consider store subscription
- Time promotions
- Minimize upgrades

## 📈 Advanced Features

### API Integration
- Real-time price updates
- Automated listing creation
- Inventory synchronization
- Order management

### Analytics Integration
- Google Analytics tracking
- Conversion optimization
- Traffic source analysis
- ROI calculations

## 🎯 Success Metrics

Track these KPIs:

| Metric | Target | Importance |
|--------|--------|------------|
| Sell-through rate | >60% | High |
| Average sale price | >90% of list | High |
| Time to sale | <7 days | Medium |
| Return rate | <2% | High |
| Feedback score | >99% | Critical |

## 🚀 Next Steps

1. Review your listing recommendations
2. Start with 5-10 test listings
3. Monitor performance
4. Adjust strategies
5. Scale successful approaches

---

Need help? Contact Sookie@Zylt.AI or visit our [eBay Integration FAQ](../guides/ebay-faq.md)