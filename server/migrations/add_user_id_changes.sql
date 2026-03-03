-- Migration script to add user ID change tracking
-- Run this in pgAdmin4 or with psql

-- Create user_id_changes table
CREATE TABLE IF NOT EXISTS user_id_changes (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    old_id VARCHAR(255) NOT NULL,
    new_id VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint to users table
    CONSTRAINT fk_user_id_changes_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_id_changes_user_id ON user_id_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_id_changes_changed_at ON user_id_changes(changed_at);

-- Add comment
COMMENT ON TABLE user_id_changes IS 'Tracks user ID changes with 14-day, 2-change limit';
COMMENT ON COLUMN user_id_changes.user_id IS 'Current user ID (foreign key to users table)';
COMMENT ON COLUMN user_id_changes.old_id IS 'Previous user ID before change';
COMMENT ON COLUMN user_id_changes.new_id IS 'New user ID after change';
COMMENT ON COLUMN user_id_changes.changed_at IS 'When the ID change occurred';

-- Verify table creation
SELECT * FROM user_id_changes LIMIT 1;
