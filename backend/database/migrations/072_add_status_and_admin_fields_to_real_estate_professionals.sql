-- Migration: Add status and admin fields to real_estate_professionals table
-- Created: 2025-12-06

-- Add status column for approval workflow
ALTER TABLE real_estate_professionals ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- Add user submission tracking
ALTER TABLE real_estate_professionals ADD COLUMN IF NOT EXISTS submitted_by INTEGER REFERENCES users(id);

-- Add admin submission tracking
ALTER TABLE real_estate_professionals ADD COLUMN IF NOT EXISTS submitted_by_admin INTEGER REFERENCES admins(id);

-- Add approval workflow fields
ALTER TABLE real_estate_professionals ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE real_estate_professionals ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES admins(id);
ALTER TABLE real_estate_professionals ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;
ALTER TABLE real_estate_professionals ADD COLUMN IF NOT EXISTS rejected_by INTEGER REFERENCES admins(id);

-- Add admin feedback fields
ALTER TABLE real_estate_professionals ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE real_estate_professionals ADD COLUMN IF NOT EXISTS admin_comments TEXT;

-- Create indexes for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_real_estate_professionals_status ON real_estate_professionals(status);
CREATE INDEX IF NOT EXISTS idx_real_estate_professionals_submitted_by ON real_estate_professionals(submitted_by);
CREATE INDEX IF NOT EXISTS idx_real_estate_professionals_submitted_by_admin ON real_estate_professionals(submitted_by_admin);
CREATE INDEX IF NOT EXISTS idx_real_estate_professionals_approved_by ON real_estate_professionals(approved_by);
CREATE INDEX IF NOT EXISTS idx_real_estate_professionals_rejected_by ON real_estate_professionals(rejected_by);