#!/bin/bash

# Sync script - ensures project structure is correct
# Run this after cloning or pulling changes

set -e

echo "🔄 Synapse Judgement - Sync"
echo "==========================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}⚠ Not in project root, searching...${NC}"
    if [ -f "../package.json" ]; then
        cd ..
    else
        echo -e "${RED}❌ Cannot find project root${NC}"
        exit 1
    fi
fi

# Check structure
echo -e "${BLUE}Checking project structure...${NC}"

if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ frontend/ directory not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ frontend/ exists${NC}"

if [ ! -d "backend" ]; then
    echo -e "${RED}❌ backend/ directory not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ backend/ exists${NC}"

if [ ! -f "frontend/package.json" ]; then
    echo -e "${RED}❌ frontend/package.json not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ frontend/package.json exists${NC}"

if [ ! -f "backend/package.json" ]; then
    echo -e "${RED}❌ backend/package.json not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ backend/package.json exists${NC}"

echo ""

# Check if backend is inside frontend (old structure)
if [ -f "frontend/backend/package.json" ]; then
    echo -e "${YELLOW}⚠ Found backend inside frontend (old structure)${NC}"
    echo -e "${BLUE}Moving backend to correct location...${NC}"
    mv frontend/backend ./backend
    echo -e "${GREEN}✓ Moved backend to root${NC}"
    echo ""
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing root dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Root dependencies installed${NC}"
    echo ""
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    echo ""
fi

if [ ! -d "backend/node_modules" ]; then
    echo -e "${BLUE}Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
    echo ""
fi

# Check .env files
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠ backend/.env not found${NC}"
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${GREEN}✓ Created backend/.env from .env.example${NC}"
        echo -e "${YELLOW}  Please edit backend/.env and set your DATABASE_URL${NC}"
    fi
    echo ""
fi

# Make scripts executable
echo -e "${BLUE}Making scripts executable...${NC}"
chmod +x scripts/*.sh 2>/dev/null || true
chmod +x backend/scripts/*.sh 2>/dev/null || true
echo -e "${GREEN}✓ Scripts are executable${NC}"
echo ""

echo -e "${GREEN}==========================${NC}"
echo -e "${GREEN}✓ Sync complete!${NC}"
echo -e "${GREEN}==========================${NC}"
echo ""
echo -e "${BLUE}Project structure:${NC}"
echo "  synapse-judgement/"
echo "  ├── frontend/     ✓"
echo "  ├── backend/      ✓"
echo "  ├── scripts/      ✓"
echo "  └── README.md     ✓"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Edit backend/.env (set DATABASE_URL)"
echo "  2. Create database: createdb synapse_judgement"
echo "  3. Initialize DB: cd backend && npm run db:push && npm run db:seed"
echo "  4. Start project: npm run dev"
echo ""
