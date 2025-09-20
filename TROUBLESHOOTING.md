# Login Troubleshooting Guide

## Current Setup
- Admin Email: admin@couponassessment.com
- Admin Password: Admin@09 (updated in .env)
- Server Port: 5020
- Client Port: 5173 (Vite default)

## Step 1: Start the Server
Open a terminal and run:
```bash
cd /Users/saivardhanpolampalli/Downloads/coupon_Assessment2/server
npm run dev
```

Expected output should include:
- "MongoDB connected successfully"
- "Server is running on port 5020"

## Step 2: Test Server Directly
In another terminal, test the server:
```bash
cd /Users/saivardhanpolampalli/Downloads/coupon_Assessment2/server
node debug-env.js
```

This will show if environment variables are loaded correctly.

## Step 3: Test Admin Login via API
```bash
cd /Users/saivardhanpolampalli/Downloads/coupon_Assessment2/server
node test-auth.js
```

## Step 4: Start the Client
In another terminal:
```bash
cd /Users/saivardhanpolampalli/Downloads/coupon_Assessment2/client
npm run dev
```

## Step 5: Test in Browser
1. Go to http://localhost:5173
2. Navigate to login page
3. Try admin credentials:
   - Email: admin@couponassessment.com
   - Password: Admin@09

## Common Issues & Solutions

### Issue 1: Server not connecting to MongoDB
- Check if MongoDB Atlas cluster is running
- Verify MONGODB_URI in .env file

### Issue 2: Admin password not working
- Verify .env file has ADMIN_PASSWORD=Admin@09
- Make sure there are no extra spaces or characters

### Issue 3: CORS errors
- Ensure server is running on port 5020
- Check if client API_BASE_URL points to http://localhost:5020

### Issue 4: Client can't reach server
- Check if both server (5020) and client (5173) are running
- Verify no firewall blocking the ports

## Debug Commands

Test server is running:
```bash
curl http://localhost:5020/
```

Test admin login:
```bash
curl -X POST http://localhost:5020/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@couponassessment.com","password":"Admin@09"}'
```

Test environment variables:
```bash
cd server && node debug-env.js
```
