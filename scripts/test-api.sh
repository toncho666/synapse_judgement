#!/bin/bash

# Quick API test script for Synapse Judgement

set -e

BASE_URL="http://localhost:3001/api"

echo "🧪 Synapse Judgement - API Test"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if backend is running
echo -e "${BLUE}Checking backend...${NC}"
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend is not running!${NC}"
    echo "Start with: cd backend && npm run dev"
    exit 1
fi
echo -e "${GREEN}✓ Backend is running${NC}"
echo ""

# Test 1: Health check
echo -e "${BLUE}Test 1: Health check${NC}"
RESPONSE=$(curl -s http://localhost:3001/health)
if echo "$RESPONSE" | grep -q "ok"; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
fi
echo ""

# Test 2: Get agents
echo -e "${BLUE}Test 2: Get agents${NC}"
RESPONSE=$(curl -s "$BASE_URL/agents")
if echo "$RESPONSE" | grep -q "Technical"; then
    echo -e "${GREEN}✓ Agents endpoint works${NC}"
    AGENT_COUNT=$(echo "$RESPONSE" | jq '. | length')
    echo "  Found $AGENT_COUNT agents"
else
    echo -e "${RED}✗ Agents endpoint failed${NC}"
fi
echo ""

# Test 3: Login
echo -e "${BLUE}Test 3: Login${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"demo@synapse.ai","password":"demo123"}')

if echo "$RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ Login successful${NC}"
    TOKEN=$(echo "$RESPONSE" | jq -r '.token')
    echo "  Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "  Response: $RESPONSE"
    exit 1
fi
echo ""

# Test 4: Get user profile
echo -e "${BLUE}Test 4: Get user profile${NC}"
RESPONSE=$(curl -s "$BASE_URL/users/me" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "demo@synapse.ai"; then
    echo -e "${GREEN}✓ User profile retrieved${NC}"
    CREDITS=$(echo "$RESPONSE" | jq -r '.credits')
    PLAN=$(echo "$RESPONSE" | jq -r '.plan')
    echo "  Credits: $CREDITS"
    echo "  Plan: $PLAN"
else
    echo -e "${RED}✗ User profile failed${NC}"
fi
echo ""

# Test 5: Run analysis
echo -e "${BLUE}Test 5: Run analysis${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/analysis/run" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"ticker":"AAPL","agents":["tech","fund"]}')

if echo "$RESPONSE" | grep -q "sessionId"; then
    echo -e "${GREEN}✓ Analysis started${NC}"
    SESSION_ID=$(echo "$RESPONSE" | jq -r '.sessionId')
    COST=$(echo "$RESPONSE" | jq -r '.cost')
    echo "  Session ID: $SESSION_ID"
    echo "  Cost: \$$COST"
else
    echo -e "${RED}✗ Analysis failed${NC}"
    echo "  Response: $RESPONSE"
fi
echo ""

# Test 6: Wait and get result
echo -e "${BLUE}Test 6: Get analysis result${NC}"
echo "  Waiting 3 seconds..."
sleep 3

RESPONSE=$(curl -s "$BASE_URL/analysis/$SESSION_ID" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "verdict"; then
    echo -e "${GREEN}✓ Analysis result retrieved${NC}"
    VERDICT=$(echo "$RESPONSE" | jq -r '.verdict')
    CONFIDENCE=$(echo "$RESPONSE" | jq -r '.confidence')
    echo "  Verdict: $VERDICT"
    echo "  Confidence: $CONFIDENCE%"
else
    echo -e "${RED}✗ Analysis result failed${NC}"
    echo "  Response: $RESPONSE"
fi
echo ""

echo "================================"
echo -e "${GREEN}✓ All tests completed!${NC}"
echo ""
