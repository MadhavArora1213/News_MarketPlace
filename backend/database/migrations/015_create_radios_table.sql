-- Migration: Create radios table
-- Created: 2024-11-11

CREATE TABLE IF NOT EXISTS radios (
    id SERIAL PRIMARY KEY,
    sn VARCHAR(50) UNIQUE NOT NULL,
    group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
    radio_name VARCHAR(255) NOT NULL,
    frequency VARCHAR(255),
    radio_language VARCHAR(255),
    radio_website VARCHAR(500),
    radio_linkedin VARCHAR(500),
    radio_instagram VARCHAR(500),
    emirate_state VARCHAR(255),
    radio_popular_rj VARCHAR(255),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_radios_sn ON radios(sn);
CREATE INDEX IF NOT EXISTS idx_radios_group_id ON radios(group_id);
CREATE INDEX IF NOT EXISTS idx_radios_created_at ON radios(created_at);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_radios_updated_at
    BEFORE UPDATE ON radios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();