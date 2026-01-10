# BESS-PAS Implementation Roadmap

## ✅ Status: Database Connection FIXED

**Date:** January 9, 2026  
**Fix Applied:** Separated env loading into loadEnv.js, imported BEFORE db.js

---

## 🎯 Phase 1: Backend Infrastructure (Critical Path)

### 1.1 Database Schema Verification ✅ IN PROGRESS
**Requirement:** Verify/create all required tables

**Tables Needed:**
```sql
Users
├─ id (PK)
├─ email
├─ password_hash
├─ role (enum: manufacturer, retailer, customer, admin)
├─ created_at

Manufacturers
├─ manufacturer_id (FK → Users.id)
├─ company_name
├─ license_number
├─ contract_details
├─ created_at

Products
├─ product_id (PK)
├─ manufacturer_id (FK → Manufacturers)
├─ product_name
├─ description
├─ unit_price
├─ current_stock
├─ reorder_level
├─ created_at
├─ updated_at

Batches
├─ batch_id (PK)
├─ product_id (FK → Products)
├─ batch_number
├─ quantity
├─ manufacturing_date
├─ expiry_date
├─ status (enum: active, completed, expired)

Orders
├─ order_id (PK)
├─ retailer_id (FK → Users)
├─ manufacturer_id (FK → Manufacturers)
├─ product_id (FK → Products)
├─ quantity_ordered
├─ order_date
├─ status (enum: pending, accepted, rejected, in_production, dispatched, delivered, cancelled)
├─ fulfillment_type (enum: direct_delivery, production)

Shipments
├─ shipment_id (PK)
├─ order_id (FK → Orders)
├─ batch_id (FK → Batches)
├─ shipment_date
├─ expected_delivery
├─ actual_delivery
├─ status (enum: prepared, dispatched, in_transit, delivered, received)
├─ temperature (current)

IoTAlerts
├─ alert_id (PK)
├─ shipment_id (FK → Shipments)
├─ temperature
├─ humidity
├─ alert_type (enum: high_temp, low_temp, high_humidity)
├─ severity (enum: warning, critical)
├─ timestamp

Ledger
├─ ledger_id (PK)
├─ transaction_type (enum: order_created, order_accepted, production_started, shipment_dispatched, delivery_confirmed)
├─ related_entity (order_id / shipment_id)
├─ manufacturer_id (FK)
├─ retailer_id (FK)
├─ details (JSON)
├─ blockchain_hash
├─ timestamp

RetailerInventory
├─ inventory_id (PK)
├─ retailer_id (FK → Users)
├─ product_id (FK → Products)
├─ quantity
├─ location
├─ last_updated

Notifications
├─ notification_id (PK)
├─ user_id (FK → Users)
├─ type (enum: new_order, order_accepted, shipment_dispatched, delivery_confirmed)
├─ related_id (order_id / shipment_id)
├─ is_read
├─ created_at
```

**Next Action:** Check if these tables exist. If not, create database initialization script.

---

### 1.2 Backend API Routes Structure

**Manufacturer Routes** (`/api/manufacturer/*`)
```
GET    /products                  - List manufacturer's products
GET    /products/:id              - Get product details
POST   /products                  - Create new product
PUT    /products/:id              - Update product stock
DELETE /products/:id              - Deactivate product

GET    /orders                    - List B2B orders (pending)
POST   /orders/:orderId/accept    - Accept order, choose delivery/production
POST   /orders/:orderId/reject    - Reject order

POST   /production                - Create production batch
PUT    /production/:batchId       - Update batch quantity after production
GET    /production                - List active production batches

GET    /shipments                 - List active shipments
POST   /shipments                 - Create shipment from order
PUT    /shipments/:shipmentId     - Dispatch shipment (update status)
GET    /shipments/:shipmentId     - Get shipment details

GET    /iot-alerts               - List cold-chain alerts
GET    /ledger                    - Read-only ledger transactions

GET    /dashboard                 - Get metrics (pending orders, low stock, active shipments)
GET    /notifications             - Get manufacturer notifications
```

**Retailer Routes** (`/api/retailer/*`)
```
GET    /inventory                 - Get retailer's inventory
GET    /manufacturers             - List all manufacturers
GET    /manufacturers/:id/products - Browse manufacturer's products

POST   /orders                    - Create order
GET    /orders                    - List retailer's orders
GET    /orders/:id               - Get order details
DELETE /orders/:id               - Cancel pending order

GET    /shipments                 - List incoming shipments
POST   /shipments/:shipmentId/confirm - Confirm delivery (updates inventory)

GET    /iot-alerts               - List cold-chain alerts for my shipments
GET    /dashboard                 - Get metrics (active inventory, pending orders)
GET    /notifications             - Get retailer notifications
```

---

## 🎯 Phase 2: Backend Implementation

### Step-by-Step Order Flow Implementation

**1. Retailer Creates Order**
```
POST /api/retailer/orders
{
  "manufacturer_id": 5,
  "product_id": 123,
  "quantity_ordered": 100
}
```
**Backend Actions:**
- Insert into Orders table (status: pending)
- Create Notification for manufacturer
- Return order_id

**2. Manufacturer Receives Notification**
- Check manufacturer's `/notifications` endpoint
- Shows pending orders from retailers

**3. Manufacturer Decision Logic**
```
POST /api/manufacturer/orders/:orderId/accept
{
  "fulfillment_type": "direct_delivery" | "production",
  "notes": "..."
}
```
**If direct_delivery:**
- Check Products table for stock
- If stock ≥ quantity: Create Shipment record
- Update Orders status to "dispatched"
- Deduct from Products.current_stock

**If production:**
- Create Batches record
- Update Orders status to "in_production"
- Manufacturer completes production, updates batch quantity
- Then creates Shipment

**4. Shipment Dispatch**
```
PUT /api/manufacturer/shipments/:shipmentId
{
  "status": "dispatched"
}
```
- Update Shipments.status to "dispatched"
- Update Orders.status to "dispatched"
- Create Ledger transaction
- Notify retailer

**5. Retailer Confirms Delivery**
```
POST /api/retailer/shipments/:shipmentId/confirm
{
  "received_date": "2026-01-09"
}
```
**Backend Actions:**
- Update Shipments.status to "delivered"
- Update Shipments.actual_delivery
- Update Orders.status to "delivered"
- **Add to RetailerInventory:**
  - INSERT or UPDATE RetailerInventory
  - quantity += ordered_quantity
- Create Ledger transaction
- Notify both parties

---

## 🎯 Phase 3: Frontend Implementation

### Manufacturer Pages (Real Data)

**1. Dashboard (/manufacturer/dashboard)**
- Fetch from `/api/manufacturer/dashboard`
- Display: pending_orders_count, low_stock_items, active_shipments

**2. Products (/manufacturer/products)**
- Fetch from `/api/manufacturer/products`
- Show all manufacturer's products
- Columns: name, current_stock, reorder_level, actions
- Actions: Edit, View, Deactivate

**3. B2B Orders (/manufacturer/orders)**
- Fetch from `/api/manufacturer/orders`
- Status badges: pending, accepted, rejected
- Action buttons: Accept (with dropdown for delivery/production), Reject

**4. Production (/manufacturer/production)**
- Fetch from `/api/manufacturer/production`
- Show active batches with quantities
- Form: Create new production batch
- Actions: Mark completed, view shipments

**5. Shipments (/manufacturer/shipments)**
- Fetch from `/api/manufacturer/shipments`
- Status pipeline: prepared → dispatched → in_transit → delivered
- Action button: "Dispatch Now"

**6. IoT Alerts (/manufacturer/iot-alerts)**
- Fetch from `/api/manufacturer/iot-alerts`
- Filter by severity, date range
- Show: shipment_id, temperature, alert_type, timestamp

**7. Ledger (/manufacturer/ledger)**
- Fetch from `/api/manufacturer/ledger`
- Read-only transaction log
- Show: transaction_type, related_entity, timestamp, details

---

### Retailer Pages (Real Data)

**1. Dashboard (/retailer/dashboard)**
- Fetch from `/api/retailer/dashboard`
- Display: total_inventory_value, pending_orders, expected_deliveries

**2. Inventory (/retailer/inventory)**
- Fetch from `/api/retailer/inventory`
- Show product name, quantity, reorder level, location
- Columns with filters by status

**3. Create Order (/retailer/create-order)**
- Dropdown: Select manufacturer (fetch from `/api/retailer/manufacturers`)
- Products table: Fetch from `/api/retailer/manufacturers/:id/products`
- Quantity input field
- Button: "Create Order" → POST `/api/retailer/orders`

**4. My Orders (/retailer/orders)**
- Fetch from `/api/retailer/orders`
- Status badges: pending, accepted, in_production, dispatched, delivered
- Actions: Cancel (if pending), View details

**5. Incoming Shipments (/retailer/shipments)**
- Fetch from `/api/retailer/shipments`
- Status: dispatched, in_transit, delivered
- Action button: "Confirm Receipt" → triggers inventory update

**6. Cold Chain Alerts (/retailer/alerts)**
- Fetch from `/api/retailer/iot-alerts`
- Filter by shipment
- Show: alert_type, temperature, severity, timestamp

---

## 🚀 Implementation Priority

### Week 1 (Critical Path)
1. ✅ Fix database connection
2. ⏳ Create database schema + initialization script
3. ⏳ Create Manufacturer routes (products, orders)
4. ⏳ Create Retailer routes (basic CRUD)
5. ⏳ Implement order creation flow

### Week 2
6. ⏳ Implement order acceptance/rejection logic
7. ⏳ Implement shipment creation and dispatch
8. ⏳ Implement delivery confirmation (updates inventory)
9. ⏳ Create Ledger transaction logging
10. ⏳ Add role-based access control

### Week 3
11. ⏳ Implement IoT alerts system
12. ⏳ Create notification system
13. ⏳ Build frontend pages with real API calls
14. ⏳ Add error handling and validation
15. ⏳ Testing and bug fixes

---

## 🔍 Key Implementation Details

### Transaction Safety
```javascript
// Use MySQL transactions for order acceptance
BEGIN TRANSACTION;
  INSERT INTO Shipments...;
  UPDATE Products SET current_stock = current_stock - quantity;
  UPDATE Orders SET status = 'dispatched';
  INSERT INTO Ledger...;
COMMIT;
```

### Role-Based Access
```javascript
// Middleware to verify manufacturer can only see their own data
const verifyManufacturer = (req, res, next) => {
  const userId = req.user.id;
  // Query: manufacturer_id == userId
  // All queries filter by this
};
```

### Real Data Sources
- ✅ All data from database
- ✅ No hardcoded arrays
- ✅ No mocked responses
- ✅ API endpoints return real DB query results

---

## 📊 Success Criteria

1. ✅ Database connection working
2. ⏳ All tables created and seeded with test data
3. ⏳ All API endpoints return real database data
4. ⏳ Complete order lifecycle works end-to-end
5. ⏳ All frontend pages use real API calls
6. ⏳ Role-based access verified
7. ⏳ Transactions maintain data consistency
8. ⏳ No dummy/mock data anywhere

---

## 📝 Next Immediate Action

**Create and execute database initialization script:**
- Check if tables exist
- If not, create them all
- Insert test data (test manufacturer, test retailer, sample products)
- Verify all tables have data

