-- Migration: Create themes table
-- Created: 2024-11-12

CREATE TABLE IF NOT EXISTS themes (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(255),
    username VARCHAR(255),
    page_name VARCHAR(255),
    no_of_followers INTEGER,
    collaboration TEXT,
    category VARCHAR(255),
    location VARCHAR(255),
    price_reel_without_tagging_collaboration DECIMAL(10,2),
    price_reel_with_tagging_collaboration DECIMAL(10,2),
    price_reel_with_tagging DECIMAL(10,2),
    video_minute_allowed INTEGER,
    pin_post_charges_week DECIMAL(10,2),
    story_charges DECIMAL(10,2),
    story_with_reel_charges DECIMAL(10,2),
    page_website VARCHAR(500),
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    submitted_by_admin INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    is_active BOOLEAN DEFAULT TRUE,
    status_history JSONB DEFAULT '[]'::jsonb,
    approved_at TIMESTAMP,
    approved_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    rejected_at TIMESTAMP,
    rejected_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    admin_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_themes_platform ON themes(platform);
CREATE INDEX IF NOT EXISTS idx_themes_username ON themes(username);
CREATE INDEX IF NOT EXISTS idx_themes_status ON themes(status);
CREATE INDEX IF NOT EXISTS idx_themes_is_active ON themes(is_active);
CREATE INDEX IF NOT EXISTS idx_themes_submitted_by ON themes(submitted_by);
CREATE INDEX IF NOT EXISTS idx_themes_submitted_by_admin ON themes(submitted_by_admin);
CREATE INDEX IF NOT EXISTS idx_themes_approved_at ON themes(approved_at);
CREATE INDEX IF NOT EXISTS idx_themes_rejected_at ON themes(rejected_at);
CREATE INDEX IF NOT EXISTS idx_themes_approved_by ON themes(approved_by);
CREATE INDEX IF NOT EXISTS idx_themes_rejected_by ON themes(rejected_by);
CREATE INDEX IF NOT EXISTS idx_themes_created_at ON themes(created_at);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_themes_updated_at
    BEFORE UPDATE ON themes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();