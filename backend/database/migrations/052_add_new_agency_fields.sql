-- Migration: Add new fields to agencies table
-- Created: 2025-12-01

-- Add new columns to agencies table
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS agency_country VARCHAR(100);
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS agency_city VARCHAR(100);
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS agency_alternate_email VARCHAR(255);
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS agency_owner_alternate_email VARCHAR(255);
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS agency_alternate_contact_number VARCHAR(50);
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS agency_owner_country_code VARCHAR(10);

-- Add comments for documentation
COMMENT ON COLUMN agencies.agency_country IS 'Country where the agency is located';
COMMENT ON COLUMN agencies.agency_city IS 'City where the agency is located';
COMMENT ON COLUMN agencies.agency_alternate_email IS 'Alternate email address for the agency';
COMMENT ON COLUMN agencies.agency_owner_alternate_email IS 'Alternate email address for the agency owner';
COMMENT ON COLUMN agencies.agency_alternate_contact_number IS 'Alternate contact number for the agency';
COMMENT ON COLUMN agencies.agency_owner_country_code IS 'Country code for the agency owner contact number';