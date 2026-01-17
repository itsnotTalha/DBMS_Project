# Admin Panel - Working Principle & Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Related Files](#related-files)
4. [Authentication Flow](#authentication-flow)
5. [API Endpoints](#api-endpoints)
6. [Database Queries & Algorithms](#database-queries--algorithms)
7. [Frontend Components](#frontend-components)
8. [Data Flow Diagram](#data-flow-diagram)

---

## Overview

The Admin Panel is a centralized dashboard for system administrators to monitor and manage the entire supply chain platform. It provides:

- **System Overview**: Real-time statistics on users, manufacturers, and alerts
- **User Management**: View and monitor all registered users (Manufacturers, Retailers, Customers)
- **Network Map**: Visualize supply chain connections between manufacturers and retailers
- **System Alerts**: Monitor risk alerts and bugs from IoT devices
- **Complaints Management**: Review user-submitted complaints
- **System Logs**: Access and download server logs

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            ADMIN PANEL ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────┐     HTTP Requests      ┌────────────────────┐     │
│   │                 │ ──────────────────────▶│                    │     │
│   │   React Client  │     (Authorization)    │   Express Server   │     │
│   │   (Dashboard)   │ ◀──────────────────────│   (API Backend)    │     │
│   │                 │     JSON Response      │                    │     │
│   └─────────────────┘                        └────────────────────┘     │
│          │                                           │                   │
│          │ localStorage/                             │ MySQL Queries     │
│          │ sessionStorage                            │                   │
│          ▼                                           ▼                   │
│   ┌─────────────────┐                        ┌────────────────────┐     │
│   │   User Token    │                        │   MySQL Database   │     │
│   │   + User Data   │                        │  (supply_chain_db) │     │
│   └─────────────────┘                        └────────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Related Files

### Client-Side (Frontend)

| File Path | Purpose |
|-----------|---------|
| `client/src/pages/admin/Dashboard.jsx` | Main admin dashboard component with all views |
| `client/src/pages/admin/menu.js` | Menu configuration for admin navigation |
| `client/src/pages/admin/Settings.jsx` | Admin settings page wrapper |
| `client/src/pages/Layout.jsx` | Shared layout component with sidebar and navigation |

### Server-Side (Backend)

| File Path | Purpose |
|-----------|---------|
| `server/routes/adminRoutes.js` | Express routes for admin API endpoints |
| `server/controllers/adminController.js` | Business logic and database queries for admin features |
| `server/middleware/authMiddleware.js` | JWT token verification middleware |
| `server/config/db.js` | MySQL database connection pool configuration |
| `server/server.js` | Main Express server setup and route mounting |
| `server/seedAdmin.js` | Script to create initial admin user |

### Configuration

| File Path | Purpose |
|-----------|---------|
| `server/.env` | Environment variables (DB credentials, JWT secret, PORT) |

---

## Authentication Flow

### Algorithm: Admin Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────────┐
│                     ADMIN AUTHENTICATION FLOW                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. LOGIN REQUEST                                                │
│     ┌──────────────┐    POST /api/auth/login    ┌─────────────┐ │
│     │    Admin     │ ─────────────────────────▶ │   Server    │ │
│     │  (Frontend)  │ ◀───────────────────────── │  (Express)  │ │
│     └──────────────┘    { token, user }         └─────────────┘ │
│                                                                  │
│  2. STORE TOKEN (Client-Side)                                    │
│     localStorage.setItem('token', jwt_token)                     │
│     localStorage.setItem('user', JSON.stringify(user))           │
│                                                                  │
│  3. API REQUEST WITH TOKEN                                       │
│     Headers: { Authorization: 'Bearer <token>' }                 │
│                                                                  │
│  4. TOKEN VERIFICATION (Server-Side)                             │
│     jwt.verify(token, JWT_SECRET) → decoded user                 │
│                                                                  │
│  5. ROLE CHECK (Client-Side)                                     │
│     if (user.role !== 'Admin') redirect('/login')                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Code: Client-Side Role Verification

```javascript
// From Dashboard.jsx - Lines 69-81
useEffect(() => {
  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!storedUser) {
    navigate('/login');
    return;
  }
  const parsedUser = JSON.parse(storedUser);
  if (parsedUser.role !== 'Admin') {
    alert('Access Denied');
    navigate('/login');
    return;
  }
  setUser(parsedUser);
  fetchAllData();
}, [navigate]);
```

### Code: JWT Token Verification Middleware

```javascript
// From authMiddleware.js
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

---

## API Endpoints

### Base URL: `http://localhost:5000/api/admin`

| Method | Endpoint | Controller Function | Description |
|--------|----------|---------------------|-------------|
| GET | `/dashboard-stats` | `getDashboardStats` | Fetch overview statistics |
| GET | `/recent-activity` | `getRecentActivity` | Get latest system activities |
| GET | `/users` | `getAllUsers` | List all registered users |
| GET | `/users/:id` | `getUserDetails` | Get detailed user information |
| GET | `/connections` | `getNetworkConnections` | Get manufacturer-retailer links |
| GET | `/alerts` | `getSystemAlerts` | Fetch risk alerts from IoT |
| GET | `/complaints` | - | Fetch user complaints (if implemented) |

### Route Definitions

```javascript
// From adminRoutes.js
import express from 'express';
import { 
  getAllUsers, 
  getUserDetails,
  getNetworkConnections, 
  getSystemAlerts,
  getDashboardStats,
  getRecentActivity
} from '../controllers/adminController.js';

const router = express.Router();

// Dashboard Overview Data
router.get('/dashboard-stats', getDashboardStats);
router.get('/recent-activity', getRecentActivity);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);

// Network & Alerts
router.get('/connections', getNetworkConnections);
router.get('/alerts', getSystemAlerts);

export default router;
```

---

## Database Queries & Algorithms

### 1. Dashboard Statistics Query

**Purpose**: Aggregate counts for total users, manufacturers, and system alerts.

```sql
-- Get total user count
SELECT COUNT(*) as count FROM Users;

-- Get manufacturer count
SELECT COUNT(*) as count FROM Manufacturers;

-- Get system alerts count
SELECT COUNT(*) as count FROM Risk_Alerts;
```

**Controller Code**:
```javascript
export const getDashboardStats = async (req, res) => {
  try {
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM Users');
    const [manuCount] = await db.query('SELECT COUNT(*) as count FROM Manufacturers');
    const [alertCount] = await db.query('SELECT COUNT(*) as count FROM Risk_Alerts');

    res.json({
      total_users: userCount[0].count,
      active_manufacturers: manuCount[0].count,
      system_alerts: alertCount[0].count,
      total_transactions: 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Stats error' });
  }
};
```

---

### 2. Get All Users Query

**Purpose**: Fetch all users with role-specific details using LEFT JOINs.

**Algorithm**:
1. Select base user information from `Users` table
2. LEFT JOIN with `Manufacturers`, `Retailers`, and `Customers` tables
3. Use CASE statements to extract appropriate names based on role
4. Order by creation date (newest first)

```sql
SELECT 
  u.user_id, 
  u.email, 
  u.role, 
  u.created_at,
  CASE 
    WHEN u.is_active = 1 THEN 'Active' 
    ELSE 'Inactive' 
  END as status,
  CASE 
    WHEN u.role = 'Manufacturer' THEN m.company_name
    WHEN u.role = 'Retailer' THEN r.business_name
    WHEN u.role = 'Customer' THEN CONCAT(c.first_name, ' ', c.last_name)
    ELSE 'System Admin'
  END as name,
  CASE 
    WHEN u.role = 'Manufacturer' THEN m.license_number
    WHEN u.role = 'Retailer' THEN r.tax_id
    WHEN u.role = 'Customer' THEN c.phone_number
    ELSE NULL
  END as extra_info
FROM Users u
LEFT JOIN Manufacturers m ON u.user_id = m.manufacturer_id
LEFT JOIN Retailers r ON u.user_id = r.retailer_id
LEFT JOIN Customers c ON u.user_id = c.customer_id
ORDER BY u.created_at DESC
```

---

### 3. Get User Details Query

**Purpose**: Fetch detailed information for a specific user including role-specific data.

**Algorithm**:
1. Query base user data by user_id
2. Determine role and query corresponding table (Manufacturers/Retailers/Customers)
3. Merge base user data with role-specific details
4. Return combined object

```javascript
export const getUserDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const [users] = await db.query(
      `SELECT user_id, email, role, created_at, is_active FROM Users WHERE user_id = ?`, 
      [id]
    );

    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = users[0];
    let details = {};
    let displayName = 'N/A';
    const role = user.role.toLowerCase();

    if (role === 'manufacturer') {
      const [m] = await db.query('SELECT * FROM Manufacturers WHERE manufacturer_id = ?', [id]);
      if (m.length > 0) { details = m[0]; displayName = details.company_name; }
    } else if (role === 'retailer') {
      const [r] = await db.query('SELECT * FROM Retailers WHERE retailer_id = ?', [id]);
      if (r.length > 0) { details = r[0]; displayName = details.business_name; }
    } else if (role === 'customer') {
      const [c] = await db.query('SELECT * FROM Customers WHERE customer_id = ?', [id]);
      if (c.length > 0) { details = c[0]; displayName = `${details.first_name} ${details.last_name}`; }
    }

    res.json({ 
      ...user, 
      ...details, 
      username: displayName,
      status: user.is_active ? 'Active' : 'Inactive'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

### 4. Network Connections Query

**Purpose**: Map manufacturer-retailer supply chain relationships.

**Algorithm**:
1. Start from `Inventory` table as the connection point
2. JOIN through `Retailer_Outlets` → `Retailers` for retailer info
3. JOIN through `Product_Definitions` → `Manufacturers` for manufacturer info
4. GROUP BY retailer-manufacturer pairs
5. Aggregate product counts and total stock

```sql
SELECT 
  r.business_name as retailer,
  m.company_name as manufacturer,
  COUNT(i.inventory_id) as products_stocked,
  COALESCE(SUM(i.quantity_on_hand), 0) as total_stock
FROM Inventory i
JOIN Retailer_Outlets ro ON i.outlet_id = ro.outlet_id
JOIN Retailers r ON ro.retailer_id = r.retailer_id
JOIN Product_Definitions pd ON i.product_def_id = pd.product_def_id
JOIN Manufacturers m ON pd.manufacturer_id = m.manufacturer_id
GROUP BY r.retailer_id, m.manufacturer_id
```

---

### 5. System Alerts Query

**Purpose**: Fetch latest risk alerts from IoT devices.

```sql
SELECT * FROM Risk_Alerts ORDER BY created_at DESC LIMIT 50
```

---

### 6. Recent Activity Query

**Purpose**: Display latest system activities (user registrations).

```sql
SELECT 
  u.email as user_name,
  u.role as user_role,
  'User Joined' as action,
  'Info' as type,
  u.created_at
FROM Users u
ORDER BY u.created_at DESC
LIMIT 5
```

---

## Frontend Components

### Dashboard Views (Tab-Based Navigation)

The admin dashboard uses URL query parameters (`?tab=`) to switch between views:

| Tab Parameter | View Name | Component Section |
|---------------|-----------|-------------------|
| `dashboard` (default) | System Overview | Statistics cards + Activity table |
| `users` | User Monitor | Searchable user table with modal |
| `network` | Network Map | Manufacturer-retailer connection cards |
| `alerts` | System Alerts | Risk alert list from IoT |
| `complaints` | Complaints | User complaint table |
| `logs` | System Logs | Log download interface |

### Menu Configuration

```javascript
// From Dashboard.jsx - Lines 43-66
const adminMenuItems = [
  { 
    icon: <LayoutDashboard size={18} />, 
    label: 'Dashboard', 
    path: '/admin/dashboard' 
  },
  { 
    icon: <Users size={18} />, 
    label: 'User Monitor', 
    path: '/admin/dashboard?tab=users' 
  },
  { 
    icon: <Network size={18} />, 
    label: 'Network Map', 
    path: '/admin/dashboard?tab=network' 
  },
  { 
    icon: <AlertTriangle size={18} />, 
    label: 'System Alerts', 
    path: '/admin/dashboard?tab=alerts' 
  },
  { 
    icon: <MessageSquare size={18} />, 
    label: 'Complaints', 
    path: '/admin/dashboard?tab=complaints' 
  },
  { 
    icon: <Database size={18} />, 
    label: 'System Logs', 
    path: '/admin/dashboard?tab=logs' 
  },
];
```

### State Management

```javascript
// Data States
const [stats, setStats] = useState({
  total_users: 0,
  active_manufacturers: 0,
  system_alerts: 0,
  total_transactions: 0
});
const [recentActivity, setRecentActivity] = useState([]);
const [usersList, setUsersList] = useState([]);
const [connections, setConnections] = useState([]);
const [alertsList, setAlertsList] = useState([]);
const [complaintsList, setComplaintsList] = useState([]);

// UI States
const [searchTerm, setSearchTerm] = useState('');
const [selectedUser, setSelectedUser] = useState(null);
const [showModal, setShowModal] = useState(false);
const [loading, setLoading] = useState(true);
```

### Data Fetching Algorithm

**Parallel API Calls with Error Handling**:

```javascript
const fetchAllData = async () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };
  setLoading(true);

  try {
    // Fetch all data in parallel using Promise.allSettled
    const results = await Promise.allSettled([
      axios.get(`${API_BASE}/dashboard-stats`, authConfig),
      axios.get(`${API_BASE}/recent-activity`, authConfig),
      axios.get(`${API_BASE}/users`, authConfig),       
      axios.get(`${API_BASE}/connections`, authConfig),
      axios.get(`${API_BASE}/alerts`, authConfig),      
      axios.get(`${API_BASE}/complaints`, authConfig)
    ]);

    // Process results - each promise is handled independently
    if (results[0].status === 'fulfilled') setStats(results[0].value.data);
    if (results[1].status === 'fulfilled') setRecentActivity(results[1].value.data.activities || []);
    if (results[2].status === 'fulfilled') {
      const userData = results[2].value.data;
      setUsersList(Array.isArray(userData) ? userData : userData.users || []);
    }
    if (results[3].status === 'fulfilled') setConnections(results[3].value.data || []);
    if (results[4].status === 'fulfilled') setAlertsList(results[4].value.data.alerts || []);
    if (results[5].status === 'fulfilled') setComplaintsList(results[5].value.data || []);

  } catch (err) {
    console.error('Error fetching data:', err);
  } finally {
    setLoading(false);
  }
};
```

### User Search Filter

```javascript
const filteredUsers = usersList.filter(u => 
  u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
  u.role?.toLowerCase().includes(searchTerm.toLowerCase())
);
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ADMIN PANEL DATA FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐                                                           │
│  │ Admin Login  │                                                           │
│  └──────┬───────┘                                                           │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────────┐    Token + User    ┌───────────────────┐             │
│  │ Store Credentials │ ◀──────────────── │ /api/auth/login   │             │
│  │ (localStorage)   │                    └───────────────────┘             │
│  └──────┬───────────┘                                                       │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────────┐                                                       │
│  │ Check Role       │ ──── role !== 'Admin' ────▶ Redirect to /login       │
│  │ (Admin check)    │                                                       │
│  └──────┬───────────┘                                                       │
│         │ role === 'Admin'                                                  │
│         ▼                                                                   │
│  ┌──────────────────┐                                                       │
│  │ fetchAllData()   │                                                       │
│  │ (Promise.allSettled)                                                     │
│  └──────┬───────────┘                                                       │
│         │                                                                   │
│         ├──────────────────────────────────────────────────────────────┐   │
│         ▼                       ▼                      ▼               │   │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐       │   │
│  │ /dashboard-stats│   │ /recent-activity│   │ /users         │       │   │
│  └───────┬────────┘    └───────┬────────┘    └───────┬────────┘       │   │
│          │                     │                     │                │   │
│          ▼                     ▼                     ▼                │   │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐       │   │
│  │ Users COUNT    │    │ Users LIMIT 5  │    │ Users + JOINs  │       │   │
│  │ Manufacturers  │    │ ORDER BY DESC  │    │ Manufacturers  │       │   │
│  │ Risk_Alerts    │    │                │    │ Retailers      │       │   │
│  │ COUNT queries  │    │                │    │ Customers      │       │   │
│  └───────┬────────┘    └───────┬────────┘    └───────┬────────┘       │   │
│          │                     │                     │                │   │
│          └─────────────────────┴─────────────────────┴────────────────┘   │
│                                │                                          │
│                                ▼                                          │
│                      ┌──────────────────┐                                 │
│                      │ Update React     │                                 │
│                      │ State + Render   │                                 │
│                      │ Dashboard UI     │                                 │
│                      └──────────────────┘                                 │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Seeding Admin User

To create the initial admin user, run:

```bash
cd server
node seedAdmin.js
```

**Default Credentials**:
- Email: `admin@besspas.com`
- Password: `admin123`

**Seed Script Logic**:
1. Hash password using bcrypt (10 salt rounds)
2. Insert into `Users` table with role = 'Admin'
3. Insert into `Admins` table with permissions_level = 'SuperAdmin'

---

## Database Tables Used

| Table | Purpose in Admin Panel |
|-------|------------------------|
| `Users` | Base user authentication and role info |
| `Manufacturers` | Manufacturer company details |
| `Retailers` | Retailer business details |
| `Customers` | Customer personal details |
| `Risk_Alerts` | IoT device alerts and system notifications |
| `Inventory` | Product stock for network connections |
| `Retailer_Outlets` | Outlet locations for network mapping |
| `Product_Definitions` | Product catalog for network mapping |
| `Admins` | Admin-specific permissions and department |

---

## Environment Configuration

```env
# server/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=supply_chain_db3
PORT=5000
JWT_SECRET=supersecretkey123
```

---

## Summary

The Admin Panel follows a **React → Express → MySQL** architecture:

1. **Authentication**: JWT-based with role verification on both client and server
2. **Data Fetching**: Parallel API calls using `Promise.allSettled` for resilience
3. **Database**: Complex JOINs and CASE statements for role-based user data
4. **UI**: Tab-based navigation using URL query parameters
5. **State Management**: React useState hooks for data and UI state
