-- Migration: Add country code fields to press_pack_orders table
-- Created: 2025-12-06

ALTER TABLE press_pack_orders ADD COLUMN IF NOT EXISTS whatsapp_country_code VARCHAR(10) DEFAULT '+91';
ALTER TABLE press_pack_orders ADD COLUMN IF NOT EXISTS calling_country_code VARCHAR(10) DEFAULT '+91';

-- Note: These fields store country codes for phone numbers (e.g., +91 for India, +1 for USA)