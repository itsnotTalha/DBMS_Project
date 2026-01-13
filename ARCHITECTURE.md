# Order Management System - Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT APPLICATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐          ┌──────────────────────┐    │
│  │  RETAILER PORTAL     │          │ MANUFACTURER PORTAL  │    │
│  ├──────────────────────┤          ├──────────────────────┤    │
│  │ • Dashboard          │          │ • Dashboard          │    │
│  │ • Browse Products    │          │ • View B2B Orders    │    │
│  │ • Place Orders       │◄────────►│ • Accept Orders      │    │
│  │ • Order History      │          │ • Reject Orders      │    │
│  │ • Shipments          │          │ • Production Mgmt    │    │
│  │ • Inventory          │          │ • Shipments          │    │
│  └──────────────────────┘          └──────────────────────┘    │
│                │                            │                   │
│                └────────────┬───────────────┘                   │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  REST API LAYER    │
                    │  (Express.js)      │
                    └─────────┬──────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  AUTH Routes     │  │ RETAILER Routes  │  │ MANUFACTURER     │
│                  │  │                  │  │ Routes           │
│ • Login          │  │ • GET /orders    │  │                  │
│ • Register       │  │ • POST /orders   │  │ • GET /orders    │
│ • Validate Token │  │ • GET /makers    │  │ • POST /accept   │
│ • Logout         │  │ • GET /products  │  │ • POST /reject   │
└──────────────────┘  └──────────────────┘  └──────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼──────────────┐
                    │  CONTROLLER LAYER      │
                    │                        │
                    │ • Auth Controller      │
                    │ • Retailer Controller  │
                    │ • Manufacturer Ctrl.   │
                    │ • Dashboard Controller │
                    └─────────┬──────────────┘
                              │
                    ┌─────────▼──────────────┐
                    │  SERVICE LAYER         │
                    │                        │
                    │ • Order Processing     │
                    │ • Stock Management     │
                    │ • Validation           │
                    │ • Transaction Handler  │
                    └─────────┬──────────────┘
                              │
                    ┌─────────▼──────────────┐
                    │  DATA ACCESS LAYER     │
                    │                        │
                    │ • MySQL Query Builder  │
                    │ • Connection Pool      │
                    │ • Transaction Support  │
                    └─────────┬──────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  USERS TABLE     │  │  ORDERS TABLE    │  │  PRODUCTS TABLE  │
│                  │  │                  │  │                  │
│ • user_id        │  │ • b2b_order_id   │  │ • product_id     │
│ • name           │  │ • retailer_id    │  │ • name           │
│ • email          │  │ • manufacturer   │  │ • price          │
│ • role           │  │ • status         │  │ • stock          │
│ • password       │  │ • total_amount   │  │ • category       │
└──────────────────┘  └──────────────────┘  └──────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ ORDER_LINE_ITEMS    │
                    │                     │
                    │ • line_item_id      │
                    │ • b2b_order_id      │
                    │ • product_id        │
                    │ • quantity          │
                    │ • unit_price        │
                    └─────────────────────┘
```

---

## Data Flow Diagram

### Order Creation Flow
```
┌────────────┐
│  Retailer  │
│   Login    │
└──────┬─────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Browse Manufacturers & Products      │
│ GET /api/retailer/manufacturers      │
│ GET /api/retailer/manufacturers/:id/ │
│     products                         │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Add Products to Cart                 │
│ (Client-side state management)       │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│ Submit Order                                     │
│ POST /api/retailer/orders                        │
│ {                                                │
│   manufacturerId: 1,                             │
│   items: [{productId: 101, quantity: 50}, ...]  │
│ }                                                │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Backend Processing                   │
│ • Validate request                   │
│ • Verify retailer                    │
│ • Check stock availability           │
│ • Calculate total amount             │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Create Order (Transaction)           │
│ • Insert B2B_Orders record           │
│ • Insert Order_Line_Items records    │
│ • Reserve stock                      │
│ • Commit transaction                 │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Return Response                      │
│ {                                    │
│   orderId: 501,                      │
│   totalAmount: 5000.00               │
│ }                                    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Update UI                            │
│ • Clear cart                         │
│ • Refresh order history              │
│ • Show success message               │
└──────────────────────────────────────┘
```

### Order Acceptance Flow
```
┌─────────────────┐
│  Manufacturer   │
│   Views Order   │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│ Choose Fulfillment   │
│ Type:                │
│ 1. Direct Delivery   │
│ 2. Production Batch  │
└────────┬─────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
┌────────┐  ┌──────────────┐
│ Direct │  │ Production   │
│Delivery   │ Request      │
└───┬────┘  └──────┬───────┘
    │              │
    ▼              ▼
┌──────────────┐ ┌─────────────────────┐
│ Deduct Stock │ │ Create Production   │
│ from current │ │ Requests for Items  │
│ inventory    │ │                     │
└──────┬───────┘ └─────────┬───────────┘
       │                  │
       ▼                  ▼
┌──────────────────────────────────┐
│ Update Order Status              │
│ Status = "Shipped"               │
│ or Status = "Approved"           │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Create Delivery Record (if Direct│
│ Delivery) or Production Batch    │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Return Success Response to       │
│ Manufacturer Portal              │
└──────────────────────────────────┘
```

---

## Component Interaction Diagram

```
                        ┌──────────────────┐
                        │   Auth System     │
                        │   (Login/Token)   │
                        └────────┬──────────┘
                                 │
                   ┌─────────────┼─────────────┐
                   │             │             │
                   ▼             ▼             ▼
            ┌────────────┐ ┌────────────┐ ┌──────────┐
            │  Retailer  │ │Manufacturer│ │  Admin   │
            │   Portal   │ │   Portal   │ │ Portal   │
            └──────┬─────┘ └──────┬─────┘ └────┬─────┘
                   │             │            │
         ┌─────────┼─────────┬────┴─┬───────────┘
         │         │         │      │
         ▼         ▼         ▼      ▼
    ┌─────────────────────────────────────┐
    │       REST API Gateway              │
    │                                     │
    │  • Request Validation               │
    │  • Authentication Check             │
    │  • Rate Limiting (optional)         │
    │  • Response Formatting              │
    └─────────┬───────────────────────────┘
              │
    ┌─────────┴────────────┬──────────────┐
    │                      │              │
    ▼                      ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────┐
│ Order Mgmt   │  │ Inventory    │  │ Product  │
│ Controller   │  │ Controller   │  │ Controller
│              │  │              │  │          │
│ • Create     │  │ • Track Stock│  │ • Browse │
│ • View       │  │ • Reserve    │  │ • Search │
│ • Accept     │  │ • Release    │  │ • Detail │
│ • Reject     │  │              │  │          │
└──────┬───────┘  └──────┬───────┘  └────┬─────┘
       │                 │              │
       └─────────────────┼──────────────┘
                         │
                ┌────────▼────────┐
                │   Data Layer    │
                │                 │
                │  MySQL Database │
                └─────────────────┘
```

---

## Database Entity Relationship Diagram

```
┌─────────────────────┐       ┌──────────────────┐
│      Users          │       │  Manufacturers   │
├─────────────────────┤       ├──────────────────┤
│ user_id (PK)        │       │ manuf_id (PK)    │
│ name                │       │ company_name     │
│ email               │       │ license_number   │
│ role (enum)         │       │ email            │
│ password_hash       │       │ phone            │
└─────────────────────┘       └────────┬─────────┘
         │                              │
         │                   ┌──────────┘
         │                   │
         │     ┌─────────────┴──────────────┐
         │     │                            │
         ▼     ▼                            ▼
    ┌───────────────────┐    ┌──────────────────────┐
    │    Retailers      │    │ Product_Definitions  │
    ├───────────────────┤    ├──────────────────────┤
    │ retailer_id (PK)  │    │ product_def_id (PK)  │
    │ business_name     │    │ manufacturer_id (FK) │
    │ email             │    │ name                 │
    │ tax_id            │    │ description          │
    │ address           │    │ category             │
    └────────┬──────────┘    │ base_price           │
             │               │ current_stock        │
             │               │ reserved_stock       │
             │               │ is_active            │
             │               └────────┬─────────────┘
             │                        │
             │                        │
    ┌────────┴────────┐       ┌───────┴──────────┐
    │                 │       │                  │
    ▼                 ▼       ▼                  ▼
 ┌──────────────┐ ┌────────────────┐  ┌──────────────────┐
 │  B2B_Orders  │ │ Order_Line_    │  │   Inventory      │
 ├──────────────┤ │    Items       │  ├──────────────────┤
 │ order_id (PK)│ ├────────────────┤  │ inventory_id (PK)│
 │ retailer (FK)│ │ line_item (PK) │  │ outlet_id (FK)   │
 │ manuf (FK)   │ │ order_id (FK)  │  │ product_id (FK)  │
 │ status       │ │ product_id (FK)│  │ quantity_on_hand │
 │ total_amount │ │ quantity       │  │ aisle/shelf/sect │
 │ order_date   │ │ unit_price     │  │ last_updated     │
 └──────────────┘ │ status         │  └──────────────────┘
                  └────────────────┘
```

---

## Order Status State Machine

```
                    ┌──────────┐
                    │ CREATED  │
                    └─────┬────┘
                          │
                    ┌─────▼─────┐
                    │  PENDING   │◄─────────────────┐
                    └─────┬─────┘                   │
                          │                        │
                ┌─────────┴───────────┐             │
                │                    │             │
                ▼                    ▼             │
        ┌──────────────┐      ┌─────────────┐     │
        │  APPROVED    │      │  REJECTED   │     │
        │(Production)  │      │             │     │
        └──────┬───────┘      └─────────────┘     │
               │                                   │
               ▼                                   │
        ┌──────────────┐           Retry/Edit     │
        │ IN_PRODUCTION│──────────────────────────┘
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │  SHIPPED     │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │ DELIVERED    │
        └──────────────┘

Legend:
• CREATED: Order just created (internal state)
• PENDING: Awaiting manufacturer review
• APPROVED: Approved for production
• REJECTED: Rejected by manufacturer
• IN_PRODUCTION: Being manufactured
• SHIPPED: Dispatched from manufacturer
• DELIVERED: Received by retailer
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT SIDE                        │
├─────────────────────────────────────────────────────┤
│ • React 18+ (UI Framework)                          │
│ • React Router (Navigation)                         │
│ • Tailwind CSS (Styling)                            │
│ • Lucide React (Icons)                              │
│ • Fetch API (HTTP Requests)                         │
│ • LocalStorage (Token Management)                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  SERVER SIDE                        │
├─────────────────────────────────────────────────────┤
│ • Node.js (Runtime)                                 │
│ • Express.js (Web Framework)                        │
│ • MySQL2 (Database Driver)                          │
│ • JWT (Authentication)                              │
│ • bcryptjs (Password Hashing)                       │
│ • CORS (Cross-Origin Support)                       │
│ • Dotenv (Configuration)                            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  DATABASE                           │
├─────────────────────────────────────────────────────┤
│ • MySQL 8.0+                                        │
│ • Connection Pooling (mysql2/promise)               │
│ • Transaction Support                               │
│ • Relational Schema                                 │
└─────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌───────────────────────────────────────────────────┐
│              AUTHENTICATION LAYER                 │
├───────────────────────────────────────────────────┤
│ 1. User credentials → Hash with bcryptjs         │
│ 2. Generate JWT token (valid 24h)                │
│ 3. Token stored in localStorage                  │
│ 4. Token sent with every API request             │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│            AUTHORIZATION LAYER                  │
├────────────────────────────────────────────────┤
│ 1. Verify JWT token validity                   │
│ 2. Check user role (Retailer/Manufacturer)     │
│ 3. Validate resource ownership                 │
│ 4. Enforce role-based access control           │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│             VALIDATION LAYER                    │
├────────────────────────────────────────────────┤
│ 1. Validate request payload structure          │
│ 2. Verify data types and constraints           │
│ 3. Check business logic constraints            │
│ 4. Sanitize inputs (prevent injection)         │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│         DATA ACCESS LAYER (SECURED)             │
├────────────────────────────────────────────────┤
│ • Parameterized queries (prevent SQL injection)│
│ • Transaction integrity (ACID compliance)      │
│ • Row-level security (user can only see own)   │
└────────────────────────────────────────────────┘
```

---

**Architecture Document Version**: 1.0
**Last Updated**: 2026-01-10
