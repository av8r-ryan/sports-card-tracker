import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedWrapper from '../Animation/AnimatedWrapper';
import CollapsibleMenu from '../UI/CollapsibleMenu';
import './Docs.css';

interface DocSection {
  id: string;
  title: string;
  icon: string;
  articles: DocArticle[];
}

interface DocArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

const Docs: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<DocArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const docSections: DocSection[] = useMemo(() => [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      articles: [
        {
          id: 'quick-start',
          title: 'Quick Start Guide',
          category: 'Getting Started',
          tags: ['beginner', 'setup'],
          content: `# Quick Start Guide

Welcome to CardFlex™! This guide will help you get started with managing your sports card collection.

## Creating Your Account
1. Click on "Register" in the top navigation
2. Enter your username, email, and password
3. Verify your email address
4. Start adding cards!

## Adding Your First Card
1. Navigate to the "Add Card" page
2. Fill in the card details (player, year, brand, etc.)
3. Upload a photo (optional but recommended)
4. Set the purchase price and current value
5. Click "Add Card" to save

## Organizing Collections
- Create custom collections to group your cards
- Use filters to find specific cards quickly
- View your portfolio stats on the dashboard

## Tips for Success
- Keep your card values updated for accurate tracking
- Use the photo upload feature for visual references
- Regularly back up your collection data
- Explore the reports section for insights`
        },
        {
          id: 'interface-overview',
          title: 'Interface Overview',
          category: 'Getting Started',
          tags: ['navigation', 'ui'],
          content: `# Interface Overview

## Navigation Menu
- **Dashboard**: View your collection overview and stats
- **Inventory**: Browse and manage all your cards
- **Add Card**: Add new cards to your collection
- **Collections**: Organize cards into custom groups
- **Reports**: Advanced analytics and insights
- **eBay**: Listing recommendations and integration

## User Menu
- **Profile**: Manage your account settings
- **Backup & Restore**: Save and restore your data
- **Export**: Export your collection data
- **Admin** (if applicable): Manage users and settings
- **Logout**: Sign out of your account

## Dashboard Features
- Total Cards, Investment, Value, and P&L tracking
- Recent Additions carousel
- Top Performers showcase
- Quick access to key features`
        }
      ]
    },
    {
      id: 'managing-cards',
      title: 'Managing Cards',
      icon: '📇',
      articles: [
        {
          id: 'adding-cards',
          title: 'Adding Cards',
          category: 'Managing Cards',
          tags: ['cards', 'add'],
          content: `# Adding Cards

## Manual Entry
1. Go to "Add Card" from the navigation
2. Complete the step-by-step form:
   - **Basic Info**: Player, Year, Brand, Team
   - **Card Details**: Card Number, Parallel, Condition
   - **Valuation**: Purchase Price, Current Value
   - **Additional**: Notes, Images

## Photo Upload
- Supports JPG, PNG formats
- Recommended: Clear, well-lit photos
- Multiple photos can be added per card

## Grading Information
- Select grading company (PSA, BGS, SGC, etc.)
- Enter grade if applicable
- Affects card valuation

## Collection Assignment
- Assign cards to specific collections
- Create new collections on-the-fly
- Move cards between collections anytime`
        },
        {
          id: 'editing-cards',
          title: 'Editing & Deleting Cards',
          category: 'Managing Cards',
          tags: ['cards', 'edit', 'delete'],
          content: `# Editing & Deleting Cards

## Editing Card Details
1. Navigate to Inventory
2. Click on any card to view details
3. Click "Edit" button
4. Update any field
5. Save changes

## Updating Values
Keep your collection value accurate:
- Update current values regularly
- Track market trends
- Record sales when cards are sold

## Deleting Cards
⚠️ **Warning**: Deletion is permanent!

1. Open card details
2. Click "Delete" button
3. Confirm deletion

## Bulk Operations
- Select multiple cards
- Bulk delete
- Bulk export
- Move to different collections`
        }
      ]
    },
    {
      id: 'collections',
      title: 'Collections & Organization',
      icon: '📚',
      articles: [
        {
          id: 'creating-collections',
          title: 'Creating Collections',
          category: 'Collections',
          tags: ['collections', 'organize'],
          content: `# Creating Collections

## What are Collections?
Collections allow you to organize your cards into logical groups like:
- By sport (Baseball, Basketball, Football)
- By player (LeBron James collection)
- By year (2020 Rookies)
- By value (High-value cards)
- Custom categories

## Creating a New Collection
1. Go to the Collections page
2. Click "Create Collection"
3. Enter a name and description
4. Choose an icon (optional)
5. Add cards immediately or later

## Collection Features
- **Visual Builder**: Drag and drop interface
- **Smart Grouping**: Auto-organize by category or value
- **Statistics**: View collection-specific stats
- **Export**: Export individual collections`
        },
        {
          id: 'smart-grouping',
          title: 'Smart Grouping',
          category: 'Collections',
          tags: ['collections', 'automation'],
          content: `# Smart Grouping

## Automatic Organization
CardFlex™ can automatically group your cards:

### By Category
- Sport type
- Card manufacturer
- Player position
- Card year

### By Value
- High-value cards ($1000+)
- Mid-range cards ($100-$999)
- Budget cards (Under $100)

## Creating Smart Groups
1. Go to Collections page
2. Enable Smart Grouping
3. Select grouping criteria
4. View automatically organized cards

## Benefits
- Quick access to specific card types
- Better portfolio understanding
- Easier inventory management
- Automated organization`
        }
      ]
    },
    {
      id: 'reports-analytics',
      title: 'Reports & Analytics',
      icon: '📊',
      articles: [
        {
          id: 'portfolio-reports',
          title: 'Portfolio Reports',
          category: 'Reports',
          tags: ['reports', 'analytics'],
          content: `# Portfolio Reports

## Available Reports

### Overview Reports
- **Dashboard**: Quick portfolio snapshot
- **Portfolio Overview**: Detailed statistics
- **Financial Performance**: P&L analysis

### Financial Reports
- **Collection Analytics**: Breakdown by category
- **Market Analysis**: Trends and insights
- **Tax Summary**: Annual sales and purchases

### Analytics Reports
- **Investment Insights**: ROI and performance
- **Detailed Inventory**: Complete card listing
- **Comparison Analysis**: Compare periods

## Using Filters
- Date range selection
- Collection filtering
- Category filtering
- Value range filtering

## Exporting Reports
- PDF format
- CSV format
- JSON format`
        },
        {
          id: 'market-insights',
          title: 'Market Insights',
          category: 'Reports',
          tags: ['market', 'trends'],
          content: `# Market Insights

## Understanding Market Trends
CardFlex™ provides insights into:
- Price movements
- Hot players and cards
- Market demand
- Seasonal trends

## AI-Powered Recommendations
- Optimal selling times
- Pricing suggestions
- Investment opportunities
- Risk assessments

## Tracking Performance
- Top performers in your collection
- Biggest gainers/losers
- ROI calculations
- Profit/loss tracking`
        }
      ]
    },
    {
      id: 'ebay-integration',
      title: 'eBay Integration',
      icon: '🛒',
      articles: [
        {
          id: 'ebay-setup',
          title: 'Setting Up eBay',
          category: 'eBay',
          tags: ['ebay', 'setup'],
          content: `# eBay Integration Setup

## Connecting Your eBay Account
1. Go to eBay Listings page
2. Click "Connect eBay Account"
3. Authorize CardFlex™
4. Start getting recommendations!

## Features
- **AI Pricing**: Optimal price suggestions
- **Instant Export**: One-click listing creation
- **Quick Export**: Fast listing generation
- **Bulk Export**: Export multiple cards

## Listing Recommendations
CardFlex™ analyzes:
- Market demand
- Recent sales data
- Similar listings
- Card condition and rarity

## Sync Status
- Real-time sync updates
- Live listing tracking
- Automatic price updates`
        },
        {
          id: 'bulk-operations',
          title: 'Bulk eBay Operations',
          category: 'eBay',
          tags: ['ebay', 'bulk'],
          content: `# Bulk eBay Operations

## Selecting Cards for Bulk Operations
1. Go to eBay Listings page
2. Use checkboxes to select cards
3. Choose bulk operation:
   - Export Selected
   - Update Prices
   - Update Categories

## Bulk Export
Export multiple listings at once:
- CSV format for eBay
- Pre-filled listing details
- Optimized descriptions
- Suggested pricing

## Bulk Price Updates
Update multiple card prices:
- Market-based pricing
- Custom adjustments
- AI recommendations
- Percentage increases/decreases

## Progress Tracking
Monitor bulk operations:
- Progress bars
- Success/failure counts
- Error details
- Export results`
        }
      ]
    },
    {
      id: 'account-settings',
      title: 'Account & Settings',
      icon: '⚙️',
      articles: [
        {
          id: 'profile-settings',
          title: 'Profile Settings',
          category: 'Settings',
          tags: ['account', 'profile'],
          content: `# Profile Settings

## Managing Your Profile
- Update username
- Change email address
- Update password
- Add profile photo
- Set display preferences

## Privacy Settings
- Collection visibility
- Data sharing preferences
- Email notifications
- Marketing preferences

## Achievements
Track your progress:
- Collection milestones
- Portfolio growth
- Platform usage
- Special badges

## Activity Timeline
View your recent activity:
- Cards added
- Sales recorded
- Exports performed
- Collection changes`
        },
        {
          id: 'backup-restore',
          title: 'Backup & Restore',
          category: 'Settings',
          tags: ['backup', 'data'],
          content: `# Backup & Restore

## Creating Backups
Protect your collection data:
1. Go to Backup & Restore page
2. Click "Create Backup"
3. Choose backup format (JSON/CSV)
4. Download backup file

## Automatic Backups
- Scheduled automatic backups
- Cloud storage integration
- Version history
- Backup notifications

## Restoring Data
⚠️ **Warning**: Restore will overwrite current data

1. Go to Backup & Restore page
2. Click "Restore from Backup"
3. Select backup file
4. Confirm restoration
5. Wait for completion

## Export Options
Export your data in multiple formats:
- **JSON**: Full data export
- **CSV**: Spreadsheet format
- **PDF**: Printable reports`
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: '🔧',
      articles: [
        {
          id: 'common-issues',
          title: 'Common Issues',
          category: 'Troubleshooting',
          tags: ['help', 'support'],
          content: `# Common Issues

## Login Problems
**Can't log in?**
- Verify username/email and password
- Clear browser cache
- Try password reset
- Check for typos

## Cards Not Displaying
**Cards not showing up?**
- Refresh the page
- Check collection filters
- Clear search query
- Verify cards were saved

## Slow Performance
**App running slow?**
- Clear browser cache
- Close unused tabs
- Check internet connection
- Reduce number of cards displayed

## Export Issues
**Export not working?**
- Check file permissions
- Try different format
- Clear browser downloads
- Disable popup blockers

## Data Sync Issues
**Data not syncing?**
- Check internet connection
- Refresh the page
- Log out and back in
- Contact support if persists`
        },
        {
          id: 'browser-support',
          title: 'Browser Support',
          category: 'Troubleshooting',
          tags: ['browsers', 'compatibility'],
          content: `# Browser Support

## Supported Browsers
CardFlex™ works best on:
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer (limited)

## Browser Requirements
- JavaScript enabled
- Cookies enabled
- LocalStorage enabled
- Minimum resolution: 1024x768

## Mobile Support
- Responsive design
- Touch-friendly interface
- Mobile browser support
- Coming soon: Native apps (2026)

## Clearing Cache
### Chrome
1. Press Ctrl+Shift+Delete
2. Select "Cached images and files"
3. Click "Clear data"

### Firefox
1. Press Ctrl+Shift+Delete
2. Select "Cache"
3. Click "Clear Now"

### Safari
1. Preferences > Privacy
2. Click "Manage Website Data"
3. Click "Remove All"`
        }
      ]
    }
  ], []);

  const allArticles = useMemo(() => {
    return docSections.flatMap(section => section.articles);
  }, [docSections]);

  const filteredArticles = useMemo(() => {
    if (!searchQuery) return allArticles;
    
    const query = searchQuery.toLowerCase();
    return allArticles.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.content.toLowerCase().includes(query) ||
      article.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [searchQuery, allArticles]);

  const handleArticleClick = (article: DocArticle) => {
    setSelectedArticle(article);
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
  };

  return (
    <div className="docs-container">
      <AnimatedWrapper animation="fadeInDown" duration={0.6}>
        <div className="docs-header">
          <h1 className="text-gradient">📚 Knowledge Base</h1>
          <p className="docs-subtitle">
            Everything you need to know about CardFlex™
          </p>
        </div>
      </AnimatedWrapper>

      <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.2}>
        <div className="docs-search">
          <input
            type="text"
            className="search-input"
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </AnimatedWrapper>

      <div className="docs-content">
        <AnimatePresence mode="wait">
          {!selectedArticle ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="docs-list"
            >
              {searchQuery ? (
                <div className="search-results">
                  <h2>Search Results ({filteredArticles.length})</h2>
                  <div className="articles-grid">
                    {filteredArticles.map((article, index) => (
                      <motion.div
                        key={article.id}
                        className="article-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        onClick={() => handleArticleClick(article)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <h3>{article.title}</h3>
                        <p className="article-category">{article.category}</p>
                        <div className="article-tags">
                          {article.tags.map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="docs-sections">
                  {docSections.map((section, sectionIndex) => (
                    <AnimatedWrapper
                      key={section.id}
                      animation="fadeInUp"
                      duration={0.6}
                      delay={sectionIndex * 0.1}
                    >
                      <CollapsibleMenu
                        title={section.title}
                        icon={section.icon}
                        defaultOpen={sectionIndex === 0}
                      >
                        <div className="articles-grid">
                          {section.articles.map((article, articleIndex) => (
                            <motion.div
                              key={article.id}
                              className="article-card"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: articleIndex * 0.05 }}
                              onClick={() => handleArticleClick(article)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <h3>{article.title}</h3>
                              <div className="article-tags">
                                {article.tags.map(tag => (
                                  <span key={tag} className="tag">{tag}</span>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CollapsibleMenu>
                    </AnimatedWrapper>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="article"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="article-view"
            >
              <button className="back-btn" onClick={handleBackToList}>
                ← Back to Documentation
              </button>
              
              <div className="article-header">
                <span className="article-category-badge">{selectedArticle.category}</span>
                <h1>{selectedArticle.title}</h1>
                <div className="article-tags">
                  {selectedArticle.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
              
              <div className="article-content">
                {selectedArticle.content.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={index}>{line.substring(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={index}>{line.substring(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={index}>{line.substring(4)}</h3>;
                  } else if (line.startsWith('- ')) {
                    return <li key={index}>{line.substring(2)}</li>;
                  } else if (line.trim() === '') {
                    return <br key={index} />;
                  } else if (line.startsWith('⚠️') || line.startsWith('✅')) {
                    return <p key={index} className="callout">{line}</p>;
                  } else {
                    return <p key={index}>{line}</p>;
                  }
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Docs;

