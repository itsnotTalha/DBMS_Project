# BESS-PAS: Blockchain-Enabled Secure Supply-chain and Authenticity System

A full-stack supply chain management system with blockchain integration, supporting multiple user roles (Customer, Manufacturer, Retailer, Admin).

## Project Structure

```
├── client/                 # React frontend (ES modules)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── vite.config.js
│
└── server/                 # Express backend (ES modules)
    ├── config/
    │   └── db.js          # Database connection
    ├── controllers/
    │   ├── authController.js
    │   └── dashboardController.js
    ├── routes/
    │   ├── authRoutes.js
    │   └── dashboardRoutes.js
    ├── server.js          # Express server
    ├── package.json
    └── .env.example       # Environment variables template
```

## Prerequisites

- Node.js (v16 or higher)
- MySQL 8.0 or higher
- npm or yarn

## Installation & Setup

### 1. Backend Setup

```bash
cd server
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bess_pas
JWT_SECRET=your_secure_jwt_secret_key
```

### 3. Database Setup

Create the MySQL database and import the schema:

```bash
mysql -u root -p < database_schema.sql
```

### 4. Start Backend Server

```bash
npm start
# or with nodemon for development
npx nodemon server.js
```

Server will run on `http://localhost:5000`

### 5. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/shipments` - Get shipment data
- `GET /api/dashboard/ledger` - Get ledger transactions

## User Roles & Access

### 1. Customer
- View order history
- Track shipments
- View product information
- Route: `/customer-dashboard`

### 2. Manufacturer
- Full dashboard access
- Manage products
- Track shipments
- View IoT alerts
- Access ledger audit
- Route: `/dashboard`

### 3. Retailer
- Manage inventory
- Track sales
- Customer management
- Route: `/retailer-dashboard`

### 4. Admin
- System administration
- User management
- System monitoring
- Route: `/admin-dashboard`

## Features

✅ **Authentication & Authorization**
- JWT-based authentication
- Role-based access control
- Secure password hashing (bcryptjs)

✅ **ES Module Architecture**
- Both frontend and backend use ES6 modules
- Clean separation of controllers and routes
- Modular component structure

✅ **Responsive UI**
- Tailwind CSS styling
- Mobile-friendly design
- Icon library (Lucide React)

✅ **Real-time Data**
- Dashboard statistics
- Shipment tracking
- IoT sensor readings
- Ledger transactions

## Development

### Available Scripts

**Backend:**
```bash
npm start           # Start server
npx nodemon server.js  # Start with auto-reload
```

**Frontend:**
```bash
npm run dev         # Development server
npm run build       # Production build
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| DB_HOST | MySQL host | localhost |
| DB_USER | MySQL username | root |
| DB_PASSWORD | MySQL password | password123 |
| DB_NAME | Database name | bess_pas |
| JWT_SECRET | JWT signing secret | your_secret_key |

## Troubleshooting

### Backend Connection Issues
- Ensure MySQL is running
- Check database credentials in `.env`
- Verify database and tables exist

### Frontend Not Loading
- Clear browser cache
- Check if Vite dev server is running
- Verify backend is accessible on port 5000

### Authentication Errors
- Ensure JWT_SECRET is set
- Check token expiration
- Verify user credentials in database

## Technology Stack

**Frontend:**
- React 19
- React Router DOM
- Axios (HTTP client)
- Tailwind CSS
- Lucide React (Icons)
- Vite

**Backend:**
- Express.js 5
- MySQL2/Promise
- JWT (jsonwebtoken)
- bcryptjs
- dotenv

## License

ISC

## Support

For issues or questions, please refer to the documentation or contact the development team.
