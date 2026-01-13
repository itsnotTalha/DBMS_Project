#!/bin/bash

# Quick Start Guide for BESS-PAS Project

clear

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     BESS-PAS - Blockchain Supply Chain Management System   ║"
echo "║                    Quick Start Guide                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 PREREQUISITES CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not found. Install from https://nodejs.org/"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm not found"
    exit 1
fi

# Check MySQL
if command -v mysql &> /dev/null; then
    echo "✅ MySQL: $(mysql --version)"
else
    echo "⚠️  MySQL not found. Install MySQL to use the database."
fi

echo ""
echo "🔧 CONFIGURATION SETUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Server setup
if [ ! -f server/.env ]; then
    echo "📝 Creating server/.env from template..."
    cp server/.env.example server/.env
    echo "⚠️  Edit server/.env with your database credentials"
    echo "   Especially: DB_PASSWORD and JWT_SECRET"
else
    echo "✅ server/.env already exists"
fi

echo ""
echo "📦 INSTALLING DEPENDENCIES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backend dependencies
if [ ! -d "server/node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    cd server
    npm install
    cd ..
else
    echo "✅ Backend dependencies installed"
fi

# Frontend dependencies  
if [ ! -d "client/node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    cd client
    npm install
    cd ..
else
    echo "✅ Frontend dependencies installed"
fi

echo ""
echo "🎉 SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🚀 RUNNING THE PROJECT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Open TWO terminal windows and run:"
echo ""
echo "Terminal 1 - BACKEND SERVER (Port 5000):"
echo "  $ cd server"
echo "  $ npm start"
echo ""
echo "Terminal 2 - FRONTEND DEV SERVER (Port 5173):"
echo "  $ cd client"
echo "  $ npm run dev"
echo ""
echo "Then visit: http://localhost:5173"
echo ""

echo "📚 DOCUMENTATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "For detailed information, see:"
echo "  📖 README.md - Full project documentation"
echo "  📋 CONVERSION_SUMMARY.md - Changes made during conversion"
echo "  ⚙️  server/.env.example - Environment configuration template"
echo ""

echo "🔐 DEFAULT LOGIN CREDENTIALS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Create a new account via /register or use existing credentials"
echo "from your database."
echo ""
echo "User Roles:"
echo "  • Manufacturer - Full system access (/dashboard)"
echo "  • Customer - Order tracking (/customer-dashboard)"
echo "  • Retailer - Inventory management (/retailer-dashboard)"
echo "  • Admin - System administration (/admin-dashboard)"
echo ""

echo "❓ TROUBLESHOOTING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Backend won't start:"
echo "  ✓ Check server/.env has correct database credentials"
echo "  ✓ Ensure MySQL is running: sudo systemctl start mysql"
echo "  ✓ Verify database exists: CREATE DATABASE bess_pas;"
echo ""
echo "Frontend won't load:"
echo "  ✓ Clear browser cache (Ctrl+Shift+Delete)"
echo "  ✓ Check backend is running on port 5000"
echo "  ✓ Check console for errors (F12 in browser)"
echo ""
echo "Login issues:"
echo "  ✓ Ensure user credentials are correct"
echo "  ✓ Check JWT_SECRET in server/.env"
echo ""

echo "═════════════════════════════════════════════════════════════"
echo "Ready to build amazing supply chain solutions! 🚀"
echo "═════════════════════════════════════════════════════════════"
echo ""
