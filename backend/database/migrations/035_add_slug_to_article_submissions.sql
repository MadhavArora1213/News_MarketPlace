-- Migration: Add slug column to article_submissions table
-- Created: 2025-11-17

ALTER TABLE article_submissions ADD COLUMN slug VARCHAR(255) UNIQUE;

-- Create index for slug
CREATE INDEX IF NOT EXISTS idx_article_submissions_slug ON article_submissions(slug);