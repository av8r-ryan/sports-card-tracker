# Sports Card Tracker

A comprehensive web application for managing and tracking sports card collections. Built with React, TypeScript, and modern web technologies, featuring advanced analytics, reporting, and eBay integration.

![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.x-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)

## 🚀 Features

### Core Features
- **Card Management**: Add, edit, delete, and organize your sports card collection
- **Enhanced Data Model**: 100+ fields across 11 categories for comprehensive card tracking
- **Dashboard Analytics**: Real-time portfolio value, ROI, and collection statistics
- **Advanced Search**: Filter and search cards by multiple criteria
- **Image Support**: Upload and view card images (up to 100MB)
- **Responsive Design**: Optimized for desktop and mobile devices
- **Authentication**: Secure user accounts with role-based access
- **Data Persistence**: Local storage with cloud sync capabilities

### 📊 Advanced Reporting System
- **Financial Performance Reports**
  - ROI Analysis with time-based comparisons
  - Profit/Loss statements
  - Investment tracking
- **Collection Analytics**
  - Distribution by category, brand, and player
  - Grading analysis
  - Market trends
- **Visual Dashboards**
  - Interactive charts and graphs
  - Real-time metrics
  - Export to PDF functionality
- **Custom Reports**
  - Insurance valuations
  - Tax documentation
  - Sales history

### 💰 eBay Integration
- **Smart Listing Recommendations**
  - AI-powered scoring algorithm
  - Optimal pricing suggestions
  - Best time to sell analysis
- **Bulk Export Tools**
  - Multiple export formats (CSV, TXT, eBay File Exchange)
  - Custom filtering options
  - One-click export for all unsold cards
- **Listing Management**
  - Pre-filled listing templates
  - Category mapping
  - Title optimization

### 🎨 Enhanced UI Features
- **Modern Card Display**
  - Grid and list views
  - Sold banner overlay for sold cards
  - Quick actions (edit/delete) positioned at bottom-right
- **Improved Typography**
  - Responsive font sizing
  - Optimized stat card layouts
  - 3-column grid system
- **Professional Styling**
  - Clean, modern interface
  - Intuitive navigation
  - Consistent design language

## 🛠 Technologies Used

- **Frontend**: React 18, TypeScript, CSS3
- **State Management**: Context API with reducers
- **Data Visualization**: Recharts
- **PDF Generation**: jsPDF with auto-table
- **Image Handling**: FileReader API with compression
- **Authentication**: JWT-based auth system
- **Build Tools**: Create React App, ESLint, Prettier

## 🏁 Getting Started

### Prerequisites

- Node.js 14+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sports-card-tracker.git
cd sports-card-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`.

### Production Build

To create a production build:
```bash
npm run build
```

## 📖 Usage Guide

### Adding Cards

1. Click "Add Card" in the navigation
2. Choose between Classic or Enhanced form
3. Fill in card details:
   - **Basic Info**: Player, year, brand, card number
   - **Collection Data**: Purchase price/date, current value
   - **Grading Info**: Company, grade, certification number
   - **Enhanced Fields** (optional):
     - Authentication data
     - Special features (autographs, memorabilia)
     - Market analysis
     - Storage location
     - Investment metrics

### Managing Your Collection

- **Inventory View**: Browse all cards with filtering
- **Card Details**: Click any card for full information
- **Quick Actions**: Edit or delete from card view
- **Bulk Operations**: Export multiple cards at once

### Generating Reports

1. Navigate to "Reports" section
2. Choose report type:
   - Portfolio Summary
   - ROI Analysis
   - Collection Distribution
   - Sales History
3. Customize parameters (date range, categories)
4. Export as PDF or view on-screen

### eBay Listing Tools

1. Go to "eBay Listings"
2. Review AI-powered recommendations
3. Use bulk export options:
   - **Instant Export**: Quick CSV for all unsold cards
   - **Export with Details**: Review before exporting
   - **Custom Options**: Advanced filtering
4. Import CSV to eBay's bulk listing tool

## 🔧 Advanced Features

### Enhanced Card Data Model

The application supports comprehensive card tracking with:
- **Identification**: Serial numbers, print runs, population data
- **Player Metadata**: Career stats, achievements, hall of fame status
- **Authentication**: Multiple grading services, crack-out history
- **Special Features**: Autographs, game-used memorabilia, 1/1 cards
- **Market Data**: Price history, comparable sales, demand metrics
- **Investment Analysis**: Purchase strategy, hold recommendations
- **Storage**: Physical location, protective measures
- **History**: Ownership chain, exhibition history
- **Valuation**: Insurance values, appraisal data

### Data Storage

All data is stored locally in your browser using the Local Storage API. Your collection data persists between sessions but is only available on the device where it was created.

## 📁 Project Structure

```
sports-card-tracker/
├── public/                 # Static files
├── src/                   # React source code
│   ├── components/        # React components
│   │   ├── CardList/     # Card listing with grid/list views
│   │   ├── CardForm/     # Classic card entry form
│   │   ├── EnhancedCardForm/ # Professional card form
│   │   ├── Dashboard/    # Analytics dashboard
│   │   ├── Reports/      # Reporting suite
│   │   └── EbayListings/ # eBay integration
│   ├── context/          # State management
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Utility functions
│   └── services/         # API and reporting services
├── build/               # Production build
└── README.md           # This file
```

## 🔮 Recent Updates (v2.1.0)

### eBay Integration
- Added smart listing recommendations with AI scoring
- Bulk export tools with multiple formats
- One-click export for all unsold cards
- Optimal pricing suggestions

### UI Improvements
- Repositioned edit/delete buttons to bottom-right
- Added sold banner overlay for sold cards
- Fixed stat card text overflow issues
- Implemented 3-column grid layout

### Enhanced Features
- Increased image upload limit to 100MB
- Added comprehensive reporting suite (10+ report types)
- Visual analytics dashboard with charts
- Professional PDF export with formatting

### Data Model Enhancements
- 100+ fields across 11 categories
- Dual form system (classic and enhanced)
- Automatic data migration
- LocalStorage persistence

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain test coverage
- Update documentation
- Use semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Sports card community for feedback and suggestions
- Contributors and testers
- Open source libraries and tools

## 📞 Support

For support, please:
- Open an issue on GitHub
- Check the troubleshooting section
- Review the documentation

---

**Version**: 2.1.0  
**Last Updated**: December 2024

**Built with ❤️ for collectors by collectors**