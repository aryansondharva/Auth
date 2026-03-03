-- Migration: Add profile photo column to users table
-- Run this migration to add profile_photo column to existing database

-- Add profile_photo column to users table
ALTER TABLE users 
ADD COLUMN profile_photo VARCHAR(500);

-- Add comment to describe the column
COMMENT ON COLUMN users.profile_photo IS 'URL or file path to user profile photo';
