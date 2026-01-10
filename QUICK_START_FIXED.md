# Quick Start Guide - Fixed System

## Prerequisites
- Node.js 16+ installed
- MySQL 5.7+ running with database: `supply_chain_db`
- Database schema created (from `Dbms queries.txt`)

## Starting the System

### Terminal 1 - Backend Server
```bash
cd /home/potato/Git/DBMS_Project/server
npm install  # Only first time
npm start    # Or: node server.js
```

**Expected Output:**
```
✅ Environment variables loaded
  Host: localhost
  User: root
  DB: supply_chain_db
Server running on port 5000
MySQL Database Connected Successfully!
```

### Terminal 2 - Frontend Development Server
```bash
cd /home/potato/Git/DBMS_Project/client
npm install  # Only first time
npm run dev  # Or: npm start
```

**Expected Output:**
```
  ➜  Local:   http://localhost:5173/
```

## Login Credentials (Example - from your database)

```
Email: [your-manufacturer-email]
Password: [your-password]
Role: Manufacturer
```

## Accessing the Application

1. Open browser: `http://localhost:5173`
2. Login with manufacturer account
3. Dashboard should load with:
   - 📊 Stats cards (Products, Orders, Shipments, IoT Alerts)
   - 📦 Recent Shipments section
   - 📈 Top Products chart

## Testing Key Features

### ✅ Add Product
- Navigate to **Products** page
- Click **Add Product** button
- Fill form and submit
- API: `POST /api/manufacturer/products`

### ✅ Create Production Batch
- Navigate to **Production** page
- Click **New Batch** button
- Fill form (product, quantity, dates)
- Submit
- API: `POST /api/manufacturer/production`

### ✅ View Shipments
- Navigate to **Shipments** page
- View list of dispatched/in-transit shipments
- API: `GET /api/manufacturer/shipments`

### ✅ View Ledger
- Navigate to **Ledger** page
- View blockchain-style transaction history
- API: `GET /api/manufacturer/ledger`

### ✅ IoT Alerts
- Navigate to **IoT Alerts** page
- View cold-chain monitoring alerts
- API: `GET /api/manufacturer/iot-alerts`

## Troubleshooting

### Server won't start
```bash
# Check if .env exists and has correct DB credentials
cat /home/potato/Git/DBMS_Project/server/.env

# Should show:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=talha
# DB_NAME=supply_chain_db
# PORT=5000
# JWT_SECRET=supersecretkey123
```

### "Cannot find module" errors
```bash
# Reinstall dependencies
cd server
rm -rf node_modules package-lock.json
npm install

# Repeat for client
cd ../client
rm -rf node_modules package-lock.json
npm install
```

### API returning 500 errors
- Check server logs for database query errors
- Verify database schema exists
- Run SQL queries from `Dbms queries.txt`

### API returning 401 errors
- Clear browser storage: DevTools → Application → Clear all
- Login again
- Token is saved in localStorage/sessionStorage

### Frontend shows blank dashboards
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for API responses
4. Verify server is running on port 5000

## Database Setup (One-time)

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE supply_chain_db;
USE supply_chain_db;

# Run schema from Dbms queries.txt
source /path/to/Dbms\ queries.txt;
```

## All Fixed Issues

✅ Server runs and connects to database  
✅ Environment variables load correctly  
✅ All API endpoints implemented and functional  
✅ Authorization headers added to all requests  
✅ Correct endpoints used throughout frontend  
✅ Dashboard syncs with real database data  
✅ Products can be created  
✅ Production batches can be created  
✅ Shipments display properly  
✅ IoT Alerts load correctly  
✅ Ledger transactions visible  

---

**Version:** Fixed (Jan 10, 2026)  
**Status:** ✅ Production Ready
