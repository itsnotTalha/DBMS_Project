# DBMS Project - Detailed Structure & Patterns

## Project Root Structure

```
DBMS_Project/
├── client/                           # React Frontend
│   ├── src/
│   │   ├── pages/                   # Page components by role
│   │   ├── components/              # Reusable components
│   │   ├── services/                # API calls, utilities
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── context/                 # Context providers
│   │   ├── styles/                  # Global styles
│   │   ├── App.jsx                  # Root component
│   │   └── main.jsx                 # Entry point
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.local                   # Environment variables
│
├── server/                           # Node.js/Express Backend
│   ├── src/
│   │   ├── controllers/             # Business logic
│   │   ├── routes/                  # API routes
│   │   ├── middleware/              # Custom middleware
│   │   ├── services/                # Database services
│   │   ├── utils/                   # Utilities
│   │   ├── config/                  # Configuration
│   │   └── server.js                # Express app
│   ├── scripts/
│   │   ├── initDatabase.js          # Database initialization
│   │   └── seed.js                  # Seed data
│   ├── .env                         # Environment variables
│   ├── package.json
│   └── package-lock.json
│
├── docs/                            # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── SETUP.md
│   └── CONTRIBUTING.md
│
└── DATABASE_SCHEMA.md               # Database documentation
```

---

## Client Structure - Detailed

### Pages Organization by Role

#### Manufacturer Pages
```
client/src/pages/manufacturer/
├── Dashboard.jsx              # Manufacturer home, stats overview
├── Inventory.jsx             # (was Products.jsx) - List & manage products
├── AddProduct.jsx            # Add/edit products with certificates
├── Orders.jsx                # Incoming orders from retailers
├── Production.jsx            # Production tracking & batches
├── Shipments.jsx             # Outgoing shipments
├── IoTAlerts.jsx             # Temperature/humidity monitoring
├── LedgerAudit.jsx           # Blockchain ledger view
├── menu.js                   # Navigation menu
└── components/
    ├── DashboardCard.jsx
    ├── StatsGrid.jsx
    ├── OrdersTable.jsx
    ├── ProductsTable.jsx
    └── ShipmentsTable.jsx
```

#### Retailer Pages
```
client/src/pages/retailer/
├── Dashboard.jsx             # Retailer home, sales/inventory overview
├── Inventory.jsx             # Stock management
├── Orders.jsx                # Orders to manufacturers (B2B)
├── Shipments.jsx             # Incoming shipments from manufacturers
├── Verify.jsx                # Verify products before stocking
├── Alerts.jsx                # Cold chain alerts
├── Recalls.jsx               # Product recall notifications
├── Compliance.jsx            # Compliance reports
├── Customers.jsx             # Customer management
├── Analytics.jsx             # Sales analytics
├── Support.jsx               # Support/help
├── menu.js                   # Navigation menu
└── components/
    ├── DashboardCard.jsx
    ├── SalesChart.jsx
    └── InventoryTable.jsx
```

#### Customer Pages
```
client/src/pages/customer/
├── Dashboard.jsx             # My orders, recent purchases
├── Products.jsx              # Browse products
├── Orders.jsx                # Order history & tracking
├── Verify.jsx                # Verify product authenticity
├── Verifications.jsx         # Verification history
├── History.jsx               # Product history
├── Alerts.jsx                # Safety/recall alerts
├── Report.jsx                # Report counterfeit
├── Profile.jsx               # Account settings
├── Help.jsx                  # Help & FAQs
├── ChangePassword.jsx        # Password management
├── menu.js                   # Navigation menu
└── components/
    ├── ProductCard.jsx
    └── OrderTimeline.jsx
```

#### Admin Pages
```
client/src/pages/admin/
├── Dashboard.jsx             # System overview, stats
├── UserManagement.jsx        # Create/edit/delete users
├── Analytics.jsx             # System analytics & reports
├── LedgerAudit.jsx           # Full audit log
├── Recalls.jsx               # Manage recalls
├── menu.js                   # Navigation menu
└── components/
    ├── UserTable.jsx
    └── AnalyticsChart.jsx
```

#### Shared Pages
```
client/src/pages/
├── Login.jsx                 # Authentication
├── Register.jsx              # Account creation
└── Layout.jsx                # Shared layout wrapper (role-aware)
```

### Components Structure

```
client/src/components/
├── common/                   # Reusable across all roles
│   ├── LoadingSpinner.jsx
│   ├── ErrorMessage.jsx
│   ├── EmptyState.jsx
│   ├── Card.jsx
│   ├── Table.jsx
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Select.jsx
│   ├── Modal.jsx
│   ├── Form.jsx
│   └── Sidebar.jsx
├── layout/
│   └── Header.jsx
├── manufacturer/            # Manufacturer-specific
│   ├── ProductForm.jsx
│   ├── OrderStatus.jsx
│   └── ProductionStatus.jsx
├── retailer/                # Retailer-specific
│   ├── InventoryTable.jsx
│   └── ShipmentForm.jsx
└── customer/                # Customer-specific
    ├── ProductCard.jsx
    └── OrderTimeline.jsx
```

### Services Structure

```
client/src/services/
├── apiService.js            # All API calls
├── authService.js           # Auth-specific API calls
├── errorHandler.js          # Error handling & logging
├── logger.js                # Logging utility
├── storage.js               # LocalStorage wrapper
└── cache.js                 # Response caching (optional)
```

### Hooks Structure

```
client/src/hooks/
├── useAuth.js               # Authentication context hook
├── useRole.js               # Check user role
├── useApi.js                # API call wrapper with loading/error
├── useForm.js               # Form state management
├── useLocalStorage.js       # LocalStorage management
└── useErrorHandler.js       # Error handling hook
```

### Context Structure

```
client/src/context/
├── AuthContext.js           # User authentication & session
├── NotificationContext.js   # Toast/notification state
└── AppContext.js            # Global app state (optional)
```

---

## Server Structure - Detailed

### Routes Organization

```
server/src/routes/
├── authRoutes.js            # POST /api/auth/login, /register, /logout, /change-password
├── manufacturerRoutes.js    # /api/manufacturer/*
├── retailerRoutes.js        # /api/retailer/*
├── customerRoutes.js        # /api/customer/*
├── productRoutes.js         # /api/products/*
├── iotRoutes.js             # /api/iot/*
├── dashboardRoutes.js       # /api/dashboard/*
└── auditRoutes.js           # /api/audit/*
```

### Controllers Organization

```
server/src/controllers/
├── authController.js        # Login, register, password change
├── manufacturerController.js
│   ├── getOrders()
│   ├── confirmOrder()
│   ├── getProducts()
│   ├── addProduct()
│   ├── startProduction()
│   └── confirmShipment()
├── retailerController.js
│   ├── getOrders()
│   ├── createOrder()
│   ├── getInventory()
│   ├── getShipments()
│   └── verifyProduct()
├── customerController.js
│   ├── getOrders()
│   ├── createOrder()
│   ├── getProducts()
│   ├── verifyProduct()
│   └── getOrderTracking()
├── productController.js
│   ├── getAllProducts()
│   ├── getProductById()
│   ├── createProduct()
│   ├── updateProduct()
│   └── deleteProduct()
├── iotController.js
│   ├── getAlerts()
│   ├── recordReading()
│   └── getBatchReadings()
├── dashboardController.js
│   ├── getStats()
│   ├── getShipments()
│   ├── getLedger()
│   └── getColdChain()
└── auditController.js
    ├── getLogs()
    └── getTransactions()
```

### Middleware Organization

```
server/src/middleware/
├── auth.js                  # JWT verification
├── errorHandler.js          # Global error handling
├── validation.js            # Request validation
├── logger.js                # Request/response logging
├── cors.js                  # CORS configuration
└── roleCheck.js             # Role-based access control
```

### Services Organization (Database Layer)

```
server/src/services/
├── authService.js           # Auth-related queries
├── manufacturerService.js   # Manufacturer queries
├── retailerService.js       # Retailer queries
├── customerService.js       # Customer queries
├── productService.js        # Product queries
├── orderService.js          # Order queries (B2B & B2C)
├── shipmentService.js       # Shipment queries
├── iotService.js            # IoT data queries
├── auditService.js          # Audit log queries
└── batchService.js          # Batch/production queries
```

### Configuration

```
server/src/config/
├── db.js                    # MySQL connection
├── constants.js             # App constants
└── environment.js           # ENV validation
```

---

## Code Patterns & Standards

### API Response Format

All API responses follow this structure:

```javascript
// Success
{
  success: true,
  data: { /* actual data */ },
  message: "Operation successful"
}

// Error
{
  success: false,
  data: null,
  message: "Error description",
  error: {
    code: "ERROR_CODE",
    details: { /* additional info */ }
  }
}

// Paginated
{
  success: true,
  data: [ /* items */ ],
  pagination: {
    total: 100,
    page: 1,
    pageSize: 10,
    totalPages: 10
  }
}
```

### Component Pattern

```javascript
// pages/manufacturer/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { apiService } from '@/services/apiService';
import Layout from '../Layout';
import { manufacturerMenuItems } from './menu';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, loading, error } = useApi(() => 
    apiService.getDashboardStats()
  );

  if (!user?.role === 'Manufacturer') {
    navigate('/login');
    return null;
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <Layout user={user} menuItems={manufacturerMenuItems}>
      {/* Page content */}
    </Layout>
  );
}
```

### Service Pattern

```javascript
// services/apiService.js
import axios from 'axios';
import { handleError } from './errorHandler';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    handleError(error);
    throw error;
  }
);

export const apiService = {
  // Auth
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  // Products
  getProducts: (params) =>
    api.get('/products', { params }),
  
  // Orders
  getOrders: (role) =>
    api.get(`/${role}/orders`),
};
```

### Hook Pattern

```javascript
// hooks/useApi.js
import { useState, useEffect } from 'react';

export const useApi = (apiCall) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const result = await apiCall();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
};
```

### Controller Pattern

```javascript
// controllers/manufacturerController.js
import { logger } from '../utils/logger';
import * as manufacturerService from '../services/manufacturerService';

export const getOrders = async (req, res) => {
  try {
    const manufacturerId = req.user.id;
    const orders = await manufacturerService.getOrdersByManufacturer(
      manufacturerId
    );
    
    res.json({
      success: true,
      data: orders,
      message: 'Orders retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to fetch orders',
      error: { code: 'FETCH_ERROR' }
    });
  }
};
```

### Menu Pattern

```javascript
// pages/manufacturer/menu.js
import React from 'react';
import { 
  LayoutDashboard, ShoppingCart, Box, Factory, 
  Truck, Activity, ShieldCheck 
} from 'lucide-react';

export const manufacturerMenuItems = [
  {
    icon: React.createElement(LayoutDashboard, { size: 18 }),
    label: 'Dashboard',
    path: '/manufacturer'
  },
  {
    icon: React.createElement(ShoppingCart, { size: 18 }),
    label: 'Orders',
    path: '/manufacturer/orders'
  },
  // ... more items
];
```

---

## Database Access Patterns

### Query Pattern

```javascript
// services/manufacturerService.js
import db from '../config/db';
import { logger } from '../utils/logger';

export const getOrdersByManufacturer = async (manufacturerId) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM B2B_Orders 
       WHERE manufacturer_id = ? 
       ORDER BY order_date DESC`,
      [manufacturerId]
    );
    return rows;
  } catch (error) {
    logger.error('Database error:', error);
    throw error;
  }
};

export const createProduct = async (manufacturerId, productData) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const [result] = await connection.query(
      `INSERT INTO Product_Definitions 
       (manufacturer_id, name, description, category, base_price, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [manufacturerId, productData.name, productData.description, 
       productData.category, productData.basePrice, productData.imageUrl]
    );
    
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    logger.error('Error creating product:', error);
    throw error;
  } finally {
    connection.release();
  }
};
```

---

## Environment Variables

### .env.local (Frontend)
```
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=BESS-PAS
VITE_LOG_LEVEL=debug
VITE_SESSION_TIMEOUT=3600000
```

### .env (Backend)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=supply_chain_db
PORT=5000
JWT_SECRET=your_secret_key_change_this
JWT_EXPIRY=30d
NODE_ENV=development
LOG_LEVEL=info
```

---

## Naming Conventions

### Files & Folders
- Components: `PascalCase.jsx` (e.g., `UserDashboard.jsx`)
- Services: `camelCase.js` (e.g., `apiService.js`)
- Hooks: `camelCase.js` with `use` prefix (e.g., `useAuth.js`)
- Folders: `lowercase` (e.g., `common/`, `pages/`)

### Variables & Functions
- Variables: `camelCase` (e.g., `userData`, `isLoading`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)
- React components: `PascalCase` (e.g., `Dashboard`)
- Handlers: `handleXxx` (e.g., `handleSubmit`)

### Database
- Tables: `PascalCase_Separated` (e.g., `Product_Definitions`)
- Columns: `snake_case` (e.g., `manufacturer_id`)
- Views: `v_snake_case` (e.g., `v_active_orders`)

---

## Key Directories to Create

Before implementing Phase 1:

```bash
# Client
mkdir -p client/src/services
mkdir -p client/src/hooks
mkdir -p client/src/context
mkdir -p client/src/components/common
mkdir -p client/src/components/layout
mkdir -p client/src/pages/manufacturer/components
mkdir -p client/src/pages/retailer/components
mkdir -p client/src/pages/customer/components
mkdir -p client/src/pages/admin/components

# Server
mkdir -p server/src/controllers
mkdir -p server/src/routes
mkdir -p server/src/middleware
mkdir -p server/src/services
mkdir -p server/src/utils
mkdir -p server/scripts

# Documentation
mkdir -p docs
```

---

## Next Steps

1. Review this structure
2. Create all directories
3. Start with Phase 1 of IMPLEMENTATION_PLAN.md
4. Refer to this document while developing
5. Keep documentation updated as you go
