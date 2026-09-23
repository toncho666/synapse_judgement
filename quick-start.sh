#!/bin/bash

# Quick Start Script for Synapse Judgement
# This script will setup and run both frontend and backend

echo "🚀 Synapse Judgement - Quick Start"
echo "=================================="
echo ""

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL..."
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running!"
    echo ""
    echo "Please start PostgreSQL:"
    echo "  macOS:   brew services start postgresql"
    echo "  Linux:   sudo systemctl start postgresql"
    echo "  Windows: Start PostgreSQL service"
    echo ""
    exit 1
fi
echo "✅ PostgreSQL is running"
echo ""

# Setup Backend
echo "🔧 Setting up Backend..."
cd backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install --silent

# Create .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
fi

# Generate Prisma Client
echo "🔨 Generating Prisma Client..."
npm run db:generate --silent

# Push schema to database
echo "🗄️  Applying database schema..."
npm run db:push --silent

# Seed database
echo "🌱 Seeding database with test data..."
npm run db:seed --silent

cd ..

echo ""
echo "✅ Backend setup complete!"
echo ""

# Start servers
echo "🚀 Starting servers..."
echo ""
echo "Backend will run on: http://localhost:3001"
echo "Frontend will run on: http://localhost:5173"
echo ""
echo "Demo credentials:"
echo "  Email: demo@synapse.ai"
echo "  Password: demo123"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""
echo "=================================="
echo ""

# Start backend in background
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
