#!/bin/bash

# Migration script - moves backend from frontend/ to root
# Run this if your backend is still inside frontend/

set -e

echo "🔄 Synapse Judgement - Migration"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if backend is in the wrong place
if [ -f "frontend/backend/package.json" ]; then
    echo -e "${YELLOW}⚠ Found backend inside frontend/${NC}"
    echo -e "${BLUE}This is the old structure. Migrating...${NC}"
    echo ""
    
    # Backup
    echo -e "${BLUE}Creating backup...${NC}"
    if [ -d "backend" ]; then
        echo -e "${YELLOW}⚠ backend/ already exists at root${NC}"
        read -p "Overwrite? (y/N) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}❌ Migration cancelled${NC}"
            exit 1
        fi
        rm -rf backend
    fi
    
    # Move backend
    echo -e "${BLUE}Moving backend/ to root...${NC}"
    mv frontend/backend ./backend
    echo -e "${GREEN}✓ Moved backend/ to root${NC}"
    echo ""
    
    # Update paths in backend/.env
    if [ -f "backend/.env" ]; then
        echo -e "${BLUE}Checking backend/.env...${NC}"
        if grep -q "frontend/backend" backend/.env; then
            echo -e "${YELLOW}⚠ Found old paths in .env, updating...${NC}"
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' 's|frontend/backend||g' backend/.env
            else
                sed -i 's|frontend/backend||g' backend/.env
            fi
            echo -e "${GREEN}✓ Updated .env paths${NC}"
        fi
    fi
    echo ""
    
    # Reinstall dependencies
    echo -e "${BLUE}Reinstalling backend dependencies...${NC}"
    cd backend
    rm -rf node_modules
    npm install
    cd ..
    echo -e "${GREEN}✓ Backend dependencies reinstalled${NC}"
    echo ""
    
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}✓ Migration complete!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo -e "${BLUE}New structure:${NC}"
    echo "  synapse-judgement/"
    echo "  ├── frontend/     # React app"
    echo "  ├── backend/      # Node.js API"
    echo "  ├── scripts/      # Automation scripts"
    echo "  └── README.md     # Documentation"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Run: make install"
    echo "  2. Run: make db-setup"
    echo "  3. Run: make dev"
    echo ""
    
else
    echo -e "${GREEN}✓ Project structure is correct${NC}"
    echo "  backend/ is already at root level"
    echo ""
    echo -e "${BLUE}No migration needed!${NC}"
fi
