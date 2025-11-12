-- Migration: Create press_packs table
-- Created: 2024-11-12

CREATE TABLE IF NOT EXISTS press_packs (
    id SERIAL PRIMARY KEY,
    distribution_package VARCHAR(255),
    region VARCHAR(255),
    price DECIMAL(10,2),
    industry VARCHAR(255),
    news TEXT,
    indexed BOOLEAN,
    disclaimer TEXT,
    no_of_indexed_websites INTEGER,
    no_of_non_indexed_websites INTEGER,
    image VARCHAR(500),
    link VARCHAR(500),
    words_limit INTEGER,
    language VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_press_packs_distribution_package ON press_packs(distribution_package);
CREATE INDEX IF NOT EXISTS idx_press_packs_region ON press_packs(region);
CREATE INDEX IF NOT EXISTS idx_press_packs_industry ON press_packs(industry);
CREATE INDEX IF NOT EXISTS idx_press_packs_indexed ON press_packs(indexed);
CREATE INDEX IF NOT EXISTS idx_press_packs_language ON press_packs(language);
CREATE INDEX IF NOT EXISTS idx_press_packs_is_active ON press_packs(is_active);
CREATE INDEX IF NOT EXISTS idx_press_packs_created_at ON press_packs(created_at);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_press_packs_updated_at
    BEFORE UPDATE ON press_packs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();