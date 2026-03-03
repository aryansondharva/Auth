-- PostgreSQL Database Schema for Auth System
-- Copy and paste this into pgAdmin4 Query Tool

-- Create Database (if needed)
-- CREATE DATABASE authdb;

-- Use the database
-- \c authdb;

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create trigger to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample user (optional - for testing)
-- INSERT INTO users (id, name, email, password) 
-- VALUES 
-- ('test-user-id', 'Test User', 'test@example.com', '$2b$10$sample.hashed.password.here');

-- Verify table creation
SELECT * FROM users LIMIT 1;

-- Table info
\d users;
