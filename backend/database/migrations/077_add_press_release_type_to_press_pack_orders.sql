-- Migration: Add press_release_type field to press_pack_orders table
-- Created: 2025-12-06

ALTER TABLE press_pack_orders ADD COLUMN IF NOT EXISTS press_release_type TEXT;

-- Note: This field will store JSON array of press release types (company/project, individual/brand)