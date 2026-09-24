#!/bin/bash

# Status check script for Synapse Judgement

echo "🔍 Synapse Judgement - Status Check"
echo "==================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check PostgreSQL
echo "📊 PostgreSQL:"
if pg_isready -q; then
    echo -e "  ${GREEN}✓ Running${NC}"
    psql --version | sed 's/^/  /'
else
    echo -e "  ${RED}✗ Not running${NC}"
    echo "  Start with: brew services start postgresql@15"
fi
echo ""

# Check Database
echo "🗄️  Database:"
if psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw synapse_judgement; then
    echo -e "  ${GREEN}✓ synapse_judgement exists${NC}"
    
    # Check tables
    TABLE_COUNT=$(psql -d synapse_judgement -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
    if [ "$TABLE_COUNT" -gt 0 ]; then
        echo -e "  ${GREEN}✓ $TABLE_COUNT tables created${NC}"
    else
        echo -e "  ${YELLOW}⚠ No tables (run: npm run db:push)${NC}"
    fi
    
    # Check demo user
    USER_COUNT=$(psql -d synapse_judgement -t -c "SELECT count(*) FROM users;" 2>/dev/null | xargs)
    if [ "$USER_COUNT" -gt 0 ]; then
        echo -e "  ${GREEN}✓ $USER_COUNT users in database${NC}"
    else
        echo -e "  ${YELLOW}⚠ No users (run: npm run db:seed)${NC}"
    fi
else
    echo -e "  ${RED}✗ Database not found${NC}"
    echo "  Create with: createdb synapse_judgement"
fi
echo ""

# Check Backend
echo "🔧 Backend (port 3001):"
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Running${NC}"
    curl -s http://localhost:3001/health | jq -r '.timestamp' | sed 's/^/  Last check: /'
else
    echo -e "  ${RED}✗ Not running${NC}"
    echo "  Start with: cd backend && npm run dev"
fi
echo ""

# Check Frontend
echo "🎨 Frontend (port 5173):"
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Running${NC}"
else
    echo -e "  ${RED}✗ Not running${NC}"
    echo "  Start with: cd frontend && npm run dev"
fi
echo ""

# Check Node modules
echo "📦 Dependencies:"
if [ -d "node_modules" ]; then
    echo -e "  ${GREEN}✓ Root node_modules exists${NC}"
else
    echo -e "  ${YELLOW}⚠ Root node_modules missing (run: npm install)${NC}"
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "  ${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "  ${YELLOW}⚠ Frontend dependencies missing (run: cd frontend && npm install)${NC}"
fi

if [ -d "backend/node_modules" ]; then
    echo -e "  ${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "  ${YELLOW}⚠ Backend dependencies missing (run: cd backend && npm install)${NC}"
fi
echo ""

# Summary
echo "==================================="
echo "📝 Quick commands:"
echo "  make dev       # Start both projects"
echo "  make backend   # Start backend only"
echo "  make frontend  # Start frontend only"
echo "  make db-setup  # Setup database"
echo "  make status    # Check status again"
echo ""
