# Sports Card Tracker

A modern, full-stack web application for tracking and managing sports card collections with multi-user support, shared collections, and comprehensive admin features.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.x-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)

## ✨ Features

### 🃏 **Card Management**
- Add, edit, and delete sports cards with detailed information
- Multiple image upload support with compression
- Advanced filtering and search capabilities
- Card valuation tracking and profit/loss calculations

### 👥 **Multi-User System**
- User registration and authentication with JWT tokens
- Shared collections - multiple users can access the same card collection
- Role-based access control (Admin/User)
- Secure profile management with photo uploads

### 🔧 **Admin Dashboard**
- Global admin can view all users, collections, and cards
- System statistics and user management
- Collection membership management
- Real-time monitoring of app usage

### 🎨 **Modern UI/UX**
- Responsive design that works on all devices
- Dark/light theme support with accessibility features
- Intuitive navigation with breadcrumbs
- Real-time updates and loading states

### 📱 **User Profiles**
- Update email addresses and passwords
- Upload and manage profile photos
- Account settings and preferences
- Quick navigation to app sections

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + CSS3
- **Backend**: Node.js + Express.js
- **Database**: In-memory storage (easily replaceable with persistent DB)
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Handling**: Base64 image storage for profile photos and card images

## 📋 Prerequisites

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Git** (for cloning the repository)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sports-card-tracker
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Start Development Servers
```bash
# Terminal 1: Start backend server
cd server
node memory-server.js

# Terminal 2: Start frontend development server (in new terminal)
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

## 🛠️ Development Setup

### Backend Development
```bash
cd server
node memory-server.js    # Starts server on port 8000
```

### Frontend Development
```bash
npm start      # Starts React development server with hot reload
npm test       # Run test suite
npm run build  # Build for production
```

### Environment Configuration
Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

For backend configuration, edit `server/memory-server.js`:
```javascript
const PORT = 8000;
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
```

## 🏭 Production Deployment

### Option 1: Manual Deployment

#### 1. Build the Application
```bash
# Build frontend
npm run build

# The build folder contains production-ready files
```

#### 2. Deploy Backend
```bash
cd server

# Install production dependencies
npm install --production

# Start production server
node memory-server.js

# Or with PM2 for process management
npm install -g pm2
pm2 start memory-server.js --name "card-tracker-api"
```

#### 3. Serve Frontend
```bash
# Option A: Use a static file server
npm install -g serve
serve -s build -l 3000

# Option B: Use nginx (recommended)
# Copy build/* to your nginx web root
# Configure nginx to proxy API calls to backend
```

### Option 2: Docker Deployment

#### Create Dockerfile for Backend
```dockerfile
# server/Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8000
CMD ["node", "memory-server.js"]
```

#### Create Dockerfile for Frontend
```dockerfile
# Dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./server
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
```

Run with:
```bash
docker-compose up -d
```

### Option 3: Cloud Deployment

#### Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Deploy backend
cd server
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a your-app-name
git push heroku main

# Deploy frontend to Netlify/Vercel
# Build and upload the build/ folder
```

## 🔐 Default Admin Account

The application creates a default admin account on first startup:

- **Email**: `admin@cardtracker.com`
- **Password**: `admin123`
- **Role**: Admin

**⚠️ Important**: Change the default admin password immediately in production!

## 📁 Project Structure

```
sports-card-tracker/
├── public/                 # Static files
│   ├── generic.png        # Default card image
│   └── favicon.ico        # App icon
├── src/                   # React frontend source
│   ├── components/        # React components
│   │   ├── Auth/         # Authentication components
│   │   ├── Dashboard/    # Dashboard components
│   │   ├── CardList/     # Card listing components
│   │   ├── CardForm/     # Card creation/editing
│   │   ├── UserProfile/  # User profile management
│   │   ├── AdminDashboard/ # Admin interface
│   │   └── Layout/       # App layout and navigation
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── server/               # Backend source
│   ├── memory-server.js  # Main server file
│   └── package.json      # Backend dependencies
├── build/                # Production build (generated)
└── README.md            # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Cards
- `GET /api/cards` - Get user's cards
- `POST /api/cards` - Create new card
- `GET /api/cards/:id` - Get specific card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

### Collections
- `GET /api/collections` - Get user's collections
- `POST /api/collections` - Create collection (admin only)
- `POST /api/collections/:id/members` - Add user to collection (admin only)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/collections` - Get all collections (admin only)
- `GET /api/admin/stats` - Get system statistics (admin only)

## 🎯 Usage Guide

### For Regular Users
1. **Register**: Create an account at the login screen
2. **Add Cards**: Use the "Add Card" section to input your collection
3. **Manage Collection**: View and edit cards in the "Inventory" section
4. **Track Value**: Monitor your collection's value in the "Dashboard"
5. **Update Profile**: Manage your account in the "Profile" section

### For Administrators
1. **Access Admin Panel**: Use the "Admin" navigation item
2. **View Statistics**: Monitor system usage and statistics
3. **Manage Users**: View all registered users
4. **Manage Collections**: Create and manage shared collections
5. **System Oversight**: Monitor all cards and collections across users

## 🔧 Configuration

### Backend Configuration
Edit `server/memory-server.js`:
```javascript
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
```

### Frontend Configuration
Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

For production, update the API URL to your production backend.

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**
```bash
# Check if port is in use
lsof -i :8000

# Kill process if needed
kill -9 <PID>
```

**Frontend build fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**CORS errors**
- Ensure backend CORS is configured for your frontend URL
- Check that API_URL in .env matches your backend

**Authentication issues**
- Clear browser localStorage
- Check JWT token expiration (default: 7 days)

### Debug Mode
Enable debug logging by setting:
```javascript
// In memory-server.js
const DEBUG = true;
```

## 📋 Available Scripts

### Frontend Scripts
- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App (⚠️ one-way operation)

### Backend Scripts
- `node memory-server.js` - Start production server
- `npm install` - Install dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the Apache License 2.0. See the LICENSE file for details.

## 🔮 Future Enhancements

- [ ] Persistent database integration (PostgreSQL/MongoDB)
- [ ] Card price tracking APIs
- [ ] Advanced analytics and reporting
- [ ] Card trading marketplace
- [ ] Mobile app development
- [ ] Barcode scanning for card entry
- [ ] Export to PDF/Excel formats
- [ ] Real-time collaboration features

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review the API documentation

---

**Built with ❤️ for collectors by collectors**