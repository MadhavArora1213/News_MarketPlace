-- Migration: Add location fields to websites table
-- Created: 2025-12-05

ALTER TABLE websites ADD COLUMN selected_continent VARCHAR(100);
ALTER TABLE websites ADD COLUMN selected_country VARCHAR(100);
ALTER TABLE websites ADD COLUMN selected_state VARCHAR(100);

-- Add comments for documentation
COMMENT ON COLUMN websites.selected_continent IS 'Continent selection for regional location type';
COMMENT ON COLUMN websites.selected_country IS 'Country selection for regional location type';
COMMENT ON COLUMN websites.selected_state IS 'State/Province selection for regional location type';