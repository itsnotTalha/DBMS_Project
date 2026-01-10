# Order System Testing Guide

## Prerequisites
- Backend server running on `http://localhost:5000`
- Client running on development server
- Test user accounts created for Retailer and Manufacturer roles
- At least one manufacturer with products in the database

## Test Scenarios

### Scenario 1: Retailer Creates an Order

#### Setup
- Have a retailer user account ready
- Ensure a manufacturer exists with at least 2-3 products

#### Steps
1. **Login as Retailer**
   - Navigate to login page
   - Enter retailer credentials
   - Verify successful login

2. **Access Orders Page**
   - Click on "Orders" in the sidebar menu
   - Verify order page loads
   - Check "Place Order" button is visible

3. **Create Order**
   - Click "Place Order" button
   - Select a manufacturer from dropdown
   - Verify products list populates
   - Add 2-3 products to cart (different quantities)
   - Verify order summary shows correct total
   - Click "Place Order"
   - Verify success message appears

4. **Verify Order Appears**
   - Check order history table
   - Confirm order ID is visible
   - Verify manufacturer name is correct
   - Check total amount matches
   - Verify order status is "Pending"

#### Expected Results
- ✅ Order placed without errors
- ✅ Order appears in order history
- ✅ All details are correct
- ✅ Stock is reserved on manufacturer side

---

### Scenario 2: Manufacturer Reviews Incoming Orders

#### Setup
- Retailer has placed at least one order
- Manufacturer account is ready

#### Steps
1. **Login as Manufacturer**
   - Enter manufacturer credentials
   - Verify successful login

2. **Access B2B Orders Page**
   - Click on "B2B Orders" in sidebar
   - Verify orders list populates
   - Check retail order is visible in list

3. **View Order Details**
   - Click on "X items" button for an order
   - Modal should display order items
   - Verify product IDs, quantities, and prices
   - Close modal

4. **Accept Order - Direct Delivery**
   - Click "Accept" button
   - Select "Direct Delivery" option
   - Click "Accept Order"
   - Verify success message
   - Check order status changes to "Shipped"

#### Expected Results
- ✅ Manufacturer sees retailer orders
- ✅ Order details are accurate
- ✅ Order status updates correctly
- ✅ Stock is deducted from inventory

---

### Scenario 3: Manufacturer Rejects Order

#### Setup
- Retailer has placed an order
- Manufacturer wants to reject it

#### Steps
1. **Login as Manufacturer**
   - Access B2B Orders page
   - Find an order in "Pending" status

2. **Reject Order**
   - Click "Reject" button for the order
   - Confirm rejection in dialog
   - Verify success message

3. **Verify Status Change**
   - Check order status updates to "Rejected"
   - Verify rejection is reflected in UI

#### Expected Results
- ✅ Order rejection is recorded
- ✅ Status updates correctly
- ✅ Stock is released back to inventory

---

### Scenario 4: Manufacturer Creates Production Order

#### Setup
- Retailer has placed an order
- Manufacturer wants to produce items

#### Steps
1. **Login as Manufacturer**
   - Access B2B Orders page
   - Find a pending order

2. **Accept with Production**
   - Click "Accept" button
   - Select "Production Request" option
   - Click "Accept Order"
   - Verify success message

3. **Verify Production Request**
   - Navigate to "Production" page
   - Check new production batches are created
   - Verify items match order

#### Expected Results
- ✅ Order status changes to "Approved"
- ✅ Production batches are created
- ✅ Manufacturing process can begin

---

### Scenario 5: Search Orders (Manufacturer)

#### Setup
- Multiple orders exist from different retailers

#### Steps
1. **Login as Manufacturer**
   - Go to B2B Orders page

2. **Search by Retailer Name**
   - Type retailer business name in search box
   - Verify list filters to matching orders only
   - Clear search

3. **Search by Order ID**
   - Type order ID in search box
   - Verify specific order appears
   - Clear search

#### Expected Results
- ✅ Search filters correctly
- ✅ Results are accurate
- ✅ Clear search restores full list

---

### Scenario 6: Error Handling - Insufficient Stock

#### Setup
- Product has very limited stock (e.g., 5 units)
- Retailer account is ready

#### Steps
1. **Login as Retailer**
   - Go to Orders page
   - Place Order
   - Select manufacturer and product with low stock

2. **Try to Order More Than Available**
   - Add quantity greater than stock
   - Click "Place Order"
   - Verify error message appears

#### Expected Results
- ✅ Order is rejected with clear error
- ✅ Error message specifies the product
- ✅ Cart is not cleared (user can adjust and retry)

---

### Scenario 7: Error Handling - Missing Fields

#### Setup
- Retailer is on Orders page

#### Steps
1. **Attempt Invalid Order**
   - Click "Place Order" without selecting manufacturer
   - Try to place order with empty cart
   - Observe behavior

#### Expected Results
- ✅ Form validates inputs
- ✅ Clear error messages guide user
- ✅ Order not created

---

## Performance Testing

### Load Testing
```bash
# Simulate multiple orders being placed
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/retailer/orders \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{
      "manufacturerId": 1,
      "items": [{"productId": 1, "quantity": 5}]
    }'
done
```

### Expected Results
- Orders are processed without delays
- Database remains consistent
- Stock counts are accurate

---

## Database Verification Queries

### Check Orders Created
```sql
SELECT * FROM B2B_Orders 
WHERE manufacturer_id = 1 
ORDER BY order_date DESC;
```

### Check Order Items
```sql
SELECT * FROM Order_Line_Items 
WHERE b2b_order_id = 501;
```

### Verify Stock Updates
```sql
SELECT product_def_id, current_stock, reserved_stock 
FROM Product_Definitions 
WHERE manufacturer_id = 1;
```

### Check Order Status
```sql
SELECT b2b_order_id, status, fulfillment_type 
FROM B2B_Orders 
WHERE status != 'Pending';
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Order not created" error | Network/token issue | Check token in localStorage, refresh page |
| Orders not appearing | API call failed silently | Check browser console for errors |
| Wrong total amount | Calculation issue | Verify product prices in database |
| Stock not updating | Database transaction failed | Check server logs for errors |
| Manufacturers dropdown empty | API call failed | Verify manufacturers exist in database |

---

## Rollback Procedure (if needed)

### Delete Test Orders
```sql
-- Be careful with this!
DELETE FROM Order_Line_Items WHERE b2b_order_id IN (
  SELECT b2b_order_id FROM B2B_Orders 
  WHERE order_date > DATE_SUB(NOW(), INTERVAL 1 HOUR)
);

DELETE FROM B2B_Orders 
WHERE order_date > DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

### Reset Stock
```sql
UPDATE Product_Definitions 
SET current_stock = 1000, reserved_stock = 0;
```

---

## Success Criteria

- ✅ All 7 scenarios pass without errors
- ✅ Order data is persistent in database
- ✅ Stock calculations are accurate
- ✅ Status updates are real-time
- ✅ Error messages are clear and helpful
- ✅ API response times are < 1 second
- ✅ No console errors in browser DevTools

---

## Sign-off

| Person | Role | Date | Status |
|--------|------|------|--------|
| QA Lead | Quality Assurance | | ☐ Pass / ☐ Fail |
| Dev Lead | Development | | ☐ Approved / ☐ Needs Fix |
| Product | Product Manager | | ☐ Approved / ☐ Feedback |

---

**Testing Document Version**: 1.0
**Last Updated**: 2026-01-10
