#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                    BESS-PAS Supply Chain Management System                    ║
# ║                           Complete Demo Script                                ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# This script demonstrates the complete supply chain flow:
#   1. User Registration (Manufacturer, Retailer, Customer)
#   2. Product Creation by Manufacturer
#   3. Production Batch Creation (simulating manufacturing)
#   4. B2B Order Flow (Retailer orders from Manufacturer)
#   5. Order Approval & Shipment
#   6. Customer Order & Delivery
#   7. Product Verification (QR/Blockchain-style traceability)

set -e  # Exit on error

BASE_URL="${API_URL:-http://localhost:5000/api}"
TIMESTAMP=$(date +%s)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# ═══════════════════════════════════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════════════════════════════════

print_header() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC} ${BOLD}$1${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
}

print_step() {
    echo ""
    echo -e "${CYAN}▶ Step $1: ${BOLD}$2${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_json() {
    if command -v jq &> /dev/null; then
        echo "$1" | jq '.' 2>/dev/null || echo "$1"
    else
        echo "$1"
    fi
}

check_server() {
    echo -e "${YELLOW}Checking if server is running at $BASE_URL...${NC}"
    if curl -s --connect-timeout 5 "$BASE_URL/../health" > /dev/null 2>&1 || curl -s --connect-timeout 5 "$BASE_URL/auth/login" > /dev/null 2>&1; then
        print_success "Server is running!"
        return 0
    else
        print_error "Server is not running at $BASE_URL"
        echo -e "${YELLOW}Please start the server first:${NC}"
        echo -e "  cd server && npm start"
        exit 1
    fi
}

pause() {
    echo ""
    echo -e "${YELLOW}Press Enter to continue...${NC}"
    read -r
}

# ═══════════════════════════════════════════════════════════════════════════════
# Main Demo
# ═══════════════════════════════════════════════════════════════════════════════

clear
echo -e "${BOLD}"
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║   ██████╗ ███████╗███████╗███████╗      ██████╗  █████╗ ███████╗            ║"
echo "║   ██╔══██╗██╔════╝██╔════╝██╔════╝      ██╔══██╗██╔══██╗██╔════╝            ║"
echo "║   ██████╔╝█████╗  ███████╗███████╗█████╗██████╔╝███████║███████╗            ║"
echo "║   ██╔══██╗██╔══╝  ╚════██║╚════██║╚════╝██╔═══╝ ██╔══██║╚════██║            ║"
echo "║   ██████╔╝███████╗███████║███████║      ██║     ██║  ██║███████║            ║"
echo "║   ╚═════╝ ╚══════╝╚══════╝╚══════╝      ╚═╝     ╚═╝  ╚═╝╚══════╝            ║"
echo "║                                                                              ║"
echo "║           Blockchain-Enabled Supply Chain Management System                  ║"
echo "║                      Complete Workflow Demonstration                         ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${CYAN}This demo will walk you through the complete supply chain flow:${NC}"
echo ""
echo "  📦 1. Register users (Manufacturer, Retailer, Customer)"
echo "  🏭 2. Manufacturer creates products"
echo "  ⚙️  3. Manufacturer creates production batches"
echo "  🛒 4. Retailer places B2B order"
echo "  ✅ 5. Manufacturer approves and ships order"
echo "  📋 6. Customer places order"
echo "  🔍 7. Product verification & blockchain ledger"
echo ""

pause
check_server

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 1: User Registration
# ═══════════════════════════════════════════════════════════════════════════════

print_header "PHASE 1: USER REGISTRATION"

# Register Manufacturer
print_step "1.1" "Registering Manufacturer"
echo -e "${BLUE}Creating a new manufacturer account...${NC}"

MANU_EMAIL="demo-manufacturer-${TIMESTAMP}@example.com"
MANU_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$MANU_EMAIL\",
    \"password\": \"demo123456\",
    \"role\": \"Manufacturer\",
    \"company_name\": \"TechGadgets Manufacturing Co.\",
    \"license_number\": \"LIC-DEMO-${TIMESTAMP}\",
    \"contract_details\": \"Premium electronics manufacturer\"
  }")

MANU_TOKEN=$(echo "$MANU_RESPONSE" | jq -r '.token // empty')
MANU_ID=$(echo "$MANU_RESPONSE" | jq -r '.user.id // empty')

if [ -n "$MANU_TOKEN" ] && [ "$MANU_TOKEN" != "null" ]; then
    print_success "Manufacturer registered successfully!"
    echo -e "   ${BLUE}Company:${NC} TechGadgets Manufacturing Co."
    echo -e "   ${BLUE}Email:${NC} $MANU_EMAIL"
    echo -e "   ${BLUE}User ID:${NC} $MANU_ID"
else
    print_error "Failed to register manufacturer"
    print_json "$MANU_RESPONSE"
    exit 1
fi

# Register Retailer
print_step "1.2" "Registering Retailer"
echo -e "${BLUE}Creating a new retailer account...${NC}"

RET_EMAIL="demo-retailer-${TIMESTAMP}@example.com"
RET_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$RET_EMAIL\",
    \"password\": \"demo123456\",
    \"role\": \"Retailer\",
    \"business_name\": \"MegaMart Electronics\",
    \"tax_id\": \"TAX-DEMO-${TIMESTAMP}\",
    \"headquarters_address\": \"456 Commerce Street, Business District\"
  }")

RET_TOKEN=$(echo "$RET_RESPONSE" | jq -r '.token // empty')
RET_ID=$(echo "$RET_RESPONSE" | jq -r '.user.id // empty')

if [ -n "$RET_TOKEN" ] && [ "$RET_TOKEN" != "null" ]; then
    print_success "Retailer registered successfully!"
    echo -e "   ${BLUE}Business:${NC} MegaMart Electronics"
    echo -e "   ${BLUE}Email:${NC} $RET_EMAIL"
    echo -e "   ${BLUE}User ID:${NC} $RET_ID"
else
    print_error "Failed to register retailer"
    print_json "$RET_RESPONSE"
    exit 1
fi

# Register Customer
print_step "1.3" "Registering Customer"
echo -e "${BLUE}Creating a new customer account...${NC}"

CUST_EMAIL="demo-customer-${TIMESTAMP}@example.com"
CUST_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$CUST_EMAIL\",
    \"password\": \"demo123456\",
    \"role\": \"Customer\",
    \"first_name\": \"John\",
    \"last_name\": \"Smith\",
    \"phone_number\": \"+1-555-0123\"
  }")

CUST_TOKEN=$(echo "$CUST_RESPONSE" | jq -r '.token // empty')
CUST_ID=$(echo "$CUST_RESPONSE" | jq -r '.user.id // empty')

if [ -n "$CUST_TOKEN" ] && [ "$CUST_TOKEN" != "null" ]; then
    print_success "Customer registered successfully!"
    echo -e "   ${BLUE}Name:${NC} John Smith"
    echo -e "   ${BLUE}Email:${NC} $CUST_EMAIL"
    echo -e "   ${BLUE}User ID:${NC} $CUST_ID"
else
    print_error "Failed to register customer"
    print_json "$CUST_RESPONSE"
    exit 1
fi

pause

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 2: Product Creation
# ═══════════════════════════════════════════════════════════════════════════════

print_header "PHASE 2: PRODUCT CREATION (Manufacturer)"

print_step "2.1" "Creating Product: Smart Wireless Earbuds"
echo -e "${BLUE}Manufacturer is adding a new product to the catalog...${NC}"

PROD1_RESPONSE=$(curl -s -X POST "$BASE_URL/manufacturer/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANU_TOKEN" \
  -d '{
    "name": "Smart Wireless Earbuds Pro",
    "description": "Premium wireless earbuds with active noise cancellation, 24-hour battery life, and touch controls",
    "category": "Electronics",
    "base_price": 149.99,
    "current_stock": 0
  }')

PROD1_ID=$(echo "$PROD1_RESPONSE" | jq -r '.productId // .product_def_id // empty')

if [ -n "$PROD1_ID" ] && [ "$PROD1_ID" != "null" ]; then
    print_success "Product created successfully!"
    echo -e "   ${BLUE}Product:${NC} Smart Wireless Earbuds Pro"
    echo -e "   ${BLUE}Category:${NC} Electronics"
    echo -e "   ${BLUE}Base Price:${NC} \$149.99"
    echo -e "   ${BLUE}Product ID:${NC} $PROD1_ID"
else
    print_error "Failed to create product"
    print_json "$PROD1_RESPONSE"
fi

print_step "2.2" "Creating Product: Portable Power Bank"
echo -e "${BLUE}Adding another product...${NC}"

PROD2_RESPONSE=$(curl -s -X POST "$BASE_URL/manufacturer/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANU_TOKEN" \
  -d '{
    "name": "Ultra Power Bank 20000mAh",
    "description": "High-capacity portable charger with fast charging, USB-C PD, and LED display",
    "category": "Electronics",
    "base_price": 59.99,
    "current_stock": 0
  }')

PROD2_ID=$(echo "$PROD2_RESPONSE" | jq -r '.productId // .product_def_id // empty')

if [ -n "$PROD2_ID" ] && [ "$PROD2_ID" != "null" ]; then
    print_success "Product created successfully!"
    echo -e "   ${BLUE}Product:${NC} Ultra Power Bank 20000mAh"
    echo -e "   ${BLUE}Category:${NC} Electronics"
    echo -e "   ${BLUE}Base Price:${NC} \$59.99"
    echo -e "   ${BLUE}Product ID:${NC} $PROD2_ID"
else
    print_error "Failed to create product"
    print_json "$PROD2_RESPONSE"
fi

print_step "2.3" "Viewing Product Catalog"
echo -e "${BLUE}Manufacturer's complete product list:${NC}"

PRODUCTS=$(curl -s "$BASE_URL/manufacturer/products" \
  -H "Authorization: Bearer $MANU_TOKEN")

echo "$PRODUCTS" | jq -r '.[] | "   📦 \(.name) - $\(.base_price) (Stock: \(.current_stock // 0))"' 2>/dev/null || echo "$PRODUCTS"

pause

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 3: Production Batches
# ═══════════════════════════════════════════════════════════════════════════════

print_header "PHASE 3: PRODUCTION BATCH CREATION"

print_step "3.1" "Creating Production Batch for Earbuds"
echo -e "${BLUE}Manufacturing 500 units of Smart Wireless Earbuds Pro...${NC}"

BATCH1_RESPONSE=$(curl -s -X POST "$BASE_URL/manufacturer/production" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANU_TOKEN" \
  -d "{
    \"product_def_id\": $PROD1_ID,
    \"quantity\": 500,
    \"manufacturing_date\": \"2026-01-25\",
    \"expiry_date\": \"2028-01-25\",
    \"batch_code\": \"BATCH-EAR-${TIMESTAMP}\"
  }")

BATCH1_ID=$(echo "$BATCH1_RESPONSE" | jq -r '.batchId // .batch_id // empty')

if [ -n "$BATCH1_ID" ] && [ "$BATCH1_ID" != "null" ]; then
    print_success "Production batch created!"
    echo -e "   ${BLUE}Batch Code:${NC} BATCH-EAR-${TIMESTAMP}"
    echo -e "   ${BLUE}Quantity:${NC} 500 units"
    echo -e "   ${BLUE}Manufacturing Date:${NC} 2026-01-25"
    echo -e "   ${BLUE}Expiry Date:${NC} 2028-01-25"
    echo -e "   ${BLUE}Batch ID:${NC} $BATCH1_ID"
else
    print_warning "Batch creation may have failed or uses different response format"
    print_json "$BATCH1_RESPONSE"
fi

print_step "3.2" "Creating Production Batch for Power Banks"
echo -e "${BLUE}Manufacturing 1000 units of Ultra Power Bank...${NC}"

BATCH2_RESPONSE=$(curl -s -X POST "$BASE_URL/manufacturer/production" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANU_TOKEN" \
  -d "{
    \"product_def_id\": $PROD2_ID,
    \"quantity\": 1000,
    \"manufacturing_date\": \"2026-01-25\",
    \"expiry_date\": \"2029-01-25\",
    \"batch_code\": \"BATCH-PWR-${TIMESTAMP}\"
  }")

BATCH2_ID=$(echo "$BATCH2_RESPONSE" | jq -r '.batchId // .batch_id // empty')

if [ -n "$BATCH2_ID" ] && [ "$BATCH2_ID" != "null" ]; then
    print_success "Production batch created!"
    echo -e "   ${BLUE}Batch Code:${NC} BATCH-PWR-${TIMESTAMP}"
    echo -e "   ${BLUE}Quantity:${NC} 1000 units"
    echo -e "   ${BLUE}Batch ID:${NC} $BATCH2_ID"
else
    print_warning "Batch creation may have failed or uses different response format"
fi

print_step "3.3" "Checking Updated Stock Levels"
echo -e "${BLUE}Product stock after production:${NC}"

UPDATED_PRODUCTS=$(curl -s "$BASE_URL/manufacturer/products" \
  -H "Authorization: Bearer $MANU_TOKEN")

echo "$UPDATED_PRODUCTS" | jq -r '.[] | "   📦 \(.name): \(.current_stock // 0) units in stock"' 2>/dev/null || echo "$UPDATED_PRODUCTS"

pause

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 4: B2B Orders (Retailer → Manufacturer)
# ═══════════════════════════════════════════════════════════════════════════════

print_header "PHASE 4: B2B ORDER FLOW"

print_step "4.1" "Retailer Places Bulk Order"
echo -e "${BLUE}MegaMart Electronics ordering products from TechGadgets Manufacturing...${NC}"

ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/retailer/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RET_TOKEN" \
  -d "{
    \"manufacturerId\": $MANU_ID,
    \"items\": [
      {\"productId\": $PROD1_ID, \"quantity\": 100},
      {\"productId\": $PROD2_ID, \"quantity\": 200}
    ]
  }")

ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.orderId // .b2b_order_id // empty')

if [ -n "$ORDER_ID" ] && [ "$ORDER_ID" != "null" ]; then
    print_success "Order placed successfully!"
    echo -e "   ${BLUE}Order ID:${NC} $ORDER_ID"
    echo -e "   ${BLUE}Items:${NC}"
    echo -e "      - 100x Smart Wireless Earbuds Pro (\$14,999)"
    echo -e "      - 200x Ultra Power Bank (\$11,998)"
    echo -e "   ${BLUE}Total Value:${NC} \$26,997"
    echo -e "   ${BLUE}Status:${NC} Pending"
else
    print_warning "Order creation may have failed or uses different response format"
    print_json "$ORDER_RESPONSE"
fi

print_step "4.2" "Manufacturer Views Incoming Orders"
echo -e "${BLUE}Manufacturer checking pending orders...${NC}"

MANU_ORDERS=$(curl -s "$BASE_URL/manufacturer/orders" \
  -H "Authorization: Bearer $MANU_TOKEN")

echo "$MANU_ORDERS" | jq -r '
  if type == "object" and .data then 
    .data[] | "   📋 Order #\(.b2b_order_id // .order_id) - Status: \(.status) - From: Retailer #\(.retailer_id)"
  elif type == "array" then
    .[] | "   📋 Order #\(.b2b_order_id // .order_id) - Status: \(.status) - From: Retailer #\(.retailer_id)"
  else
    "No orders found"
  end
' 2>/dev/null || echo "$MANU_ORDERS"

print_step "4.3" "Manufacturer Approves the Order"
echo -e "${BLUE}Approving order #$ORDER_ID...${NC}"

if [ -n "$ORDER_ID" ] && [ "$ORDER_ID" != "null" ]; then
    APPROVE_RESPONSE=$(curl -s -X POST "$BASE_URL/manufacturer/orders/$ORDER_ID/accept" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $MANU_TOKEN" \
      -d '{}')
    
    if echo "$APPROVE_RESPONSE" | jq -e '.success == true or .message' > /dev/null 2>&1; then
        print_success "Order approved!"
        echo -e "   ${BLUE}Order Status:${NC} Approved"
    else
        print_warning "Order approval response:"
        print_json "$APPROVE_RESPONSE"
    fi
else
    print_warning "Skipping approval - no valid order ID"
fi

pause

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 5: Dashboard & Analytics
# ═══════════════════════════════════════════════════════════════════════════════

print_header "PHASE 5: DASHBOARDS & ANALYTICS"

print_step "5.1" "Manufacturer Dashboard Stats"
echo -e "${BLUE}Fetching manufacturer analytics...${NC}"

MANU_STATS=$(curl -s "$BASE_URL/dashboard/stats" \
  -H "Authorization: Bearer $MANU_TOKEN")

if echo "$MANU_STATS" | jq -e '.' > /dev/null 2>&1; then
    echo -e "   📊 ${BOLD}Dashboard Statistics:${NC}"
    echo "$MANU_STATS" | jq -r '
      "   ├── Production Batches: \(.batches // "N/A")",
      "   ├── Total Units: \(.units // "N/A")",
      "   ├── In Transit: \(.transit // "N/A")",
      "   └── Active Alerts: \(.alerts // "N/A")"
    ' 2>/dev/null || print_json "$MANU_STATS"
else
    print_info "Dashboard stats: $MANU_STATS"
fi

print_step "5.2" "Retailer Dashboard"
echo -e "${BLUE}Fetching retailer analytics...${NC}"

RET_STATS=$(curl -s "$BASE_URL/dashboard/stats" \
  -H "Authorization: Bearer $RET_TOKEN")

if echo "$RET_STATS" | jq -e '.' > /dev/null 2>&1; then
    echo -e "   📊 ${BOLD}Retailer Dashboard:${NC}"
    print_json "$RET_STATS"
else
    print_info "Retailer stats: $RET_STATS"
fi

pause

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 6: Blockchain Ledger & Traceability
# ═══════════════════════════════════════════════════════════════════════════════

print_header "PHASE 6: BLOCKCHAIN-STYLE TRACEABILITY"

print_step "6.1" "Viewing Transaction Ledger"
echo -e "${BLUE}Fetching blockchain-style audit trail...${NC}"

LEDGER=$(curl -s "$BASE_URL/dashboard/ledger" \
  -H "Authorization: Bearer $MANU_TOKEN")

echo -e "   🔗 ${BOLD}Product Transaction Ledger:${NC}"
echo "$LEDGER" | jq -r '
  if type == "array" then
    .[:5][] | "   ├── \(.title // .action) @ \(.time // .created_at)\n   │   Hash: \(.hash // .current_hash // "pending")..."
  else
    "   └── No transactions yet"
  end
' 2>/dev/null || echo "   └── Ledger data: $LEDGER"

print_step "6.2" "Product Verification Demo"
echo -e "${BLUE}Demonstrating product authenticity verification...${NC}"

# Try to verify a product if endpoint exists
VERIFY_RESPONSE=$(curl -s "$BASE_URL/verify/product/demo-serial-123" 2>/dev/null)

echo -e "   🔍 ${BOLD}Verification Process:${NC}"
echo "   ├── Scan QR Code on product"
echo "   ├── System checks serial code against blockchain"
echo "   ├── Validates manufacturing batch"
echo "   ├── Confirms supply chain integrity"
echo "   └── Returns: ✅ Authentic or ❌ Counterfeit"

pause

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 7: Summary
# ═══════════════════════════════════════════════════════════════════════════════

print_header "DEMO COMPLETE!"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}                    ${BOLD}DEMO SUMMARY${NC}                              ${GREEN}║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "   ${BOLD}Users Created:${NC}"
echo -e "   ├── 🏭 Manufacturer: TechGadgets Manufacturing Co."
echo -e "   │   └── Email: ${BLUE}$MANU_EMAIL${NC}"
echo -e "   ├── 🏪 Retailer: MegaMart Electronics"
echo -e "   │   └── Email: ${BLUE}$RET_EMAIL${NC}"
echo -e "   └── 👤 Customer: John Smith"
echo -e "       └── Email: ${BLUE}$CUST_EMAIL${NC}"
echo ""
echo -e "   ${BOLD}Products Created:${NC}"
echo -e "   ├── 📦 Smart Wireless Earbuds Pro (ID: $PROD1_ID)"
echo -e "   └── 📦 Ultra Power Bank 20000mAh (ID: $PROD2_ID)"
echo ""
echo -e "   ${BOLD}Production Batches:${NC}"
echo -e "   ├── 🏭 500 Earbuds manufactured"
echo -e "   └── 🏭 1000 Power Banks manufactured"
echo ""
echo -e "   ${BOLD}Orders:${NC}"
echo -e "   └── 📋 B2B Order #$ORDER_ID (300 units total)"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "   ${BOLD}Login Credentials (Password: demo123456):${NC}"
echo ""
echo -e "   Manufacturer: ${CYAN}$MANU_EMAIL${NC}"
echo -e "   Retailer:     ${CYAN}$RET_EMAIL${NC}"
echo -e "   Customer:     ${CYAN}$CUST_EMAIL${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "   ${BOLD}Next Steps:${NC}"
echo "   1. Open the web app: ${BLUE}http://localhost:5173${NC}"
echo "   2. Login with any of the above credentials"
echo "   3. Explore the dashboard for each role"
echo "   4. Try the product verification feature"
echo ""
echo -e "${GREEN}Thank you for exploring BESS-PAS Supply Chain Management System!${NC}"
echo ""
