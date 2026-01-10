#!/bin/bash

# Test order acceptance and display

BASE_URL="http://localhost:5000/api"

# Create a manufacturer
echo "Creating manufacturer..."
MANU_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testmanu-accept-'$(date +%s)'@test.com",
    "password":"test123",
    "role":"Manufacturer",
    "company_name":"Test Manu Accept",
    "license_number":"LIC'$(date +%s)'"
  }')
MANU_TOKEN=$(echo $MANU_RESPONSE | jq -r '.token')
MANU_ID=$(echo $MANU_RESPONSE | jq -r '.user.id')

# Create a retailer
echo "Creating retailer..."
RET_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testret-accept-'$(date +%s)'@test.com",
    "password":"test123",
    "role":"Retailer",
    "business_name":"Test Retailer Accept",
    "tax_id":"TAX'$(date +%s)'",
    "headquarters_address":"123 Test St"
  }')
RET_TOKEN=$(echo $RET_RESPONSE | jq -r '.token')
RET_ID=$(echo $RET_RESPONSE | jq -r '.user.id')

# Create a product
echo "Creating product with 100 stock..."
PROD_RESPONSE=$(curl -s -X POST $BASE_URL/manufacturer/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANU_TOKEN" \
  -d '{
    "name":"Test Product",
    "description":"Test",
    "category":"Test",
    "base_price":100,
    "current_stock":100
  }')
PROD_ID=$(echo $PROD_RESPONSE | jq -r '.productId')

# Create an order
echo "Creating order..."
ORDER_RESPONSE=$(curl -s -X POST $BASE_URL/retailer/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RET_TOKEN" \
  -d "{
    \"manufacturerId\":$MANU_ID,
    \"items\":[{\"productId\":$PROD_ID,\"quantity\":10}]
  }")
ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.orderId')
echo "Order created: $ORDER_ID"

# Get orders before acceptance
echo -e "\nOrders BEFORE acceptance:"
curl -s $BASE_URL/manufacturer/orders \
  -H "Authorization: Bearer $MANU_TOKEN" | jq '.data[] | {id: .b2b_order_id, status: .status, retailer: .business_name, items: (.items | length)}'

# Accept order
echo -e "\nAccepting order $ORDER_ID..."
ACCEPT_RESPONSE=$(curl -s -X POST $BASE_URL/manufacturer/orders/$ORDER_ID/accept \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANU_TOKEN" \
  -d '{}')
echo $ACCEPT_RESPONSE | jq .

# Get orders after acceptance
echo -e "\nOrders AFTER acceptance:"
curl -s $BASE_URL/manufacturer/orders \
  -H "Authorization: Bearer $MANU_TOKEN" | jq '.data[] | {id: .b2b_order_id, status: .status, retailer: .business_name, items: .items}'
