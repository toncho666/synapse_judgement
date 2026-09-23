#!/bin/bash

# API Test Script for Synapse Judgement Backend
# Usage: ./scripts/test-api.sh

BASE_URL="http://localhost:3001/api"

echo "🧪 Testing Synapse Judgement API"
echo "================================"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing health check..."
curl -s "$BASE_URL/../health" | jq .
echo ""

# Test 2: Register
echo "2️⃣  Testing registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test'$(date +%s)'@example.com",
    "name": "Test User",
    "password": "password123"
  }')

echo "$REGISTER_RESPONSE" | jq .
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
echo "Token: ${TOKEN:0:20}..."
echo ""

# Test 3: Login
echo "3️⃣  Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@synapse.ai",
    "password": "demo123"
  }')

echo "$LOGIN_RESPONSE" | jq .
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
echo "Token: ${TOKEN:0:20}..."
echo ""

# Test 4: Get User Profile
echo "4️⃣  Testing get user profile..."
curl -s "$BASE_URL/users/me" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 5: Get All Agents
echo "5️⃣  Testing get all agents..."
curl -s "$BASE_URL/agents" | jq .
echo ""

# Test 6: Get Agent Profile
echo "6️⃣  Testing get agent profile..."
curl -s "$BASE_URL/agents/tech/profile" | jq .
echo ""

# Test 7: Run Analysis
echo "7️⃣  Testing run analysis..."
ANALYSIS_RESPONSE=$(curl -s -X POST "$BASE_URL/analysis/run" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "ticker": "AAPL",
    "agents": ["tech", "fund", "news"],
    "portfolio": 100000
  }')

echo "$ANALYSIS_RESPONSE" | jq .
SESSION_ID=$(echo "$ANALYSIS_RESPONSE" | jq -r '.sessionId')
echo "Session ID: $SESSION_ID"
echo ""

# Wait for analysis to complete
echo "⏳ Waiting for analysis to complete (3 seconds)..."
sleep 3

# Test 8: Get Analysis Result
echo "8️⃣  Testing get analysis result..."
curl -s "$BASE_URL/analysis/$SESSION_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 9: Get Analysis History
echo "9️⃣  Testing get analysis history..."
curl -s "$BASE_URL/analysis/history" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 10: Get User Stats
echo "🔟 Testing get user stats..."
curl -s "$BASE_URL/users/me/stats" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "✅ All tests completed!"
