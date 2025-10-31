# 🛠️ Installation Guide

This guide will walk you through setting up Sports Card Tracker on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16.0 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`
- **npm** (comes with Node.js)
  - Verify installation: `npm --version`
- **Git** (for cloning the repository)
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`

## 🚀 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/sports-card-tracker.git
cd sports-card-tracker
```

### 2. Install Dependencies

Install all required packages:

```bash
npm install
```

This will install both frontend and backend dependencies.

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# API Configuration
REACT_APP_API_URL=http://localhost:8000

# Feature Flags
REACT_APP_ENABLE_EBAY=true
REACT_APP_ENABLE_REPORTS=true
```

### 4. Start the Development Server

Run both the frontend and backend servers:

```bash
npm run dev
```

This command will:
- Start the backend server on port 8000
- Start the React development server on port 3000
- Open your browser to `http://localhost:3000`

## 🔧 Alternative Installation Methods

### Using Yarn

If you prefer Yarn over npm:

```bash
yarn install
yarn dev
```

### Manual Server Start

To start servers separately:

**Backend Server:**
```bash
cd server
npm run dev
```

**Frontend Server:**
```bash
npm start
```

## 🐳 Docker Installation (Optional)

If you prefer using Docker:

```bash
# Build the Docker image
docker build -t sports-card-tracker .

# Run the container
docker run -p 3000:3000 -p 8000:8000 sports-card-tracker
```

## ✅ Verify Installation

1. **Check Frontend**: Navigate to `http://localhost:3000`
   - You should see the login page
   - No console errors in browser developer tools

2. **Check Backend**: Navigate to `http://localhost:8000/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

3. **Test Features**:
   - Create a test account
   - Add a sample card
   - View the dashboard

## 🔥 Common Installation Issues

### Port Already in Use

If you see "Port 3000 is already in use":

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm start
```

### Node Version Issues

If you encounter compatibility issues:

```bash
# Check your Node version
node --version

# Use nvm to switch versions
nvm install 16
nvm use 16
```

### Permission Errors

On macOS/Linux, if you get permission errors:

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Or use npx
npx create-react-app
```

### Missing Dependencies

If modules are missing:

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 🏗️ Production Build

To create a production-ready build:

```bash
# Build the application
npm run build

# Test the production build
npm run serve
```

The build folder will contain optimized static files ready for deployment.

## 🚢 Deployment Options

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`

### Traditional Hosting

1. Run `npm run build`
2. Upload contents of `build/` folder to your web server
3. Configure server to serve `index.html` for all routes

## 📱 Mobile Development

To test on mobile devices:

1. Find your local IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Start the server:
   ```bash
   HOST=0.0.0.0 npm start
   ```

3. On your mobile device, navigate to:
   ```
   http://YOUR_LOCAL_IP:3000
   ```

## 🔄 Updating the Application

To update to the latest version:

```bash
# Fetch latest changes
git pull origin main

# Update dependencies
npm install

# Restart the server
npm run dev
```

## 🆘 Getting Help

If you encounter issues:

1. Check the [Troubleshooting Guide](troubleshooting.md)
2. Search [GitHub Issues](https://github.com/yourusername/sports-card-tracker/issues)
3. Ask in our [Community Forum](https://community.sportscardtracker.com)
4. Contact support at Sookie@Zylt.AI

---

Next: [Quick Start Guide](quick-start.md) →