-- Migration: Make user_id nullable in article_submissions table
-- Created: 2025-11-17

ALTER TABLE article_submissions ALTER COLUMN user_id DROP NOT NULL;