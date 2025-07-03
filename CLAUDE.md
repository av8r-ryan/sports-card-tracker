# Sports Card Tracker - Project Context for Claude

## Project Overview
This is a comprehensive sports card collection management application built with React, TypeScript, and Dexie (IndexedDB). It helps collectors track, value, and manage their sports card portfolios with advanced features for investment analysis and eBay integration.

## Key Features

### Core Functionality
- **Card Management**: Add, edit, delete sports cards with detailed metadata
- **Enhanced Card Entry**: Advanced form with autographs, memorabilia, variations, and grading details
- **Photo Card Entry**: OCR-based card detection from photos (simulated)
- **Collections**: Organize cards into named collections
- **Multi-User Support**: User authentication and separate card collections per user

### Analytics & Reporting
- **Dashboard**: Portfolio overview with key metrics and charts
- **Investment Insights**: ROI analysis, risk assessment, category performance
- **Executive Dashboard**: High-level business intelligence views
- **Comparison Reports**: Before/after analysis, peer comparisons
- **Inventory Reports**: Detailed card listings and summaries

### Integration Features
- **eBay Integration**: 
  - Listing recommendations based on ROI and market timing
  - Bulk export to eBay File Exchange format
  - Quick export with instant CSV generation
  - Custom export options with filters
- **Import/Export**: CSV import/export functionality
- **Backup/Restore**: Full database backup and restore capabilities

## Technical Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Dexie.js** for IndexedDB (local storage)
- **Recharts** for data visualization
- **React Router** for navigation
- **Context API** for state management

### Data Models
- **Basic Card**: Simple model with core fields (player, team, year, etc.)
- **Enhanced Card**: Comprehensive model with 50+ fields including:
  - Authentication details (grading, population reports)
  - Special features (autographs, memorabilia, patches)
  - Investment metrics (purchase/sell prices, ROI)
  - Market data (price history, comparables)

### Key Services
- **Card Detection Service**: Simulated OCR for photo uploads
- **Text Extraction Service**: Enhanced text parsing from images
- **Player Database**: Local player information lookup
- **Manufacturer Database**: Card manufacturer details
- **eBay Listing Service**: Generate eBay-compatible exports
- **User Service**: Authentication and user management

## Current State & Recent Changes

### Recently Added
- Multi-user support with authentication
- Collections feature for organizing cards
- Enhanced reporting suite (Executive, Investment, Comparison)
- Photo-based card entry with OCR simulation
- Advanced eBay export options
- Backup and restore functionality

### Known Limitations
- **No Backend**: All data stored locally in browser (IndexedDB)
- **No Real API Integration**: Prices are manually entered
- **Simulated OCR**: Card detection from photos is mocked
- **No Real Authentication**: User system is local-only

## Development Guidelines

### Code Style
- TypeScript with strict mode
- Functional React components with hooks
- CSS modules for styling
- Comprehensive error handling
- No emojis unless requested

### Testing Approach
- Manual testing (no automated tests currently)
- Focus on user workflows
- Browser compatibility testing

### Common Commands
```bash
npm start          # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript compiler
```

## Future Integrations

### Sports Cards Pro API (Planned)
The application is designed to integrate with the Sports Cards Pro API for:
- Real-time market pricing
- Card verification and auto-complete
- Price history and trends
- Market analysis and insights

### Integration Points Ready
- Price lookup buttons in card forms (UI ready, needs API connection)
- Market value fields in data models
- Portfolio valuation infrastructure
- eBay pricing can use real market data

## Important Context

### User Base
- Serious collectors and investors
- Focus on ROI and portfolio management
- Need accurate valuations and market insights
- Want to optimize eBay selling

### Business Logic
- Cards can be in multiple collections
- Graded cards have higher value/liquidity
- ROI calculations: (currentValue - purchasePrice) / purchasePrice
- Holding period affects selling recommendations
- Categories: Baseball, Basketball, Football, Hockey, Soccer, Pokemon, Other

### eBay Integration Logic
- Recommends cards with >25% ROI
- Considers holding period (bonus for >6 months)
- Graded cards get higher scores
- Peak season: November-January
- Suggests 85-95% of current value as selling price

## Debugging & Troubleshooting

### Common Issues
1. **Data not persisting**: Check IndexedDB in browser DevTools
2. **Import failures**: Verify CSV format matches expected headers
3. **Export issues**: Check browser download settings
4. **Performance**: Large collections (>1000 cards) may be slow

### Useful Debugging Tools
- Browser DevTools > Application > IndexedDB
- React Developer Tools extension
- Network tab for API calls (when implemented)
- Console for error messages

## Project Structure
```
src/
├── components/          # React components
├── context/            # React Context providers
├── services/           # Business logic services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
└── db/                 # Database configuration
```

## Contact & Support
This is a personal project for tracking sports card collections. Future plans include:
- Backend API development
- Mobile app version
- Real-time market data integration
- Social features for collectors

---
*Last updated: 2025-06-27*