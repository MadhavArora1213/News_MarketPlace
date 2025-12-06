-- Migration: Alter press_releases table to change google fields structure
-- Created: 2025-12-06

-- Add new columns for google search optimised
ALTER TABLE press_releases ADD COLUMN google_search_optimised_status VARCHAR(20) DEFAULT 'Not Guaranteed';
ALTER TABLE press_releases ADD COLUMN google_search_optimised_publications INTEGER DEFAULT NULL;

-- Add new columns for google news index
ALTER TABLE press_releases ADD COLUMN google_news_index_status VARCHAR(20) DEFAULT 'Not Guaranteed';
ALTER TABLE press_releases ADD COLUMN google_news_index_publications INTEGER DEFAULT NULL;

-- Migrate existing data
UPDATE press_releases SET
  google_search_optimised_status = CASE WHEN google_search_optimised = true THEN 'Guaranteed' ELSE 'Not Guaranteed' END,
  google_news_index_status = CASE WHEN google_news_index = true THEN 'Guaranteed' ELSE 'Not Guaranteed' END;

-- Drop old columns
ALTER TABLE press_releases DROP COLUMN google_search_optimised;
ALTER TABLE press_releases DROP COLUMN google_news_index;

-- Add check constraints for status values
ALTER TABLE press_releases ADD CONSTRAINT chk_google_search_optimised_status
  CHECK (google_search_optimised_status IN ('Not Guaranteed', 'Guaranteed'));

ALTER TABLE press_releases ADD CONSTRAINT chk_google_news_index_status
  CHECK (google_news_index_status IN ('Not Guaranteed', 'Guaranteed'));

-- Add check constraints for publications (must be positive when status is 'Guaranteed')
ALTER TABLE press_releases ADD CONSTRAINT chk_google_search_optimised_publications
  CHECK (google_search_optimised_status = 'Not Guaranteed' OR (google_search_optimised_status = 'Guaranteed' AND google_search_optimised_publications > 0));

ALTER TABLE press_releases ADD CONSTRAINT chk_google_news_index_publications
  CHECK (google_news_index_status = 'Not Guaranteed' OR (google_news_index_status = 'Guaranteed' AND google_news_index_publications > 0));

-- Update indexes to use new column names
DROP INDEX IF EXISTS idx_press_releases_google_search_optimised;
DROP INDEX IF EXISTS idx_press_releases_google_news_index;

CREATE INDEX IF NOT EXISTS idx_press_releases_google_search_optimised_status ON press_releases(google_search_optimised_status);
CREATE INDEX IF NOT EXISTS idx_press_releases_google_news_index_status ON press_releases(google_news_index_status);