-- Migration: Update websites location_type check constraint
-- Created: 2025-12-05

-- Drop the existing check constraint
ALTER TABLE websites DROP CONSTRAINT IF EXISTS websites_location_type_check;

-- Add the updated check constraint with 'Regional' instead of 'Specific'
ALTER TABLE websites ADD CONSTRAINT websites_location_type_check
CHECK (location_type IN ('Global', 'Regional'));