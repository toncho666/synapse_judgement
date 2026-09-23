-- Synapse Judgement Database Setup Script
-- Run: psql -U postgres -f scripts/setup-db.sql

-- Create database
CREATE DATABASE synapse_judgement;

-- Connect to the database
\c synapse_judgement

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions (adjust user as needed)
-- GRANT ALL PRIVILEGES ON DATABASE synapse_judgement TO postgres;

-- Note: Tables will be created by Prisma migration
-- Run: npx prisma db push
