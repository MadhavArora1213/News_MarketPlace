-- Migration: Add image requirements columns to publication_managements table
-- Created: 2025-12-05

ALTER TABLE publication_managements ADD COLUMN needs_images BOOLEAN DEFAULT false;
ALTER TABLE publication_managements ADD COLUMN image_count INTEGER CHECK (image_count IN (1, 2));