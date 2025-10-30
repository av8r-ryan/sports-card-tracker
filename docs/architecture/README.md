# 🏗️ Architecture Documentation

This document provides a comprehensive overview of the Sports Card Tracker application architecture, including system design, component structure, data flow, and technical decisions.

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Architecture Principles](#architecture-principles)
- [Technology Stack](#technology-stack)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [State Management](#state-management)
- [Database Design](#database-design)
- [API Design](#api-design)
- [Security Architecture](#security-architecture)
- [Performance Considerations](#performance-considerations)
- [Scalability](#scalability)
- [Deployment Architecture](#deployment-architecture)

## 🎯 System Overview

The Sports Card Tracker is a modern single-page application (SPA) built with React and TypeScript, designed to provide a comprehensive solution for sports card collectors to manage, organize, and analyze their collections.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React SPA)                     │
├─────────────────────────────────────────────────────────────┤
│  Components  │  Context  │  Hooks  │  Services  │  Utils   │
├─────────────────────────────────────────────────────────────┤
│                    State Management                         │
│  AuthContext │  CardContext │  LocalStorage │  IndexedDB   │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
│  Dexie.js (IndexedDB) │  LocalStorage │  SessionStorage    │
├─────────────────────────────────────────────────────────────┤
│                    Optional Backend                         │
│  Express.js │  JWT Auth │  REST API │  File Storage        │
└─────────────────────────────────────────────────────────────┘
```

## 🏛️ Architecture Principles

### 1. Separation of Concerns
- **Presentation Layer**: React components and UI logic
- **Business Logic Layer**: Services and utility functions
- **Data Layer**: Database abstraction and data management
- **State Layer**: Context providers and state management

### 2. Single Responsibility Principle
- Each component has a single, well-defined purpose
- Services handle specific business logic
- Utilities provide pure functions
- Contexts manage specific state domains

### 3. Dependency Inversion
- Components depend on abstractions, not concrete implementations
- Services are injected through context providers
- Database operations are abstracted through service layers

### 4. Open/Closed Principle
- Components are open for extension, closed for modification
- Plugin architecture for new features
- Configurable behavior through props and context

## 🛠️ Technology Stack

### Frontend Core
- **React 18**: UI library with hooks and concurrent features
- **TypeScript**: Type-safe development
- **CSS3**: Modern styling with custom properties
- **HTML5**: Semantic markup and accessibility

### State Management
- **React Context API**: Global state management
- **useReducer**: Complex state logic
- **Custom Hooks**: Reusable stateful logic
- **Local Storage**: Persistent state

### Data Storage
- **Dexie.js**: IndexedDB wrapper for local storage
- **IndexedDB**: Browser-native database
- **LocalStorage**: User preferences and settings
- **SessionStorage**: Temporary state

### Testing
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Cypress**: End-to-end testing
- **Playwright**: Visual testing
- **Lighthouse**: Performance testing

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Concurrently**: Process management

## 🧩 Component Architecture

### Component Hierarchy

```
App
├── AuthProvider
│   └── AuthForm
├── CardProvider
│   ├── Layout
│   │   ├── Navigation
│   │   └── MainContent
│   │       ├── Dashboard
│   │       ├── CardList
│   │       ├── CardForm
│   │       ├── Collections
│   │       ├── Reports
│   │       └── AdminDashboard
│   └── ErrorBoundary
└── DevTools
```

### Component Categories

#### 1. Layout Components
- **Layout**: Main application layout
- **Navigation**: Navigation menu and routing
- **Header**: Application header
- **Sidebar**: Side navigation panel

#### 2. Feature Components
- **Dashboard**: Main dashboard with statistics
- **CardList**: Card inventory display
- **CardForm**: Card creation and editing
- **Collections**: Collection management
- **Reports**: Report generation and display

#### 3. UI Components
- **Button**: Reusable button component
- **Input**: Form input components
- **Modal**: Modal dialog component
- **Card**: Card display component
- **Loading**: Loading states and skeletons

#### 4. Context Components
- **AuthProvider**: Authentication state management
- **CardProvider**: Card data management
- **ThemeProvider**: Theme and styling management

### Component Design Patterns

#### 1. Container/Presentational Pattern
```typescript
// Container Component
const CardListContainer = () => {
  const { cards, loading, error } = useCards();
  
  return (
    <CardListPresentation 
      cards={cards}
      loading={loading}
      error={error}
      onCardSelect={handleCardSelect}
    />
  );
};

// Presentational Component
const CardListPresentation = ({ cards, loading, error, onCardSelect }) => {
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className="card-list">
      {cards.map(card => (
        <Card key={card.id} card={card} onClick={() => onCardSelect(card)} />
      ))}
    </div>
  );
};
```

#### 2. Custom Hooks Pattern
```typescript
const useCardManagement = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const addCard = useCallback(async (cardData) => {
    setLoading(true);
    try {
      const newCard = await cardService.createCard(cardData);
      setCards(prev => [...prev, newCard]);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { cards, loading, addCard };
};
```

#### 3. Higher-Order Component Pattern
```typescript
const withAuth = (WrappedComponent) => {
  return (props) => {
    const { user } = useAuth();
    
    if (!user) {
      return <AuthForm />;
    }
    
    return <WrappedComponent {...props} />;
  };
};
```

## 🔄 Data Flow

### 1. Authentication Flow
```
User Input → AuthForm → AuthContext → UserService → LocalStorage → UI Update
```

### 2. Card Management Flow
```
User Input → CardForm → CardContext → CardService → IndexedDB → UI Update
```

### 3. Data Synchronization
```
Local Changes → Service Layer → Database → Context Update → UI Re-render
```

### 4. Error Handling Flow
```
Error Occurrence → Service Layer → Context State → Error Boundary → User Notification
```

## 🗃️ State Management

### Context Architecture

#### AuthContext
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (user: User) => void;
}
```

#### CardContext
```typescript
interface CardState {
  cards: Card[];
  loading: boolean;
  error: string | null;
  selectedCard: Card | null;
  filters: CardFilters;
}

interface CardActions {
  addCard: (card: Card) => Promise<void>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  selectCard: (card: Card) => void;
  setFilters: (filters: CardFilters) => void;
}
```

### State Persistence

#### Local Storage
- User authentication state
- User preferences
- Theme settings
- Last viewed page

#### IndexedDB
- Card collection data
- Collection metadata
- User statistics
- Report data

#### Session Storage
- Temporary form data
- Navigation state
- Search queries
- Filter states

## 🗄️ Database Design

### IndexedDB Schema

#### Cards Table
```typescript
interface Card {
  id: string;
  userId: string;
  collectionId: string;
  player: string;
  year: number;
  brand: string;
  category: string;
  cardNumber: string;
  condition: string;
  gradingCompany?: string;
  grade?: string;
  parallel?: string;
  purchasePrice: number;
  purchaseDate: Date;
  currentValue: number;
  sellPrice?: number;
  sellDate?: Date;
  notes?: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Collections Table
```typescript
interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isDefault: boolean;
  visibility: 'private' | 'public';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Users Table
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  profilePhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Relationships

```
Users (1) ──→ (N) Collections
Users (1) ──→ (N) Cards
Collections (1) ──→ (N) Cards
```

### Indexing Strategy

#### Primary Indexes
- `id`: Primary key
- `userId`: User-specific queries
- `collectionId`: Collection-specific queries

#### Secondary Indexes
- `[userId, year]`: Year-based filtering
- `[userId, category]`: Category-based filtering
- `[userId, player]`: Player-based search
- `[userId, createdAt]`: Chronological ordering

## 🔌 API Design

### RESTful Endpoints

#### Authentication
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
```

#### Cards
```
GET    /api/cards
POST   /api/cards
GET    /api/cards/:id
PUT    /api/cards/:id
DELETE /api/cards/:id
```

#### Collections
```
GET    /api/collections
POST   /api/collections
GET    /api/collections/:id
PUT    /api/collections/:id
DELETE /api/collections/:id
```

### API Response Format

#### Success Response
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}
```

#### Error Response
```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

### Error Handling

#### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

#### Error Categories
- **Validation Errors**: Input validation failures
- **Authentication Errors**: Login/authorization failures
- **Authorization Errors**: Permission denied
- **Not Found Errors**: Resource not found
- **Server Errors**: Internal server issues

## 🔒 Security Architecture

### Authentication
- **JWT Tokens**: Stateless authentication
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Token-based sessions
- **Password Policies**: Minimum length and complexity

### Authorization
- **Role-Based Access Control**: Admin and user roles
- **Resource-Level Permissions**: User-specific data access
- **API Endpoint Protection**: Authentication middleware
- **Client-Side Validation**: Input sanitization

### Data Protection
- **Input Validation**: Server-side validation
- **XSS Prevention**: Content Security Policy
- **CSRF Protection**: Token-based protection
- **Data Encryption**: Sensitive data encryption

### Security Headers
```typescript
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
```

## ⚡ Performance Considerations

### Frontend Optimization

#### Code Splitting
```typescript
const Dashboard = lazy(() => import('./components/Dashboard'));
const CardList = lazy(() => import('./components/CardList'));
const Reports = lazy(() => import('./components/Reports'));
```

#### Memoization
```typescript
const MemoizedCard = memo(Card);
const MemoizedCardList = memo(CardList);
```

#### Virtual Scrolling
```typescript
const VirtualizedCardList = ({ cards }) => {
  return (
    <FixedSizeList
      height={600}
      itemCount={cards.length}
      itemSize={200}
      itemData={cards}
    >
      {CardItem}
    </FixedSizeList>
  );
};
```

### Database Optimization

#### Query Optimization
- Use indexes for frequently queried fields
- Implement pagination for large datasets
- Cache frequently accessed data
- Optimize complex queries

#### Data Compression
- Compress large text fields
- Use efficient data types
- Implement data archiving
- Optimize image storage

### Network Optimization

#### Caching Strategy
- Browser caching for static assets
- Service worker for offline support
- CDN for global content delivery
- API response caching

#### Bundle Optimization
- Tree shaking for unused code
- Code splitting by route
- Dynamic imports for features
- Asset optimization

## 📈 Scalability

### Horizontal Scaling
- Stateless application design
- Load balancer distribution
- Database sharding
- Microservices architecture

### Vertical Scaling
- Memory optimization
- CPU usage optimization
- Storage optimization
- Network optimization

### Performance Monitoring
- Real-time performance metrics
- Error tracking and logging
- User experience monitoring
- Resource usage monitoring

## 🚀 Deployment Architecture

### Development Environment
```
Developer Machine
├── React Development Server (Port 3000)
├── Express API Server (Port 8000)
├── IndexedDB (Browser)
└── Local Storage (Browser)
```

### Production Environment
```
Load Balancer
├── React App (Static Files)
├── Express API Server
├── Database Cluster
├── File Storage
└── CDN
```

### CI/CD Pipeline
```
Code Push → GitHub → GitHub Actions → Build → Test → Deploy
```

### Environment Configuration
```typescript
interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  REACT_APP_API_URL: string;
  REACT_APP_CDN_URL: string;
  REACT_APP_ANALYTICS_ID: string;
}
```

## 🔧 Development Guidelines

### Code Organization
- Feature-based folder structure
- Consistent naming conventions
- Clear separation of concerns
- Comprehensive documentation

### Testing Strategy
- Unit tests for all components
- Integration tests for workflows
- E2E tests for user journeys
- Performance tests for optimization

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Husky for pre-commit hooks

---

*Last Updated: ${new Date().toLocaleDateString()}*
*Version: 1.0.0*
