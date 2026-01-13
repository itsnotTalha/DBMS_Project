#!/bin/bash

# Test production batches functionality

BASE_URL="http://localhost:5000/api"

echo "=== Testing Production/Batches ==="

# Create a manufacturer
echo -e "\n1. Creating manufacturer..."
MANU_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"prod-test-'$(date +%s)'@test.com",
    "password":"test123",
    "role":"Manufacturer",
    "company_name":"Production Test Manu",
    "license_number":"PROD'$(date +%s)'"
  }')
MANU_TOKEN=$(echo $MANU_RESPONSE | jq -r '.token')
MANU_ID=$(echo $MANU_RESPONSE | jq -r '.user.id')
echo "Manufacturer ID: $MANU_ID"

# Create a product
echo -e "\n2. Creating product for production..."
PROD_RESPONSE=$(curl -s -X POST $BASE_URL/manufacturer/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANU_TOKEN" \
  -d '{
    "name":"Production Test Product",
    "description":"Product for batch testing",
    "category":"Test",
    "base_price":50,
    "current_stock":0
  }')
PROD_ID=$(echo $PROD_RESPONSE | jq -r '.productId')
echo "Product ID: $PROD_ID"

# Check production batches before creating any
echo -e "\n3. Production batches (before creation):"
curl -s "$BASE_URL/manufacturer/production" \
  -H "Authorization: Bearer $MANU_TOKEN" | jq '.[] | {batch_id: .batch_id, product: .productName, qty: .quantity}' 2>/dev/null || echo "Empty or error"

# Create a production batch
echo -e "\n4. Creating production batch (100 units)..."
BATCH_RESPONSE=$(curl -s -X POST $BASE_URL/manufacturer/production \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANU_TOKEN" \
  -d "{
    \"product_def_id\":$PROD_ID,
    \"quantity\":100,
    \"manufacturing_date\":\"2026-01-01\",
    \"expiry_date\":\"2027-01-01\",
    \"batch_code\":\"BATCH-$(date +%s)\"
  }")
echo $BATCH_RESPONSE | jq .
BATCH_ID=$(echo $BATCH_RESPONSE | jq -r '.batchId // .batch_id // ""')
echo "Batch ID: $BATCH_ID"

# Check production batches after creation
echo -e "\n5. Production batches (after creation):"
curl -s "$BASE_URL/manufacturer/production" \
  -H "Authorization: Bearer $MANU_TOKEN" | jq '.[] | {batch_id: .batch_id, code: .batch_code, product: .productName, qty: .quantity}' 2>/dev/null || echo "Empty or error"

# Check product stock (should be increased)
echo -e "\n6. Product stock after batch creation:"
curl -s "$BASE_URL/manufacturer/products" \
  -H "Authorization: Bearer $MANU_TOKEN" | jq ".[] | select(.product_def_id == $PROD_ID) | {product: .name, current_stock: .current_stock}"

echo -e "\n✅ Test completed!"
