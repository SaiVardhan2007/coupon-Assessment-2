# Coupon Assessment - MERN Stack Application

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for coupon assessment.

## Project Structure

```
coupon_Assessment2/
├── client/          # React frontend
├── server/          # Node.js backend
├── package.json     # Root package.json for managing both client and server
└── README.md        # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd coupon_Assessment2
   ```

2. Install dependencies for both client and server:
   ```bash
   npm run install-all
   ```

   Or install individually:
   ```bash
   # Install server dependencies
   npm run install-server
   
   # Install client dependencies (after creating React app)
   npm run install-client
   ```

### Environment Setup

1. Navigate to the server directory and update the `.env` file with your configuration:
   ```bash
   cd server
   cp .env.example .env  # If you have an example file
   ```

2. Update the environment variables in `server/.env`:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure secret for JWT tokens
   - `PORT`: Server port (default: 5000)

### Running the Application

#### Development Mode

To run both client and server concurrently:
```bash
npm run dev
```

To run individually:
```bash
# Run server only
npm run server

# Run client only (after React app is created)
npm run client
```

#### Production Mode

```bash
# Build the client
npm run build

# Start the server
npm start
```

## Server Structure

The server is organized with the following structure:

- `index.js` - Main server entry point
- `models/` - MongoDB schemas and models
- `routes/` - API route definitions
- `controllers/` - Route handlers and business logic
- `middleware/` - Custom middleware functions
- `.env` - Environment variables

## Next Steps

1. **✅ React App Created**: Vite-based React application with Tailwind CSS
2. **✅ Authentication System**: Complete login/signup with JWT and MongoDB
3. **✅ Routing Setup**: React Router with protected routes and auth context
4. **Start Development**: Both frontend and backend are ready for feature development

## Current Project Status

### ✅ Completed
- **Frontend**: React + Vite + Tailwind CSS + React Router + Axios
- **Backend**: Node.js + Express + MongoDB + JWT Authentication
- **Authentication**: Complete signup/login system with role-based access
- **Database Models**: User and Coupon schemas with validation
- **Pages**: Home, Login, and Signup pages with responsive design

### 🚀 Ready to Use
- **Frontend URL**: http://localhost:5175/
- **Backend URL**: http://localhost:5020/
- **Admin Credentials**: admin@couponassessment.com / admin123456

## Features Implemented

### 🎯 Core Features
- **User Authentication**: JWT-based signup/login with role-based access (admin/user)
- **Coupon Management**: Full CRUD operations for coupons with validation
- **User Dashboard**: Personal coupon management and usage tracking
- **Admin Panel**: Complete admin interface for managing all coupons
- **Responsive Design**: Mobile-first design that works on all devices

### 🧩 Components Created
- **CouponCard**: Beautiful coupon display with actions
- **CouponForm**: Advanced form for creating/editing coupons
- **SearchFilter**: Powerful search and filtering system
- **Pagination**: Efficient data navigation
- **ConfirmModal**: User-friendly confirmation dialogs
- **ProtectedRoute**: Route protection based on authentication
- **AdminRoute**: Admin-only route protection
- **Navbar**: Dynamic navigation based on user role

### 📄 Pages Available
- **HomePage**: Landing page with role-specific content
- **CouponsPage**: Browse and redeem available coupons
- **AdminPage**: Complete admin dashboard for coupon management
- **ProfilePage**: User profile and usage history
- **DemoPage**: Interactive demo with sample data
- **LoginPage**: Secure user authentication
- **SignupPage**: User registration

### 🛠️ Technical Features
- **Database Models**: Advanced Mongoose schemas with validation
- **API Routes**: RESTful API with proper error handling
- **Middleware**: Authentication and authorization middleware
- **State Management**: React Context for global state
- **Form Validation**: Client and server-side validation
- **Error Handling**: Comprehensive error management
- **Security**: Password hashing, JWT tokens, role-based access

## Available Scripts

- `npm run dev` - Run both client and server in development mode
- `npm run server` - Run server only
- `npm run client` - Run client only
- `npm run install-all` - Install dependencies for both client and server
- `npm run build` - Build client for production

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

### Frontend
- React with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API communication
- JWT-based authentication
- Responsive design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
