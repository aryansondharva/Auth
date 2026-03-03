-- Migration: Add profile fields to users table
-- Run this migration to add profile fields to existing database

-- Add new profile columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS github VARCHAR(255),
ADD COLUMN IF NOT EXISTS twitter VARCHAR(255),
ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255),
ADD COLUMN IF NOT EXISTS website VARCHAR(500),
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE;

-- Add comments to describe the columns
COMMENT ON COLUMN users.username IS 'Unique username for the user';
COMMENT ON COLUMN users.bio IS 'User bio or tagline';
COMMENT ON COLUMN users.location IS 'User location';
COMMENT ON COLUMN users.github IS 'GitHub username';
COMMENT ON COLUMN users.twitter IS 'Twitter username';
COMMENT ON COLUMN users.linkedin IS 'LinkedIn username';
COMMENT ON COLUMN users.website IS 'Personal website URL';
COMMENT ON COLUMN users.is_online IS 'Online status indicator';
COMMENT ON COLUMN users.last_active IS 'Last active timestamp';

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
