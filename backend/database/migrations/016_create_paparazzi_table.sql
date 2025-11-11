-- Migration: Create paparazzi table
-- Created: 2024-11-11

CREATE TABLE IF NOT EXISTS paparazzi (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(255) DEFAULT 'Instagram',
    username VARCHAR(255),
    page_name VARCHAR(255),
    followers_count INTEGER,
    collaboration TEXT,
    category VARCHAR(255),
    location VARCHAR(255),
    price_reel_no_tag_no_collab DECIMAL(10,2),
    price_reel_with_tag_no_collab DECIMAL(10,2),
    price_reel_with_tag DECIMAL(10,2),
    video_minutes_allowed INTEGER,
    pin_post_weekly_charge DECIMAL(10,2),
    story_charge DECIMAL(10,2),
    story_with_reel_charge DECIMAL(10,2),
    page_website VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    rejection_reason TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_paparazzi_platform ON paparazzi(platform);
CREATE INDEX IF NOT EXISTS idx_paparazzi_username ON paparazzi(username);
CREATE INDEX IF NOT EXISTS idx_paparazzi_status ON paparazzi(status);
CREATE INDEX IF NOT EXISTS idx_paparazzi_user_id ON paparazzi(user_id);
CREATE INDEX IF NOT EXISTS idx_paparazzi_created_at ON paparazzi(created_at);
CREATE INDEX IF NOT EXISTS idx_paparazzi_approved_at ON paparazzi(approved_at);
CREATE INDEX IF NOT EXISTS idx_paparazzi_approved_by ON paparazzi(approved_by);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_paparazzi_updated_at
    BEFORE UPDATE ON paparazzi
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();