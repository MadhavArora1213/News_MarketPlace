-- Migration: Add word_limit column to publication_managements table
-- Created: 2025-12-05

ALTER TABLE publication_managements ADD COLUMN word_limit INTEGER;