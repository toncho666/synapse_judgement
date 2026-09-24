#!/bin/bash

# Setup script for Synapse Judgement
# Run this script on first setup

set -e  # Exit on error

echo "🚀 Synapse Judgement - Initial Setup"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo -e "${BLUE}Checking PostgreSQL...${NC}"
if ! pg_isready -q; then
    echo -e "${RED}❌ PostgreSQL is not running!${NC}"
    echo ""
    echo "Please start PostgreSQL:"
    echo "  macOS:   brew services start postgresql@15"
    echo "  Linux:   sudo systemctl start postgresql"
    echo "  Windows: Start PostgreSQL service"
    echo ""
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL is running${NC}"
echo ""

# Check Node.js
echo -e "${BLUE}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm run install:all
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Create database
echo -e "${BLUE}Creating database...${NC}"
if ! psql -lqt | cut -d \| -f 1 | grep -qw synapse_judgement; then
    createdb synapse_judgement || {
        echo -e "${RED}❌ Failed to create database${NC}"
        echo "Try: psql -U postgres -c 'CREATE DATABASE synapse_judgement;'"
        exit 1
    }
    echo -e "${GREEN}✓ Database created${NC}"
else
    echo -e "${GREEN}✓ Database already exists${NC}"
fi
echo ""

# Setup backend .env
echo -e "${BLUE}Setting up backend environment...${NC}"
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
    echo -e "${BLUE}  Please edit backend/.env and set your DATABASE_URL${NC}"
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi
echo ""

# Initialize database
echo -e "${BLUE}Initializing database...${NC}"
cd backend
npm run db:generate
npm run db:push
npm run db:seed
cd ..
echo -e "${GREEN}✓ Database initialized${NC}"
echo ""

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}✓ Setup complete!${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
echo -e "${BLUE}To start the project:${NC}"
echo "  npm run dev"
echo ""
echo -e "${BLUE}Or use Make commands:${NC}"
echo "  make dev       # Start both"
echo "  make backend   # Start backend only"
echo "  make frontend  # Start frontend only"
echo ""
echo -e "${BLUE}Demo credentials:${NC}"
echo "  Email: demo@synapse.ai"
echo "  Password: demo123"
echo ""
echo -e "${BLUE}URLs:${NC}"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"
echo ""
