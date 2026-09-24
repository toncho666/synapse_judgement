-- Docker PostgreSQL initialization script
-- This runs automatically when the container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE synapse_judgement TO synapse;

-- Note: Tables will be created by Prisma migration
-- The backend will run `npx prisma db push` on startup
