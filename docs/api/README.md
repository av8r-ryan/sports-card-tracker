# 🔌 API Reference

Complete API documentation for Sports Card Tracker backend services.

## 🌐 Base URL

```
Development: http://localhost:8000/api
Production: https://api.sportscardtracker.com
```

## 🔐 Authentication

All API requests require authentication using JWT tokens.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Using the Token
Include the token in all subsequent requests:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📦 Cards Endpoints

### List Cards
Get all cards for the authenticated user.

```http
GET /api/cards
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 50) |
| sort | string | Sort field (value, date, player) |
| order | string | Sort order (asc, desc) |
| category | string | Filter by category |
| search | string | Search in player names |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "player": "Mike Trout",
      "year": 2011,
      "brand": "Topps Update",
      "cardNumber": "US175",
      "category": "Baseball",
      "team": "Angels",
      "condition": "Near Mint",
      "purchasePrice": 500,
      "currentValue": 2500,
      "purchaseDate": "2020-01-15",
      "imageUrl": "https://storage.example.com/cards/abc123.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

### Get Single Card
```http
GET /api/cards/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "player": "Mike Trout",
    "year": 2011,
    "brand": "Topps Update",
    "cardNumber": "US175",
    "category": "Baseball",
    "team": "Angels",
    "condition": "Near Mint",
    "gradingCompany": "PSA",
    "grade": "9",
    "certNumber": "12345678",
    "purchasePrice": 500,
    "currentValue": 2500,
    "purchaseDate": "2020-01-15",
    "notes": "Purchased from PWCC auction",
    "imageUrl": "https://storage.example.com/cards/abc123.jpg",
    "createdAt": "2023-01-15T10:00:00Z",
    "updatedAt": "2023-12-01T15:30:00Z"
  }
}
```

### Create Card
```http
POST /api/cards
Content-Type: application/json

{
  "player": "Shohei Ohtani",
  "year": 2018,
  "brand": "Topps",
  "cardNumber": "700",
  "category": "Baseball",
  "team": "Angels",
  "condition": "Mint",
  "purchasePrice": 200,
  "currentValue": 800,
  "purchaseDate": "2023-06-15"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "def456",
    "player": "Shohei Ohtani",
    ...
  }
}
```

### Update Card
```http
PUT /api/cards/:id
Content-Type: application/json

{
  "currentValue": 1000,
  "notes": "Updated value after MVP announcement"
}
```

### Delete Card
```http
DELETE /api/cards/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Card deleted successfully"
}
```

### Bulk Operations

#### Bulk Import
```http
POST /api/cards/bulk
Content-Type: multipart/form-data

file: cards.csv
```

**CSV Format:**
```csv
player,year,brand,cardNumber,category,purchasePrice,currentValue
"Mike Trout",2011,"Topps Update","US175","Baseball",500,2500
```

#### Bulk Update
```http
PUT /api/cards/bulk
Content-Type: application/json

{
  "ids": ["abc123", "def456"],
  "updates": {
    "currentValue": 1000
  }
}
```

## 📊 Analytics Endpoints

### Portfolio Summary
```http
GET /api/analytics/portfolio
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCards": 150,
    "totalValue": 25000,
    "totalInvested": 15000,
    "netGainLoss": 10000,
    "roi": 66.67,
    "avgCardValue": 166.67,
    "categoriesBreakdown": {
      "Baseball": 80,
      "Basketball": 50,
      "Football": 20
    }
  }
}
```

### Performance Timeline
```http
GET /api/analytics/timeline?period=30d
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| period | string | 7d, 30d, 90d, 1y, all |

### Category Analysis
```http
GET /api/analytics/categories
```

### Top Performers
```http
GET /api/analytics/top-performers?limit=10
```

## 📋 Reports Endpoints

### Generate Report
```http
POST /api/reports/generate
Content-Type: application/json

{
  "type": "portfolio",
  "format": "pdf",
  "dateRange": {
    "start": "2023-01-01",
    "end": "2023-12-31"
  },
  "filters": {
    "categories": ["Baseball", "Basketball"]
  }
}
```

**Report Types:**
- `portfolio` - Portfolio performance
- `tax` - Tax report
- `insurance` - Insurance appraisal
- `analytics` - Collection analytics

**Response:**
```json
{
  "success": true,
  "data": {
    "reportId": "report_123",
    "downloadUrl": "https://api.example.com/reports/download/report_123",
    "expiresAt": "2024-01-02T00:00:00Z"
  }
}
```

### Download Report
```http
GET /api/reports/download/:reportId
```

Returns the file directly (PDF, Excel, or CSV).

## 🏷️ eBay Integration

### Get Listing Recommendations
```http
GET /api/ebay/recommendations
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "cardId": "abc123",
      "score": 92,
      "reasons": [
        "High market demand",
        "Recent price increase",
        "Limited supply"
      ],
      "suggestedPrice": {
        "min": 450,
        "max": 500,
        "optimal": 475
      },
      "bestListingTime": "2024-01-07T19:00:00Z"
    }
  ]
}
```

### Export for eBay
```http
POST /api/ebay/export
Content-Type: application/json

{
  "cardIds": ["abc123", "def456"],
  "format": "file-exchange",
  "options": {
    "duration": 7,
    "startingPrice": "0.99",
    "listingType": "auction"
  }
}
```

## 📸 Image Upload

### Upload Card Image
```http
POST /api/upload/card-image
Content-Type: multipart/form-data

cardId: abc123
image: [binary data]
type: front
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://storage.example.com/cards/abc123-front.jpg",
    "thumbnailUrl": "https://storage.example.com/cards/abc123-front-thumb.jpg"
  }
}
```

## 🔍 Search Endpoints

### Global Search
```http
GET /api/search?q=trout&type=all
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Search query |
| type | string | all, players, brands, teams |
| limit | number | Results limit |

### Autocomplete
```http
GET /api/autocomplete?q=mik&field=player
```

## ⚙️ User Settings

### Get Settings
```http
GET /api/user/settings
```

### Update Settings
```http
PUT /api/user/settings
Content-Type: application/json

{
  "currency": "USD",
  "timezone": "America/New_York",
  "notifications": {
    "email": true,
    "priceAlerts": true
  }
}
```

## 📊 Webhooks

### Register Webhook
```http
POST /api/webhooks
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["card.created", "card.updated", "report.ready"]
}
```

### Webhook Events
- `card.created` - New card added
- `card.updated` - Card information updated
- `card.deleted` - Card removed
- `report.ready` - Report generation complete
- `price.alert` - Price threshold reached

## 🚨 Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is missing required fields",
    "details": {
      "missing": ["player", "year"]
    }
  }
}
```

### Error Codes
| Code | Description |
|------|-------------|
| UNAUTHORIZED | Missing or invalid token |
| FORBIDDEN | No permission for resource |
| NOT_FOUND | Resource doesn't exist |
| VALIDATION_ERROR | Invalid input data |
| RATE_LIMITED | Too many requests |
| SERVER_ERROR | Internal server error |

## 🔒 Rate Limiting

API requests are limited to:
- **Authenticated**: 1000 requests per hour
- **Unauthenticated**: 100 requests per hour

Rate limit headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 🧪 Testing

### Test Endpoint
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "2.1.0"
}
```

### Sandbox Environment
Use the sandbox for testing:
```
https://sandbox-api.sportscardtracker.com
```

Test credentials:
- Email: `test@example.com`
- Password: `testpass123`

---

Need help? Contact api-support@sportscardtracker.com