# Coupon Assessment Server

Node.js backend server for the Coupon Assessment MERN stack application.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env  # Create your .env file
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/coupon_assessment
   JWT_SECRET=your_secure_jwt_secret
   ADMIN_EMAIL=admin@couponassessment.com
   ADMIN_PASSWORD=admin123456
   ```

3. Start the server:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "currentStudies": "12",
  "city": "Mumbai",
  "state": "Maharashtra"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "_id": "68cd603a63665813f5fd1f70",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "currentStudies": "12",
      "city": "Mumbai",
      "state": "Maharashtra",
      "role": "user",
      "isActive": true,
      "emailVerified": false,
      "createdAt": "2025-09-19T13:52:58.032Z",
      "updatedAt": "2025-09-19T13:52:58.032Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST `/api/auth/login`
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "admin@couponassessment.com",
  "password": "admin123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "user": {
      "id": "admin-1",
      "name": "Administrator",
      "email": "admin@couponassessment.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### User Routes (`/api/users`)

#### GET `/api/users/profile` 🔒
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "admin-1",
      "name": "Administrator",
      "email": "admin@couponassessment.com",
      "role": "admin"
    }
  }
}
```

#### GET `/api/users/admin/users` 🔒👑
Get all users (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

#### GET `/api/users/verify` 🔒
Verify if the provided token is valid.

**Headers:**
```
Authorization: Bearer <token>
```

### Public Routes

#### GET `/`
Health check endpoint.

**Response:**
```json
{
  "message": "Welcome to Coupon Assessment API"
}
```

## 🔐 Authentication

This API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Roles
- **admin**: Full access to all endpoints
- **user**: Limited access to user-specific endpoints

### Admin Access
The admin user is configured through environment variables:
- Email: `ADMIN_EMAIL`
- Password: `ADMIN_PASSWORD`

When logging in with admin credentials, the user receives an admin role.

## 🛡️ Middleware

### Authentication Middleware
- `authenticateToken`: Verifies JWT token
- `requireAuth`: Ensures user is authenticated
- `requireAdmin`: Ensures user has admin role

## 🧪 Testing

Run the authentication test suite:
```bash
node test-auth.js
```

This will test:
- Server connectivity
- Admin login
- Protected route access
- Admin-only route access
- User signup

## 📁 Project Structure

```
server/
├── controllers/
│   └── auth.controller.js     # Authentication logic
├── middleware/
│   └── auth.middleware.js     # JWT and role-based middleware
├── models/
│   ├── user.model.js          # User schema and methods
│   ├── coupon.model.js        # Coupon schema and methods
│   └── index.js               # Model exports
├── routes/
│   ├── auth.routes.js         # Authentication routes
│   └── user.routes.js         # User management routes
├── .env                       # Environment variables
├── index.js                   # Main server file
├── package.json              # Dependencies and scripts
├── test-auth.js              # Authentication test suite
├── test-models.js            # Model test suite
└── README.md                 # This file
```

## 📊 Database Models

### User Model (`models/user.model.js`)

**Fields:**
- `name` (String, required): User's full name
- `email` (String, required, unique): User's email address
- `password` (String, required, min 6 chars): Hashed password
- `phone` (String, required): Phone number
- `currentStudies` (String, required): Current study level (9, 10, 11, 12)
- `city` (String, required): User's city
- `state` (String, required): User's state
- `role` (String): User role (user/admin, default: user)
- `isActive` (Boolean): Account status (default: true)
- `emailVerified` (Boolean): Email verification status (default: false)
- `lastLogin` (Date): Last login timestamp
- `createdAt` & `updatedAt` (Date): Timestamps

**Methods:**
- `comparePassword(password)`: Compare plain password with hashed
- `getJWTToken()`: Get JWT payload object
- `toJSON()`: Remove sensitive fields from output

**Static Methods:**
- `findByEmail(email)`: Find user by email
- `findActiveUsers()`: Find all active users

### Coupon Model (`models/coupon.model.js`)

**Fields:**
- `couponName` (String, required, unique): Coupon identifier
- `type` (String, required): Coupon type (specific/general)
- `assignedUsers` (Array[ObjectId]): Users assigned to specific coupons
- `usedBy` (Array[Objects]): Usage history with user ref and timestamp
- `maxUses` (Number, required): Maximum usage limit
- `usageCount` (Number): Current usage count (default: 0)
- `expiryDate` (Date, required): Expiration date
- `isActive` (Boolean): Coupon status (default: true)
- `description` (String): Coupon description
- `discountValue` (Number): Discount amount
- `discountType` (String): Discount type (percentage/fixed)
- `createdBy` (ObjectId): Creator reference
- `createdAt` & `updatedAt` (Date): Timestamps

**Virtual Fields:**
- `isExpired`: Check if coupon has expired
- `isAvailable`: Check if coupon can be used
- `remainingUses`: Calculate remaining uses

**Methods:**
- `canUserUseCoupon(userId)`: Check if user can use this coupon
- `useCoupon(userId)`: Use coupon by a user

**Static Methods:**
- `findAvailableForUser(userId, type)`: Find available coupons for user
- `findExpired()`: Find expired or fully used coupons

## 🚀 Deployment

### Environment Variables for Production
Make sure to set secure values for:
- `JWT_SECRET`: Use a long, random string
- `ADMIN_PASSWORD`: Use a strong password
- `MONGODB_URI`: Your production database URL

### Security Considerations
- Use HTTPS in production
- Set secure CORS policies
- Use environment variables for sensitive data
- Implement rate limiting
- Add request validation
- Use secure session management

## 📝 Development Notes

- The current implementation stores minimal user data in memory for demonstration
- In production, implement proper database models and user management
- Add password reset functionality
- Implement email verification
- Add comprehensive input validation
- Set up proper logging and monitoring
