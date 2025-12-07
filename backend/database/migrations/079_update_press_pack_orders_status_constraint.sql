-- Migration: Update press_pack_orders status constraint to use 'approved' instead of 'accepted'
-- Created: 2025-12-07

-- Drop the existing check constraint
ALTER TABLE press_pack_orders DROP CONSTRAINT IF EXISTS press_pack_orders_status_check;

-- Add the updated check constraint with 'approved' instead of 'accepted'
ALTER TABLE press_pack_orders ADD CONSTRAINT press_pack_orders_status_check
CHECK (status IN ('pending', 'approved', 'rejected', 'completed'));