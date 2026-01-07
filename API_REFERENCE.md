# BESS-PAS API Reference & Database Guide

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "password123",
  "role": "Customer|Manufacturer|Retailer|Admin",
  
  // For Customer
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "1234567890",
  
  // For Manufacturer
  "company_name": "ABC Manufacturing",
  "license_number": "LIC123",
  "contract_details": "Details here",
  
  // For Retailer
  "business_name": "XYZ Retail",
  "tax_id": "TAX123",
  "headquarters_address": "123 Main St"
}

Response (201 Created):
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "Customer"
  }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "Customer",
    "name": "John Doe"
  }
}
```

#### Logout
```
POST /auth/logout

Response (200 OK):
{
  "message": "Logged out successfully"
}
```

### Dashboard Endpoints

#### Get Statistics
```
GET /dashboard/stats

Response (200 OK):
{
  "batches": 42,
  "units": 1500,
  "transit": 23,
  "alerts": 5
}
```

#### Get Shipments
```
GET /dashboard/shipments

Response (200 OK):
[
  {
    "id": "TRACK001",
    "batch": "BATCH001",
    "dest": "New York",
    "temp": 4.5,
    "status": "In_Transit"
  },
  ...
]
```

#### Get Ledger
```
GET /dashboard/ledger

Response (200 OK):
[
  {
    "title": "Product added",
    "time": "2024-01-07T10:30:00Z",
    "hash": "abc123def456..."
  },
  ...
]
```

---

## 🗄️ Database Tables

### Users Table
```sql
CREATE TABLE Users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Customer', 'Manufacturer', 'Retailer', 'Admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Customers Table
```sql
CREATE TABLE Customers (
  customer_id INT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES Users(user_id)
);
```

### Manufacturers Table
```sql
CREATE TABLE Manufacturers (
  manufacturer_id INT PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  contract_details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manufacturer_id) REFERENCES Users(user_id)
);
```

### Retailers Table
```sql
CREATE TABLE Retailers (
  retailer_id INT PRIMARY KEY,
  business_name VARCHAR(255) NOT NULL,
  tax_id VARCHAR(100) UNIQUE NOT NULL,
  headquarters_address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (retailer_id) REFERENCES Users(user_id)
);
```

### Products Table
```sql
CREATE TABLE Products (
  product_id INT PRIMARY KEY AUTO_INCREMENT,
  manufacturer_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manufacturer_id) REFERENCES Manufacturers(manufacturer_id)
);
```

### Batches Table
```sql
CREATE TABLE Batches (
  batch_id INT PRIMARY KEY AUTO_INCREMENT,
  batch_code VARCHAR(100) UNIQUE NOT NULL,
  manufacturer_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manufacturer_id) REFERENCES Manufacturers(manufacturer_id),
  FOREIGN KEY (product_id) REFERENCES Products(product_id)
);
```

### Product_Items Table
```sql
CREATE TABLE Product_Items (
  item_id INT PRIMARY KEY AUTO_INCREMENT,
  batch_id INT NOT NULL,
  serial_number VARCHAR(100) UNIQUE NOT NULL,
  status ENUM('Active', 'Sold', 'Expired') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (batch_id) REFERENCES Batches(batch_id)
);
```

### Deliveries Table
```sql
CREATE TABLE Deliveries (
  delivery_id INT PRIMARY KEY AUTO_INCREMENT,
  tracking_number VARCHAR(100) UNIQUE NOT NULL,
  order_id INT NOT NULL,
  current_location VARCHAR(255),
  status ENUM('Pending', 'In_Transit', 'Delivered') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES Batches(batch_id)
);
```

### IoT_Readings Table
```sql
CREATE TABLE IoT_Readings (
  reading_id INT PRIMARY KEY AUTO_INCREMENT,
  batch_id INT NOT NULL,
  temperature DECIMAL(5, 2),
  humidity DECIMAL(5, 2),
  pressure DECIMAL(7, 2),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (batch_id) REFERENCES Batches(batch_id)
);
```

### Risk_Alerts Table
```sql
CREATE TABLE Risk_Alerts (
  alert_id INT PRIMARY KEY AUTO_INCREMENT,
  batch_id INT NOT NULL,
  alert_type VARCHAR(100),
  severity ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (batch_id) REFERENCES Batches(batch_id)
);
```

### Product_Transactions Table
```sql
CREATE TABLE Product_Transactions (
  transaction_id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  action VARCHAR(100),
  from_user_id INT,
  to_user_id INT,
  previous_hash VARCHAR(255),
  current_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES Product_Items(item_id),
  FOREIGN KEY (from_user_id) REFERENCES Users(user_id),
  FOREIGN KEY (to_user_id) REFERENCES Users(user_id)
);
```

---

## 🔐 Authentication Flow

1. **Register** → POST `/auth/register` → Receive JWT token
2. **Login** → POST `/auth/login` → Receive JWT token
3. **Use Token** → Add to headers: `Authorization: Bearer <token>`
4. **Logout** → POST `/auth/logout` → Clear token on client

---

## 📊 Available Queries

### Dashboard Statistics
- **Total Batches**: Count from Batches table
- **Total Units**: Count from Product_Items table
- **In Transit Shipments**: Count from Deliveries where status = 'In_Transit'
- **High Severity Alerts**: Count from Risk_Alerts where severity = 'High'

### Shipment Tracking
- Join Deliveries with Batches for batch codes
- Get latest IoT readings for temperature
- Show delivery status

### Ledger Audit
- Fetch from Product_Transactions
- Show action, timestamp, and hash
- Order by recent first

---

## 💡 Usage Examples

### Register with cURL
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "role": "Manufacturer",
    "company_name": "Tech Corp",
    "license_number": "LIC001",
    "contract_details": "Contract details here"
  }'
```

### Login with cURL
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Dashboard Stats with cURL
```bash
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🧪 Testing

Use Postman or similar tool to test:

1. Register a new user
2. Login to get JWT token
3. Copy token to Authorization header
4. Test dashboard endpoints
5. Verify response data

---

## 📋 Response Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - Invalid token |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal server error |

---

## 🔑 JWT Token Structure

Tokens are signed with your JWT_SECRET and contain:
```json
{
  "id": 1,
  "role": "Manufacturer",
  "iat": 1234567890,
  "exp": 1234654290
}
```

Token expires in 30 days (configurable in code).

---

For more details, see:
- `README.md` - Project overview
- `CONVERSION_SUMMARY.md` - Code changes
- Backend source files - Implementation details
