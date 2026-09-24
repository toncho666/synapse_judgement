#!/bin/bash

# Database initialization script
# Run this to setup PostgreSQL database

set -e

echo "🗄️  Synapse Judgement - Database Setup"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

# Get current user
CURRENT_USER=$(whoami)
echo -e "${BLUE}Current user: $CURRENT_USER${NC}"
echo ""

# Ask for database name
read -p "Database name (default: synapse_judgement): " DB_NAME
DB_NAME=${DB_NAME:-synapse_judgement}
echo -e "${BLUE}Using database: $DB_NAME${NC}"
echo ""

# Create database
echo -e "${BLUE}Creating database...${NC}"
if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}⚠ Database '$DB_NAME' already exists${NC}"
    read -p "Drop and recreate? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        dropdb "$DB_NAME" || {
            echo -e "${RED}❌ Failed to drop database${NC}"
            exit 1
        }
        createdb "$DB_NAME" || {
            echo -e "${RED}❌ Failed to create database${NC}"
            exit 1
        }
        echo -e "${GREEN}✓ Database recreated${NC}"
    else
        echo -e "${YELLOW}⚠ Using existing database${NC}"
    fi
else
    createdb "$DB_NAME" || {
        echo -e "${RED}❌ Failed to create database${NC}"
        echo "Try: psql -U postgres -c 'CREATE DATABASE $DB_NAME;'"
        exit 1
    }
    echo -e "${GREEN}✓ Database created${NC}"
fi
echo ""

# Update .env file
echo -e "${BLUE}Updating backend/.env...${NC}"
if [ -f backend/.env ]; then
    # Backup existing .env
    cp backend/.env backend/.env.backup
    echo -e "${GREEN}✓ Backed up existing .env to .env.backup${NC}"
    
    # Update DATABASE_URL
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://$CURRENT_USER@localhost:5432/$DB_NAME?schema=public\"|" backend/.env
    else
        # Linux
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://$CURRENT_USER@localhost:5432/$DB_NAME?schema=public\"|" backend/.env
    fi
    echo -e "${GREEN}✓ Updated DATABASE_URL${NC}"
else
    echo -e "${YELLOW}⚠ backend/.env not found, creating from .env.example${NC}"
    cp backend/.env.example backend/.env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://$CURRENT_USER@localhost:5432/$DB_NAME?schema=public\"|" backend/.env
    else
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://$CURRENT_USER@localhost:5432/$DB_NAME?schema=public\"|" backend/.env
    fi
    echo -e "${GREEN}✓ Created backend/.env${NC}"
fi
echo ""

# Initialize database with Prisma
echo -e "${BLUE}Initializing database with Prisma...${NC}"
cd backend
npm run db:generate
npm run db:push
echo -e "${GREEN}✓ Database schema applied${NC}"
echo ""

# Ask if user wants to seed data
read -p "Load test data? (Y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo -e "${YELLOW}⚠ Skipping seed${NC}"
else
    npm run db:seed
    echo -e "${GREEN}✓ Test data loaded${NC}"
fi
cd ..
echo ""

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}✓ Database setup complete!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${BLUE}Database: $DB_NAME${NC}"
echo -e "${BLUE}User: $CURRENT_USER${NC}"
echo -e "${BLUE}Connection: postgresql://$CURRENT_USER@localhost:5432/$DB_NAME${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Start backend: cd backend && npm run dev"
echo "  2. Start frontend: cd frontend && npm run dev"
echo "  3. Open http://localhost:5173"
echo ""
echo -e "${BLUE}Demo credentials:${NC}"
echo "  Email: demo@synapse.ai"
echo "  Password: demo123"
echo ""
