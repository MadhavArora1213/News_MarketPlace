-- Migration: Increase phone field lengths for international numbers
-- Created: 2025-12-05

-- Increase owner_number field length to accommodate international numbers with country codes
ALTER TABLE websites ALTER COLUMN owner_number TYPE VARCHAR(30);

-- Increase owner_whatsapp field length to accommodate international numbers with country codes
ALTER TABLE websites ALTER COLUMN owner_whatsapp TYPE VARCHAR(30);

-- Add comments for documentation
COMMENT ON COLUMN websites.owner_number IS 'Owner phone number with country code (e.g., +91 9876543210)';
COMMENT ON COLUMN websites.owner_whatsapp IS 'Owner WhatsApp number with country code (e.g., +91 9876543210)';