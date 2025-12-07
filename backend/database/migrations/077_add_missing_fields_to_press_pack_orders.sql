-- Migration: Add missing fields to press_pack_orders table
-- Created: 2025-12-07

ALTER TABLE press_pack_orders
ADD COLUMN IF NOT EXISTS whatsapp_country_code VARCHAR(10) DEFAULT '+91',
ADD COLUMN IF NOT EXISTS calling_country_code VARCHAR(10) DEFAULT '+91',
ADD COLUMN IF NOT EXISTS press_release_type TEXT;

-- Note: This migration adds the missing fields for complete order data storage