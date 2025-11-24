-- Migration: Add author and tags columns to blogs table
-- Created: 2025-11-22

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author VARCHAR(255);
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS tags TEXT;

-- Create index for author for better performance
CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs(author);

-- Update existing blogs to have default values if needed
UPDATE blogs SET author = 'Unknown Author' WHERE author IS NULL;
UPDATE blogs SET tags = 'general' WHERE tags IS NULL;