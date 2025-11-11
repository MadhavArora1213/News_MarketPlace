-- Migration: Create user_actions table for rate limiting
-- Created: 2024-11-09

CREATE TABLE IF NOT EXISTS user_actions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_actions_user_action ON user_actions(user_id, action);
CREATE INDEX IF NOT EXISTS idx_user_actions_created_at ON user_actions(created_at);