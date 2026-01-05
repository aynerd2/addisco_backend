# API Documentation

Complete API reference for the Addisco Consulting Platform.

---

## 📍 Base URL

```
Development: http://localhost:5000/api
Production:  https://your-domain.com/api
```

---

## 🔐 Authentication

Most endpoints require authentication. Include JWT token in request header:

```http
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

Login to receive a token:

```http
POST /auth/login
```

---

## 📚 Endpoints

### 1. Authentication

#### Register User

```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "organization": "Tech Corp"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client",
    "organization": "Tech Corp"
  }
}
```

---

#### Login

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "admin@addisco.com",
  "password": "admin123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@addisco.com",
    "role": "admin",
    "organization": "Addisco & Company"
  }
}
```

---

#### Get Current User

```http
GET /auth/me
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@addisco.com",
    "role": "admin",
    "organization": "Addisco & Company",
    "lastLogin": "2024-01-04T10:30:00.000Z"
  }
}
```

---

#### Update Profile

```http
PUT /auth/profile
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Updated",
  "organization": "New Corp"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Updated",
    "email": "john@example.com",
    "organization": "New Corp"
  }
}
```

---

### 2. Consultations

#### Create Consultation (Public)

```http
POST /consultations
```

**No authentication required** - Public endpoint

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "phone": "+1234567890",
  "organization": "Smith Industries",
  "service": "strategic",
  "message": "We need help with market expansion strategy in West Africa."
}
```

**Service Options:**
- `strategic` - Strategic Advisory
- `digital` - Digital Transformation
- `market` - Market Development
- `organizational` - Organizational Excellence
- `other` - Other

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Consultation request submitted successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane@company.com",
    "phone": "+1234567890",
    "organization": "Smith Industries",
    "service": "strategic",
    "message": "We need help with market expansion strategy...",
    "status": "pending",
    "createdAt": "2024-01-04T10:30:00.000Z"
  }
}
```

---

#### List Consultations (Admin)

```http
GET /consultations
```

**Headers:** `Authorization: Bearer <token>` (admin/partner only)

**Query Parameters:**
- `status` - Filter by status (pending, contacted, in-progress, completed, cancelled)
- `service` - Filter by service type
- `search` - Search by name, email, or organization
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sort` - Sort field (default: -createdAt)

**Example:**
```http
GET /consultations?status=pending&limit=20&search=john
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "consultations": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Jane Smith",
        "email": "jane@company.com",
        "phone": "+1234567890",
        "organization": "Smith Industries",
        "service": "strategic",
        "message": "We need help with...",
        "status": "pending",
        "priority": "normal",
        "assignedTo": null,
        "notes": [],
        "createdAt": "2024-01-04T10:30:00.000Z",
        "updatedAt": "2024-01-04T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 47,
      "itemsPerPage": 10
    }
  }
}
```

---

#### Get Single Consultation (Admin)

```http
GET /consultations/:id
```

**Headers:** `Authorization: Bearer <token>` (admin/partner only)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane@company.com",
    "phone": "+1234567890",
    "organization": "Smith Industries",
    "service": "strategic",
    "message": "We need help with market expansion...",
    "status": "in-progress",
    "priority": "high",
    "assignedTo": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Aro O. Shuaib, Jr",
      "email": "aro@addisco.com"
    },
    "notes": [
      {
        "id": "507f1f77bcf86cd799439013",
        "text": "Initial call scheduled for Monday",
        "addedBy": {
          "id": "507f1f77bcf86cd799439011",
          "name": "Admin User"
        },
        "createdAt": "2024-01-04T11:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-04T10:30:00.000Z",
    "updatedAt": "2024-01-04T11:00:00.000Z"
  }
}
```

---

#### Update Consultation Status (Admin)

```http
PATCH /consultations/:id/status
```

**Headers:** `Authorization: Bearer <token>` (admin/partner only)

**Request Body:**
```json
{
  "status": "in-progress"
}
```

**Status Options:**
- `pending` - New request
- `contacted` - Client has been contacted
- `in-progress` - Actively working on consultation
- `completed` - Consultation finished
- `cancelled` - Consultation cancelled

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Consultation status updated",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "status": "in-progress",
    "updatedAt": "2024-01-04T12:00:00.000Z"
  }
}
```

---

#### Add Note to Consultation (Admin)

```http
POST /consultations/:id/notes
```

**Headers:** `Authorization: Bearer <token>` (admin/partner only)

**Request Body:**
```json
{
  "text": "Client confirmed interest in Phase 2 expansion"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "consultationId": "507f1f77bcf86cd799439012",
    "note": {
      "id": "507f1f77bcf86cd799439014",
      "text": "Client confirmed interest in Phase 2 expansion",
      "addedBy": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Admin User"
      },
      "createdAt": "2024-01-04T13:00:00.000Z"
    }
  }
}
```

---

### 3. Dashboard Stats

#### Get Dashboard Statistics (Admin)

```http
GET /stats/dashboard
```

**Headers:** `Authorization: Bearer <token>` (admin/partner only)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "overview": {
      "total": 47,
      "pending": 12,
      "inProgress": 8,
      "completed": 25,
      "cancelled": 2
    },
    "byService": [
      {
        "service": "strategic",
        "count": 15
      },
      {
        "service": "digital",
        "count": 18
      },
      {
        "service": "market",
        "count": 10
      },
      {
        "service": "organizational",
        "count": 4
      }
    ],
    "recentConsultations": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Jane Smith",
        "service": "strategic",
        "status": "pending",
        "createdAt": "2024-01-04T10:30:00.000Z"
      }
    ]
  }
}
```

---

### 4. Users

#### List Users (Admin)

```http
GET /users
```

**Headers:** `Authorization: Bearer <token>` (admin only)

**Query Parameters:**
- `role` - Filter by role (admin, partner, client)
- `page` - Page number
- `limit` - Items per page

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Admin User",
        "email": "admin@addisco.com",
        "role": "admin",
        "organization": "Addisco & Company",
        "isActive": true,
        "lastLogin": "2024-01-04T10:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15
    }
  }
}
```

---

#### Get Single User (Admin)

```http
GET /users/:id
```

**Headers:** `Authorization: Bearer <token>` (admin only)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@addisco.com",
    "role": "admin",
    "organization": "Addisco & Company",
    "phone": "+1234567890",
    "isActive": true,
    "lastLogin": "2024-01-04T10:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-04T10:00:00.000Z"
  }
}
```

---

## ❌ Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK - Request succeeded |
| `201` | Created - Resource created successfully |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Authentication required |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource not found |
| `409` | Conflict - Duplicate resource |
| `422` | Unprocessable Entity - Validation failed |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error - Server error |

### Common Error Examples

#### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "phone",
      "message": "Phone number is required"
    }
  ]
}
```

#### Authentication Error (401)
```json
{
  "success": false,
  "error": "Invalid token. Please login again."
}
```

#### Authorization Error (403)
```json
{
  "success": false,
  "error": "Access denied. Admin role required."
}
```

#### Not Found Error (404)
```json
{
  "success": false,
  "error": "Consultation not found"
}
```

#### Rate Limit Error (429)
```json
{
  "success": false,
  "error": "Too many requests. Please try again later.",
  "retryAfter": 900
}
```

---

## 🔒 Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Public endpoints:** 100 requests per 15 minutes per IP
- **Authenticated endpoints:** 1000 requests per 15 minutes per user

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641312000
```

---

## 📝 Request Examples

### Using cURL

```bash
# Create consultation
curl -X POST http://localhost:5000/api/consultations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "service": "strategic",
    "message": "Need help with strategy"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@addisco.com",
    "password": "admin123"
  }'

# Get dashboard stats (with token)
curl -X GET http://localhost:5000/api/stats/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Create consultation
const createConsultation = async () => {
  const response = await api.post('/consultations', {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    service: 'strategic',
    message: 'Need help with strategy'
  });
  return response.data;
};

// Login and get token
const login = async () => {
  const response = await api.post('/auth/login', {
    email: 'admin@addisco.com',
    password: 'admin123'
  });
  const token = response.data.token;
  // Store token for future requests
  localStorage.setItem('token', token);
  return token;
};

// Get dashboard stats with token
const getDashboardStats = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/stats/dashboard', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
```

---

## 🧪 Testing

### Health Check

```http
GET /health
```

**Response:** `200 OK`
```json
{
  "status": "OK",
  "timestamp": "2024-01-04T10:30:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

### Postman Collection

Import the Postman collection for easy testing:
[Download Postman Collection](postman_collection.json)

---

## 📞 Support

If you encounter any issues with the API:

- Check the [troubleshooting guide](TROUBLESHOOTING.md)
- Open an [issue on GitHub](https://github.com/yourusername/addisco-platform/issues)
- Email: support@addisco.com
