# Order Management System - Implementation Guide

## Overview
The order management system enables retailers to create orders from manufacturers, and manufacturers to view and process those orders.

## Features Implemented

### 1. Retailer Order Management

#### A. Create New Order
- **Location**: [client/src/pages/retailer/Orders.jsx](client/src/pages/retailer/Orders.jsx)
- **Features**:
  - Browse and select manufacturers
  - View products from selected manufacturer
  - Add products to cart with quantity control
  - View order summary with total amount
  - Place order with validation

#### B. View Order History
- Display all orders placed by the retailer
- Show order ID, manufacturer name, total amount, status, and date
- Real-time order status tracking

#### C. Backend Endpoints
- `GET /api/retailer/manufacturers` - Get list of all manufacturers
- `GET /api/retailer/manufacturers/:manufacturerId/products` - Get products from specific manufacturer
- `POST /api/retailer/orders` - Create new B2B order
- `GET /api/retailer/orders` - Get retailer's order history
- `GET /api/retailer/orders/:orderId` - Get specific order details

---

### 2. Manufacturer Order Management

#### A. View B2B Orders
- **Location**: [client/src/pages/manufacturer/Orders.jsx](client/src/pages/manufacturer/Orders.jsx)
- **Features**:
  - Display all incoming orders from retailers
  - Search orders by retailer name or order ID
  - View order items in detail
  - Sort orders by status

#### B. Order Actions
- **Accept Order**: Accept with fulfillment type
  - **Direct Delivery**: Ship from existing stock
  - **Production Request**: Create production batch
- **Reject Order**: Reject orders that cannot be fulfilled
- **View Order Details**: See all items and quantities

#### C. Order Fulfillment Types
1. **Direct Delivery**: 
   - Deducts from current stock immediately
   - Updates order status to "Shipped"
   - Creates delivery record

2. **Production Request**:
   - Creates production batch for each item
   - Updates order status to "Approved"
   - Manufacturing process begins

#### D. Backend Endpoints
- `GET /api/manufacturer/orders` - Get all B2B orders for manufacturer
- `POST /api/manufacturer/orders/:orderId/accept` - Accept order with fulfillment type
- `POST /api/manufacturer/orders/:orderId/reject` - Reject order

---

## Database Schema

### B2B_Orders Table
```sql
- b2b_order_id (PK)
- retailer_id (FK)
- manufacturer_id (FK)
- status (Pending, Approved, Shipped, Delivered, Rejected)
- total_amount
- order_date
- fulfillment_type
```

### Order_Line_Items Table
```sql
- line_item_id (PK)
- b2b_order_id (FK)
- product_def_id (FK)
- quantity_ordered
- unit_price
- status
- fulfilled_from
```

### Product_Definitions Table
```sql
- current_stock (Available inventory)
- reserved_stock (Stock reserved for orders)
- base_price
```

---

## Order Flow Diagram

```
┌─────────────┐
│   Retailer  │
│  Places     │
│   Order     │
└──────┬──────┘
       │
       v
┌──────────────────────┐
│  Create B2B_Order    │
│ (Status: Pending)    │
└──────┬───────────────┘
       │
       v
┌──────────────────────┐
│  Manufacturer Views  │
│    Order in Portal   │
└──────┬───────────────┘
       │
       ├──────────────────────────────────────┐
       │                                      │
       v                                      v
┌─────────────────────┐         ┌──────────────────────┐
│  Accept - Direct    │         │ Accept - Production  │
│    Delivery         │         │    Request           │
│                     │         │                      │
│ - Deduct Stock      │         │ - Create Production  │
│ - Status: Shipped   │         │ - Status: Approved   │
│ - Create Delivery   │         │ - Schedule Mfg       │
└─────────────────────┘         └──────────────────────┘
       │                                      │
       └──────────────────┬───────────────────┘
                          │
                          v
                ┌──────────────────────┐
                │   Delivery Process   │
                │  (Tracking, Status)  │
                └──────┬───────────────┘
                       │
                       v
                ┌──────────────────────┐
                │  Retailer Receives   │
                │  (Confirm Delivery)  │
                │ (Inventory Updated)  │
                └──────────────────────┘
```

---

## API Request/Response Examples

### 1. Create Order (Retailer)
**Request:**
```json
POST /api/retailer/orders
{
  "manufacturerId": 1,
  "items": [
    {
      "productId": 101,
      "quantity": 50
    },
    {
      "productId": 102,
      "quantity": 30
    }
  ]
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "orderId": 501,
  "totalAmount": 5000.00
}
```

### 2. Accept Order (Manufacturer)
**Request:**
```json
POST /api/manufacturer/orders/501/accept
{
  "fulfillment_type": "direct_delivery"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order accepted for direct_delivery",
  "data": {
    "orderId": 501,
    "fulfillment_type": "direct_delivery"
  }
}
```

### 3. Get Retailer Orders
**Request:**
```
GET /api/retailer/orders
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "orderId": 501,
    "order_date": "2026-01-10T10:30:00Z",
    "status": "Shipped",
    "total_amount": 5000.00,
    "manufacturerName": "ABC Manufacturing Co.",
    "itemCount": 2
  }
]
```

### 4. Get Manufacturer Orders
**Request:**
```
GET /api/manufacturer/orders
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "b2b_order_id": 501,
      "order_date": "2026-01-10T10:30:00Z",
      "status": "Pending",
      "fulfillment_type": null,
      "total_amount": 5000.00,
      "business_name": "XYZ Retail Inc.",
      "tax_id": "TAX123456",
      "items": [
        {
          "line_item_id": 1001,
          "product_def_id": 101,
          "quantity_ordered": 50,
          "unit_price": 50.00,
          "status": "pending"
        }
      ]
    }
  ],
  "count": 1
}
```

---

## Testing Checklist

### Retailer Functionality
- [ ] Login as Retailer
- [ ] Navigate to Orders page
- [ ] Click "Place Order" button
- [ ] Select a manufacturer
- [ ] View products from manufacturer
- [ ] Add products to cart
- [ ] Adjust quantities
- [ ] Remove products from cart
- [ ] View order total
- [ ] Place order
- [ ] Verify order appears in order history
- [ ] Check order status updates

### Manufacturer Functionality
- [ ] Login as Manufacturer
- [ ] Navigate to Orders page
- [ ] View all incoming orders
- [ ] Search orders by retailer or order ID
- [ ] Click on order to view details
- [ ] View order items and quantities
- [ ] Accept order with Direct Delivery
- [ ] Verify order status changes
- [ ] Accept order with Production Request
- [ ] Verify production batch is created
- [ ] Reject an order

### Integration Tests
- [ ] Retailer places order → Manufacturer sees it
- [ ] Order status updates appear in both portals
- [ ] Stock is properly tracked
- [ ] Multiple retailers can place orders
- [ ] Manufacturer can handle multiple orders

---

## Status Values

### Order Status Flow
1. **Pending** - Order created, awaiting manufacturer review
2. **Approved** - Manufacturer approved for production
3. **Shipped** - Order dispatched from manufacturer
4. **Delivered** - Order received by retailer
5. **Rejected** - Manufacturer rejected the order

---

## Error Handling

### Common Errors
- **Insufficient Stock**: `Insufficient stock for product {productId}`
- **Product Not Found**: `Product {productId} not found`
- **Order Not Found**: `Order not found`
- **Unauthorized**: `Unauthorized: Retailer/Manufacturer role required`
- **Order Already Fulfilled**: `Order cannot be accepted in current status`

---

## Next Steps for Enhancement

1. **Payment Integration**: Add payment processing for orders
2. **Invoice Generation**: Auto-generate invoices for orders
3. **Email Notifications**: Notify retailers on order status changes
4. **Order Analytics**: Dashboard showing order trends
5. **Bulk Ordering**: Templates for recurring orders
6. **Partial Fulfillment**: Allow split shipments
7. **Order Tracking**: Real-time GPS tracking for shipments
8. **Returns Management**: Handle order returns and refunds

---

## File Locations

- **Retailer Frontend**: [client/src/pages/retailer/Orders.jsx](client/src/pages/retailer/Orders.jsx)
- **Manufacturer Frontend**: [client/src/pages/manufacturer/Orders.jsx](client/src/pages/manufacturer/Orders.jsx)
- **Backend Controller**: [server/controllers/retailerController.js](server/controllers/retailerController.js)
- **Backend Controller**: [server/controllers/manufacturerController.js](server/controllers/manufacturerController.js)
- **Routes**: [server/routes/retailerRoutes.js](server/routes/retailerRoutes.js)
- **Routes**: [server/routes/manufacturerRoutes.js](server/routes/manufacturerRoutes.js)
