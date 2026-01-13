# Supply Chain Management System

A full-stack supply chain management system with blockchain-style traceability, IoT monitoring, and multi-role support.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express 5, JWT Auth |
| Database | MySQL 8 with connection pooling |

## Project Structure

```
├── client/                    # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Auth/          # Login, Register
│   │   │   ├── manufacturer/  # Products, Production, Shipments, Orders
│   │   │   ├── retailer/      # Dashboard, Orders
│   │   │   ├── customer/      # Dashboard
│   │   │   └── admin/         # Dashboard
│   │   └── App.jsx            # Routes configuration
│   └── package.json
│
├── server/                    # Express Backend
│   ├── config/db.js           # MySQL connection pool
│   ├── controllers/           # Business logic
│   │   ├── authController.js
│   │   ├── manufacturerController.js
│   │   └── retailerController.js
│   ├── routes/                # API endpoints
│   ├── middleware/authMiddleware.js
│   └── server.js              # Entry point
│
└── Dbms queries.txt           # Database schema
```

## User Roles

| Role | Features |
|------|----------|
| **Manufacturer** | Products, Production batches, Shipments, B2B Orders, IoT Alerts, Ledger Audit |
| **Retailer** | Dashboard, Order management, Inventory |
| **Customer** | Dashboard, Order tracking |
| **Admin** | System management |

## Quick Start

### 1. Database Setup

```bash
mysql -u root -p < "Dbms queries.txt"
```

### 2. Backend

```bash
cd server
npm install

# Create .env file
echo "PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=supply_chain_db
JWT_SECRET=your_secret_key" > .env

npm start
```

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

**URLs:** Frontend → http://localhost:5173 | Backend → http://localhost:5000

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |

### Manufacturer
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/manufacturer/products` | List products |
| POST | `/api/manufacturer/products` | Add product |
| GET | `/api/manufacturer/production` | List batches |
| POST | `/api/manufacturer/production` | Create batch |
| GET | `/api/manufacturer/orders` | B2B orders |

### Retailer
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/retailer/orders` | List orders |
| POST | `/api/retailer/orders` | Place order |

## Database Schema (Key Tables)

```
Users                  → Base user table (all roles)
├── Manufacturers      → Company info, license
├── Retailers          → Business info, tax ID
├── Customers          → Personal info
└── Admins             → Permissions

Product_Definitions    → Product catalog
Batches                → Production batches
Product_Items          → Individual items with serial codes
Product_Transactions   → Blockchain-style traceability ledger

B2B_Orders             → Manufacturer ↔ Retailer orders
Customer_Orders        → Customer purchases
Inventory              → Retailer stock levels

IoT_Readings           → Temperature/humidity monitoring
QR_Scan_Logs           → Authenticity verification
```

## Key Features

- **Multi-role Auth** - JWT-based with role-specific data
- **Production Tracking** - Batch creation with auto-generated codes
- **Traceability Ledger** - Blockchain-style transaction history
- **IoT Integration** - Cold-chain monitoring support
- **QR Verification** - Counterfeit detection via scan logs
