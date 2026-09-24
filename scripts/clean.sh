#!/bin/bash

# Clean script for Synapse Judgement
# Removes all generated files and dependencies

set -e

echo "🧹 Synapse Judgement - Clean"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

read -p "This will remove node_modules, dist, and logs. Continue? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Cleaning root...${NC}"
    rm -rf node_modules
    rm -rf package-lock.json
    
    echo -e "${BLUE}Cleaning frontend...${NC}"
    cd frontend
    rm -rf node_modules
    rm -rf dist
    rm -rf .vite
    rm -f package-lock.json
    cd ..
    
    echo -e "${BLUE}Cleaning backend...${NC}"
    cd backend
    rm -rf node_modules
    rm -rf dist
    rm -rf logs
    rm -f package-lock.json
    cd ..
    
    echo ""
    echo -e "${GREEN}✓ Clean complete!${NC}"
    echo ""
    echo -e "${BLUE}To reinstall:${NC}"
    echo "  npm run install:all"
    echo ""
    echo -e "${BLUE}Or use Make:${NC}"
    echo "  make install"
    echo ""
else
    echo -e "${YELLOW}Cancelled${NC}"
fi
