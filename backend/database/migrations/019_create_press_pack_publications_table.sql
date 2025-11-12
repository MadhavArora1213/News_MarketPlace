-- Migration: Create press_pack_publications table
-- Created: 2024-11-12

CREATE TABLE IF NOT EXISTS press_pack_publications (
    id SERIAL PRIMARY KEY,
    press_pack_id INTEGER REFERENCES press_packs(id) ON DELETE CASCADE,
    publication_id INTEGER REFERENCES publications(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_press_pack_publications_press_pack_id ON press_pack_publications(press_pack_id);
CREATE INDEX IF NOT EXISTS idx_press_pack_publications_publication_id ON press_pack_publications(publication_id);
CREATE INDEX IF NOT EXISTS idx_press_pack_publications_created_at ON press_pack_publications(created_at);

-- Add unique constraint to prevent duplicate associations
CREATE UNIQUE INDEX IF NOT EXISTS idx_press_pack_publications_unique ON press_pack_publications(press_pack_id, publication_id);