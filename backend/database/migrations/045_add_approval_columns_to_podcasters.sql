-- Migration: Add approval-related columns to podcasters table
-- Created: 2025-11-23

-- Add approval and rejection tracking columns
ALTER TABLE podcasters
ADD COLUMN approved_at TIMESTAMP,
ADD COLUMN approved_by INTEGER REFERENCES admins(id),
ADD COLUMN rejected_at TIMESTAMP,
ADD COLUMN rejected_by INTEGER REFERENCES admins(id),
ADD COLUMN rejection_reason TEXT,
ADD COLUMN admin_comments TEXT;

-- Add comments for documentation
COMMENT ON COLUMN podcasters.approved_at IS 'Timestamp when the podcaster profile was approved';
COMMENT ON COLUMN podcasters.approved_by IS 'Admin ID who approved the podcaster profile';
COMMENT ON COLUMN podcasters.rejected_at IS 'Timestamp when the podcaster profile was rejected';
COMMENT ON COLUMN podcasters.rejected_by IS 'Admin ID who rejected the podcaster profile';
COMMENT ON COLUMN podcasters.rejection_reason IS 'Reason for rejection of the podcaster profile';
COMMENT ON COLUMN podcasters.admin_comments IS 'Additional comments from admin during approval/rejection';