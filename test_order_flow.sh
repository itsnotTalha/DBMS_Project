#!/bin/bash

# Test script for order flow

BASE_URL="http://localhost:5000/api"

echo "=== Testing Order Flow ==="

# Step 1: Register a test retailer
echo -e "\n1. Registering test retailer..."
RETAILER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testretailer-'$(date +%s)'@test.com",
    "password":"testpass123",
    "role":"Retailer",
    "business_name":"Test Retailer",
    "tax_id":"TAX12345",
    "headquarters_address":"123 Test St"
  }')
echo $RETAILER_RESPONSE | jq .
RETAILER_TOKEN=$(echo $RETAILER_RESPONSE | jq -r '.token')
RETAILER_ID=$(echo $RETAILER_RESPONSE | jq -r '.user.id')
echo "Retailer ID: $RETAILER_ID, Token: ${RETAILER_TOKEN:0:20}..."

# Step 2: Login as existing manufacturer
echo -e "\n2. Logging in as existing manufacturer..."
MANU_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"testmanu-'$(date +%s)'@test.com",
    "password":"testpass123",
    "role":"Manufacturer",
    "company_name":"Test Manufacturer",
    "license_number":"LIC'$(date +%s)'"
  }')
echo $MANU_RESPONSE | jq .
MANU_TOKEN=$(echo $MANU_RESPONSE | jq -r '.token')
MANU_ID=$(echo $MANU_RESPONSE | jq -r '.user.id')
echo "Manufacturer ID: $MANU_ID, Token: ${MANU_TOKEN:0:20}..."

# Step 3: Create a product for the manufacturer
echo -e "\n3. Creating product for manufacturer..."
PRODUCT_RESPONSE=$(curl -s -X POST $BASE_URL/manufacturer/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANU_TOKEN" \
  -d '{
    "name":"Test Product",
    "description":"A test product",
    "category":"Electronics",
    "base_price":100,
    "current_stock":50
  }')
echo $PRODUCT_RESPONSE | jq .
PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r '.product_def_id // .productId')
echo "Product ID: $PRODUCT_ID"

# Step 4: Retailer places order
echo -e "\n4. Retailer placing order..."
ORDER_RESPONSE=$(curl -s -X POST $BASE_URL/retailer/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RETAILER_TOKEN" \
  -d '{
    "manufacturerId":'$MANU_ID',
    "items":[{"productId":'$PRODUCT_ID',"quantity":10}]
  }')
echo $ORDER_RESPONSE | jq .
ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.orderId')
echo "Order ID: $ORDER_ID"

# Step 5: Manufacturer retrieves orders
echo -e "\n5. Manufacturer retrieving orders..."
ORDERS_RESPONSE=$(curl -s -X GET $BASE_URL/manufacturer/orders \
  -H "Authorization: Bearer $MANU_TOKEN")
echo $ORDERS_RESPONSE | jq .
echo "Orders received: $(echo $ORDERS_RESPONSE | jq '.data | length') orders"
