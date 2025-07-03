# 🏆 Sports Card Tracker

A comprehensive web application for managing and tracking sports card collections. Built with React, TypeScript, and modern web technologies, featuring advanced analytics, professional reporting, and eBay integration.

![Version](https://img.shields.io/badge/version-2.4.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.x-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Table of Contents

- [Features](#-features)
- [What's New](#-whats-new)
- [Getting Started](#-getting-started)
- [Documentation](#-documentation)
- [Technologies](#-technologies)
- [Contributing](#-contributing)
- [Support](#-support)

## ✨ Features

### 📦 Collection Management
- **Smart Card Entry**: Classic and Enhanced forms with 100+ fields
- **Photo-Based Entry**: Upload card photos for automatic data extraction
- **Bulk Import**: CSV import for large collections
- **Advanced Search**: Multi-criteria filtering and search
- **Image Management**: High-resolution image support (up to 100MB)
- **Grading Integration**: PSA, BGS, SGC, and other major grading companies

### 📊 Professional Reporting Suite
- **Executive Dashboard**: High-level KPIs and strategic insights
- **Tax Reports**: IRS-compliant capital gains/losses documentation
- **Insurance Appraisals**: Professional valuations for coverage
- **Portfolio Analytics**: ROI tracking and performance metrics
- **Market Analysis**: Trends, comparisons, and opportunities
- **Custom Reports**: Flexible date ranges and filters

### 💰 eBay Integration
- **Professional Listing Generator**: Create optimized eBay listings instantly
- **Smart Title Builder**: 80-character titles with key features
- **HTML Descriptions**: Beautiful, mobile-responsive templates
- **Bulk Export**: Generate listings for multiple cards at once
- **File Exchange Ready**: CSV export for eBay bulk upload
- **AI-Powered Recommendations**: Smart listing suggestions with scoring
- **Price Optimization**: Market-based pricing suggestions

### 📈 Analytics & Insights
- **Real-Time Dashboard**: Live portfolio metrics and charts
- **Performance Tracking**: ROI, win rates, and growth trends
- **Category Analysis**: Breakdown by sport, brand, and player
- **Risk Assessment**: Concentration and volatility metrics
- **Investment Tools**: Hold/sell recommendations

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark Mode**: Eye-friendly viewing (coming soon)
- **Interactive Charts**: Powered by Recharts
- **Drag & Drop**: Intuitive card organization
- **Quick Actions**: Streamlined workflows

## 🆕 What's New (v2.4.0)

### 🛒 Professional eBay Listing Generator
- **Individual Listings**: One-click eBay listing creation for any card
- **Bulk Export**: Select multiple cards and export to CSV
- **Smart Titles**: Optimized 80-character titles with key features
- **HTML Templates**: Professional, mobile-responsive descriptions
- **Automatic Categorization**: Correct eBay category and condition mapping
- **Item Specifics**: All fields populated automatically
- **Multiple Export Formats**: HTML, CSV, and JSON

### 🏭 Manufacturer Licensing & Accurate Detection
- Comprehensive manufacturer database with real licensing data
- Sport-specific brand validation (e.g., Topps for MLB, Panini for NBA/NFL)
- Historical accuracy for vintage cards
- Year-based manufacturer selection
- Automatic correction of invalid manufacturer-sport combinations

### 🎯 Enhanced Player & Card Detection
- 100+ real players across all major sports
- Accurate team-player relationships
- Position-specific detection
- Rookie card identification
- Nickname recognition (e.g., "The Kid" → Ken Griffey Jr.)

### 📸 Photo-Based Card Entry
- Upload card photos for automatic data extraction
- AI-powered OCR with confidence scoring
- Front and back image support
- Review and edit extracted data before saving
- Tips for best photo capture results

### 🎯 Executive Dashboard
- Portfolio health score visualization
- Strategic insights with AI recommendations
- Advanced risk metrics and analysis
- Category performance matrix
- Investment opportunity identification

### 📋 Enhanced Reporting
- **Beautiful Tax Reports**: Green-themed design with tax optimization strategies
- **Professional Insurance Reports**: Gradient designs with comprehensive documentation
- **Market Analysis Reports**: Detailed insights and comparisons
- **Inventory Reports**: Complete collection breakdown
- **Comparison Reports**: Portfolio vs market performance

### 📚 Comprehensive Documentation
- Complete user guides and tutorials
- API reference documentation
- Troubleshooting and FAQ sections
- Contributing guidelines
- Screenshot placeholders for all features

### 🛠️ Technical Improvements
- Enhanced TypeScript types
- Improved error handling
- Performance optimizations
- Better accessibility support
- Cleaner code architecture

### Previous Updates (v2.3.0)
- Executive Dashboard with portfolio health metrics
- Enhanced Tax and Insurance Reports with modern UI
- Market Analysis and Comparison Reports
- Comprehensive documentation structure

## 🚀 Getting Started

### Prerequisites

- Node.js 16.0 or higher
- npm or yarn
- Modern web browser

### Quick Install

```bash
# Clone the repository
git clone https://github.com/yourusername/sports-card-tracker.git
cd sports-card-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

### First Steps

1. Create an account or use demo credentials
2. Add your first card using the intuitive form
3. Explore the dashboard to see your collection metrics
4. Generate your first report

For detailed setup instructions, see our [Installation Guide](docs/guides/installation.md).

## 📖 Documentation

### 📚 User Guides
- [Quick Start Guide](docs/guides/quick-start.md) - Get running in 5 minutes
- [Adding Cards Guide](docs/guides/adding-cards.md) - Master card entry
- [Reports Overview](docs/features/reports.md) - Generate professional reports
- [eBay Integration](docs/features/ebay-integration.md) - Optimize your listings

### 🔧 Technical Docs
- [API Reference](docs/api/README.md) - Backend API documentation
- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Troubleshooting](docs/guides/troubleshooting.md) - Common issues
- [FAQ](docs/guides/faq.md) - Frequently asked questions

### 🎯 Feature Guides
- [Dashboard Overview](docs/features/dashboard.md)
- [Executive Dashboard](docs/features/executive-dashboard.md)
- [Tax Reports](docs/features/tax-reports.md)
- [Insurance Reports](docs/features/insurance-reports.md)

## 🛠️ Technologies

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Recharts** - Beautiful data visualizations
- **CSS3** - Modern styling with gradients and animations
- **Context API** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **JWT** - Authentication

### Tools & Libraries
- **date-fns** - Date manipulation
- **jsPDF** - PDF generation
- **Concurrently** - Process management
- **ESLint/Prettier** - Code quality

## 📁 Project Structure

```
sports-card-tracker/
├── docs/                   # Comprehensive documentation
│   ├── api/               # API reference
│   ├── features/          # Feature guides
│   ├── guides/            # User guides
│   └── screenshots/       # UI screenshots
├── public/                # Static assets
├── server/                # Backend server
├── src/                   # Frontend source
│   ├── components/        # React components
│   │   ├── Dashboard/     # Main dashboard
│   │   ├── Reports/       # Reporting suite
│   │   ├── CardForm/      # Card entry forms
│   │   └── EbayListings/  # eBay tools
│   ├── context/           # State management
│   ├── services/          # Business logic
│   ├── types/             # TypeScript types
│   └── utils/             # Utilities
└── README.md              # You are here!
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Guide

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build
```

## 📈 Roadmap

### Coming Soon
- [ ] Mobile app (iOS/Android)
- [ ] Automatic price updates
- [ ] Social features
- [x] AI card recognition (Photo-based entry added!)
- [ ] Direct eBay API integration
- [ ] Multi-user collections
- [ ] Dark mode theme

### Future Enhancements
- Blockchain authentication
- NFT integration
- Advanced AI analytics
- Voice commands
- AR card viewing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Sports card collecting community
- Open source contributors
- Beta testers and early adopters
- UI/UX design inspiration from modern web apps

## 📞 Support

### Get Help
- 📖 [Documentation](docs/README.md)
- ❓ [FAQ](docs/guides/faq.md)
- 🐛 [Issue Tracker](https://github.com/yourusername/sports-card-tracker/issues)
- 💬 [Discussions](https://github.com/yourusername/sports-card-tracker/discussions)
- 📧 Email: support@sportscardtracker.com

### Community
- [Discord Server](https://discord.gg/sportscards)
- [Reddit Community](https://reddit.com/r/sportscardtracker)
- [Twitter Updates](https://twitter.com/sportscardtrack)

---

<div align="center">

**[Live Demo](https://sportscardtracker.com)** | **[Documentation](docs/README.md)** | **[Report Bug](https://github.com/yourusername/sports-card-tracker/issues)** | **[Request Feature](https://github.com/yourusername/sports-card-tracker/issues)**

Made with ❤️ by collectors, for collectors

**Version**: 2.3.0 | **Last Updated**: December 2024

</div>