-- Migration: Add additional fields to publication_managements table
-- Created: 2025-12-05

ALTER TABLE publication_managements
ADD COLUMN IF NOT EXISTS image VARCHAR(500),
ADD COLUMN IF NOT EXISTS rating_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS instagram VARCHAR(255),
ADD COLUMN IF NOT EXISTS facebook VARCHAR(255),
ADD COLUMN IF NOT EXISTS twitter VARCHAR(255),
ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255);

-- Add comments for documentation
COMMENT ON COLUMN publication_managements.image IS 'Publication logo or image URL';
COMMENT ON COLUMN publication_managements.rating_type IS 'Rating type like Customer Choice, Best Seller, etc.';
COMMENT ON COLUMN publication_managements.instagram IS 'Instagram profile URL';
COMMENT ON COLUMN publication_managements.facebook IS 'Facebook page URL';
COMMENT ON COLUMN publication_managements.twitter IS 'Twitter/X profile URL';
COMMENT ON COLUMN publication_managements.linkedin IS 'LinkedIn profile URL';