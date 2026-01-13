#!/bin/bash

# BESS-PAS Project Setup and Run Script

echo "======================================"
echo "BESS-PAS - Setup & Run Script"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo -e "${GREEN}✓ Node.js is installed${NC}"
echo -e "  Version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo -e "${GREEN}✓ npm is installed${NC}"
echo -e "  Version: $(npm --version)"

# Setup Backend
echo ""
echo -e "${BLUE}Setting up Backend...${NC}"
cd server

if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env with your database credentials${NC}"
fi

if [ ! -d node_modules ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

echo -e "${GREEN}✓ Backend setup complete${NC}"

# Setup Frontend
echo ""
echo -e "${BLUE}Setting up Frontend...${NC}"
cd ../client

if [ ! -d node_modules ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

echo -e "${GREEN}✓ Frontend setup complete${NC}"

echo ""
echo -e "${GREEN}======================================"
echo "✓ Setup Complete!"
echo "======================================${NC}"
echo ""
echo -e "${BLUE}To start the application:${NC}"
echo ""
echo "1. Open two terminals"
echo ""
echo -e "${YELLOW}Terminal 1 - Backend (Port 5000):${NC}"
echo "  cd server"
echo "  npm start"
echo ""
echo -e "${YELLOW}Terminal 2 - Frontend (Port 5173):${NC}"
echo "  cd client"
echo "  npm run dev"
echo ""
echo -e "${BLUE}Then open: http://localhost:5173${NC}"
echo ""
