-- Quick Database Setup Script for Synapse Judgement
-- Run this if you want to create database manually without Prisma migrations
-- Usage: psql -U postgres -d postgres -f scripts/quick-setup.sql

-- Drop database if exists (WARNING: This will delete all data!)
-- DROP DATABASE IF EXISTS synapse_judgement;

-- Create database
CREATE DATABASE synapse_judgement;

-- Connect to database
\c synapse_judgement

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE "SessionStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');
CREATE TYPE "Verdict" AS ENUM ('BUY', 'HOLD', 'SELL');
CREATE TYPE "Signal" AS ENUM ('BULL', 'BEAR', 'FLAT');
CREATE TYPE "TransactionType" AS ENUM ('ANALYSIS', 'UPGRADE', 'CREDITS_PURCHASE', 'REFERRAL_BONUS', 'WELCOME_BONUS');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    avatar VARCHAR(50) DEFAULT '🎯',
    plan "Plan" DEFAULT 'FREE',
    credits INTEGER DEFAULT 50,
    referralCode VARCHAR(50) UNIQUE NOT NULL,
    referredById UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticker VARCHAR(20) NOT NULL,
    agents TEXT[] NOT NULL,
    portfolio DOUBLE PRECISION,
    status "SessionStatus" DEFAULT 'RUNNING',
    verdict "Verdict",
    verdictWord VARCHAR(20),
    confidence INTEGER,
    targetPrice DOUBLE PRECISION,
    basePrice DOUBLE PRECISION,
    composite DOUBLE PRECISION,
    consensusBull INTEGER DEFAULT 0,
    consensusFlat INTEGER DEFAULT 0,
    consensusBear INTEGER DEFAULT 0,
    rationale TEXT[],
    cost INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completedAt TIMESTAMP
);

-- Create agent_verdicts table
CREATE TABLE agent_verdicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sessionId UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    agentId VARCHAR(50) NOT NULL,
    signal "Signal" NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    confidence INTEGER NOT NULL,
    lines TEXT[] NOT NULL,
    metrics JSONB NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type "TransactionType" NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    sessionId UUID REFERENCES sessions(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_sessions_userId ON sessions(userId);
CREATE INDEX idx_sessions_ticker ON sessions(ticker);
CREATE INDEX idx_agent_verdicts_sessionId ON agent_verdicts(sessionId);
CREATE INDEX idx_transactions_userId ON transactions(userId);

-- Insert demo user (password: demo123)
-- Password hash generated with bcrypt
INSERT INTO users (email, name, passwordHash, avatar, plan, credits, referralCode)
VALUES (
    'demo@synapse.ai',
    'Demo User',
    '$2a$10$rQZ8xKzJxKzJxKzJxKzJxuN5QxKzJxKzJxKzJxKzJxKzJxKzJxK',
    '🎯',
    'PRO',
    847,
    'DEMO2026'
);

-- Note: The password hash above is a placeholder
-- You'll need to generate a real bcrypt hash for 'demo123'
-- Use: node -e "console.log(require('bcryptjs').hashSync('demo123', 10))"

SELECT 'Database setup completed successfully!' as message;
SELECT 'Run: npm run db:generate && npm run db:push' as next_step;
