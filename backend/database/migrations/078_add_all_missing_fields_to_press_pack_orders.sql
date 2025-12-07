-- Migration: Add all missing fields to press_pack_orders table
-- Created: 2025-12-07

ALTER TABLE press_pack_orders
ADD COLUMN IF NOT EXISTS whatsapp_country_code VARCHAR(10) DEFAULT '+91',
ADD COLUMN IF NOT EXISTS calling_country_code VARCHAR(10) DEFAULT '+91',
ADD COLUMN IF NOT EXISTS press_release_type TEXT,
ADD COLUMN IF NOT EXISTS submitted_by_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS press_release_selection INTEGER REFERENCES press_releases(id),
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS content_writing_assistance BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS company_registration_document TEXT,
ADD COLUMN IF NOT EXISTS letter_of_authorisation TEXT,
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS word_pdf_document TEXT;

-- Note: This migration adds all the missing fields for complete order data storage