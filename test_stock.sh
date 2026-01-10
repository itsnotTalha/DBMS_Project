#!/bin/bash

# Test order rejection and stock deduction

BASE_URL="http://localhost:5000/api"

echo "=== Testing Order Rejection & Stock Management ==="

# Create a manufacturer
echo -e "\n1. Creating manufacturer..."
MANU_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"stock-test-'$(date +%s)'@test.com",
    "password":"test123",
    "role":"Manufacturer",
    "company_name":"Stock Test Manu",
    "license_number":"STOCK'$(date +%s)'"
  }')
MANU_TOKEN=$(echo $MANU_RESPONSE | jq -r '.token')
MANU_ID=$(echo $MANU_RESPONSE | jq -r '.user.id')
echo "Manufacturer ID: $MANU_ID"

# Create a retailer
echo -e "\n2. Creating retailer..."
RET_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"stockret-'$(date +%s)'@test.com",
    "password":"test123",
    "role":"Retailer",
    "business_name":"Stock Test Retailer",
    "tax_id":"STOCK'$(date +%s)'",
    "headquarters_address":"123 Test St"
  }')
RET_TOKEN=$(echo $RET_RESPONSE | jq -r '.token')
RET_ID=$(echo $RET_RESPONSE | jq -r '.user.id')
echo "Retailer ID: $RET_ID"

# Create a product with 100 stock
echo -e "\n3. Creating product with 100 units..."
PROD_RESPONSE=$(curl -s -X POST $BASE_URL/manufacturer/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANU_TOKEN" \
  -d '{
    "name":"Stock Test Product",
    "description":"Test",
    "category":"Test",
    "base_price":100,
    "current_stock":100
  }')
PROD_ID=$(echo $PROD_RESPONSE | jq -r '.productId')
echo "Product ID: $PROD_ID"

# Fetch initial stock
echo -e "\n4. Initial stock:"
curl -s "$BASE_URL/manufacturer/products" \
  -H "Authorization: Bearer $MANU_TOKEN" | jq ".[] | select(.product_def_id == $PROD_ID) | {product: .name, current_stock: .current_stock, reserved_stock: .reserved_stock}"

# Create first order (20 units)
echo -e "\n5. Creating first order (20 units)..."
ORDER1_RESPONSE=$(curl -s -X POST $BASE_URL/retailer/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RET_TOKEN" \
  -d "{
    \"manufacturerId\":$MANU_ID,
    \"items\":[{\"productId\":$PROD_ID,\"quantity\":20}]
  }")
ORDER1_ID=$(echo $ORDER1_RESPONSE | jq -r '.orderId')
echo "Order 1 created: $ORDER1_ID"

# Stock after first order
echo -e "\n6. Stock after first order (should have 20 reserved):"
curl -s "$BASE_URL/manufacturer/products" \
  -H "Authorization: Bearer $MANU_TOKEN" | jq ".[] | select(.product_def_id == $PROD_ID) | {product: .name, current_stock: .current_stock, reserved_stock: .reserved_stock}"

# Create second order (30 units)
echo -e "\n7. Creating second order (30 units)..."
ORDER2_RESPONSE=$(curl -s -X POST $BASE_URL/retailer/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RET_TOKEN" \
  -d "{
    \"manufacturerId\":$MANU_ID,
    \"items\":[{\"productId\":$PROD_ID,\"quantity\":30}]
  }")
ORDER2_ID=$(echo $ORDER2_RESPONSE | jq -r '.orderId')
echo "Order 2 created: $ORDER2_ID"

# Stock after second order
echo -e "\n8. Stock after second order (should have 50 reserved):"
curl -s "$BASE_URL/manufacturer/products" \
  -H "Authorization: Bearer $MANU_TOKEN" | jq ".[] | select(.product_def_id == $PROD_ID) | {product: .name, current_stock: .current_stock, reserved_stock: .reserved_stock}"

# ACCEPT Order 1
echo -e "\n9. Accepting Order 1 (20 units)..."
curl -s -X POST $BASE_URL/manufacturer/orders/$ORDER1_ID/accept \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANU_TOKEN" \
  -d '{}' | jq .

# Stock after accepting Order 1
echo -e "\n10. Stock after accepting Order 1 (current_stock should be 80, reserved 30):"
curl -s "$BASE_URL/manufacturer/products" \
  -H "Authorization: Bearer $MANU_TOKEN" | jq ".[] | select(.product_def_id == $PROD_ID) | {product: .name, current_stock: .current_stock, reserved_stock: .reserved_stock}"

# REJECT Order 2
echo -e "\n11. Rejecting Order 2 (30 units)..."
curl -s -X POST $BASE_URL/manufacturer/orders/$ORDER2_ID/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANU_TOKEN" \
  -d '{}' | jq .

# Stock after rejecting Order 2
echo -e "\n12. Stock after rejecting Order 2 (reserved should go back to 20):"
curl -s "$BASE_URL/manufacturer/products" \
  -H "Authorization: Bearer $MANU_TOKEN" | jq ".[] | select(.product_def_id == $PROD_ID) | {product: .name, current_stock: .current_stock, reserved_stock: .reserved_stock}"

# Get all orders and show their status
echo -e "\n13. Final order statuses:"
curl -s "$BASE_URL/manufacturer/orders" \
  -H "Authorization: Bearer $MANU_TOKEN" | jq '.data[] | {id: .b2b_order_id, status: .status, items: .items[0].quantity_ordered}'
