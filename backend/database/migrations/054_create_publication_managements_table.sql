-- Migration: Create publication_managements table
-- Created: 2025-12-03

CREATE TABLE IF NOT EXISTS publication_managements (
    id SERIAL PRIMARY KEY,
    region VARCHAR(255),
    publication_name VARCHAR(255),
    publication_url VARCHAR(500),
    da INTEGER,
    article_reference_link VARCHAR(500),
    committed_tat VARCHAR(100),
    language VARCHAR(100),
    publication_primary_focus VARCHAR(255),
    practical_tat VARCHAR(100),
    price_usd DECIMAL(10,2),
    do_follow BOOLEAN,
    dr INTEGER,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_publication_managements_id ON publication_managements(id);
CREATE INDEX IF NOT EXISTS idx_publication_managements_region ON publication_managements(region);
CREATE INDEX IF NOT EXISTS idx_publication_managements_publication_name ON publication_managements(publication_name);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_publication_managements_updated_at
    BEFORE UPDATE ON publication_managements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();