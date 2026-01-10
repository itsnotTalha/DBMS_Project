#!/bin/bash

# Test retailer order history

BASE_URL="http://localhost:5000/api"

echo "=== Testing Retailer Order History ==="

# Create a manufacturer
echo -e "\n1. Creating manufacturer..."
MANU_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"rettest-manu-'$(date +%s)'@test.com",
    "password":"test123",
    "role":"Manufacturer",
    "company_name":"Retailer Test Manu",
    "license_number":"RETTEST'$(date +%s)'"
  }')
MANU_TOKEN=$(echo $MANU_RESPONSE | jq -r '.token')
MANU_ID=$(echo $MANU_RESPONSE | jq -r '.user.id')
echo "Manufacturer ID: $MANU_ID"

# Create a retailer
echo -e "\n2. Creating retailer..."
RET_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"rettest-ret-'$(date +%s)'@test.com",
    "password":"test123",
    "role":"Retailer",
    "business_name":"Retailer History Test",
    "tax_id":"RETTEST'$(date +%s)'",
    "headquarters_address":"123 Test St"
  }')
RET_TOKEN=$(echo $RET_RESPONSE | jq -r '.token')
RET_ID=$(echo $RET_RESPONSE | jq -r '.user.id')
echo "Retailer ID: $RET_ID"

# Create a product
echo -e "\n3. Creating product..."
PROD_RESPONSE=$(curl -s -X POST $BASE_URL/manufacturer/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANU_TOKEN" \
  -d '{
    "name":"Retailer History Test Product",
    "description":"Test",
    "category":"Test",
    "base_price":100,
    "current_stock":100
  }')
PROD_ID=$(echo $PROD_RESPONSE | jq -r '.productId')
echo "Product ID: $PROD_ID"

# Create first order
echo -e "\n4. Retailer creating first order (20 units)..."
ORDER1_RESPONSE=$(curl -s -X POST $BASE_URL/retailer/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RET_TOKEN" \
  -d "{
    \"manufacturerId\":$MANU_ID,
    \"items\":[{\"productId\":$PROD_ID,\"quantity\":20}]
  }")
ORDER1_ID=$(echo $ORDER1_RESPONSE | jq -r '.orderId')
echo "Order 1 created: $ORDER1_ID"

# Create second order
echo -e "\n5. Retailer creating second order (15 units)..."
ORDER2_RESPONSE=$(curl -s -X POST $BASE_URL/retailer/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RET_TOKEN" \
  -d "{
    \"manufacturerId\":$MANU_ID,
    \"items\":[{\"productId\":$PROD_ID,\"quantity\":15}]
  }")
ORDER2_ID=$(echo $ORDER2_RESPONSE | jq -r '.orderId')
echo "Order 2 created: $ORDER2_ID"

# Get retailer orders (before any action)
echo -e "\n6. Retailer viewing order history (before action):"
RET_ORDERS=$(curl -s $BASE_URL/retailer/orders \
  -H "Authorization: Bearer $RET_TOKEN" | jq '.data')
echo $RET_ORDERS | jq '.[] | {id: .b2b_order_id, status: .status, manufacturer: .company_name, total: .total_amount, items: (.items | length)}'

# Manufacturer accepts Order 1
echo -e "\n7. Manufacturer accepting Order 1..."
curl -s -X POST $BASE_URL/manufacturer/orders/$ORDER1_ID/accept \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANU_TOKEN" \
  -d '{}' | jq .

# Manufacturer rejects Order 2
echo -e "\n8. Manufacturer rejecting Order 2..."
curl -s -X POST $BASE_URL/manufacturer/orders/$ORDER2_ID/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANU_TOKEN" \
  -d '{}' | jq .

# Get retailer orders (after actions)
echo -e "\n9. Retailer viewing order history (after actions):"
RET_ORDERS=$(curl -s $BASE_URL/retailer/orders \
  -H "Authorization: Bearer $RET_TOKEN" | jq '.data')
echo $RET_ORDERS | jq '.[] | {id: .b2b_order_id, status: .status, manufacturer: .company_name, total: .total_amount, items: .items | map({product: .product_name, qty: .quantity_ordered})}'

echo -e "\n✅ Test completed!"
