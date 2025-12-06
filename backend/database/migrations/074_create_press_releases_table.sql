-- Migration: Create press_releases table
-- Created: 2025-12-06

CREATE TABLE IF NOT EXISTS press_releases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(255),
    niche VARCHAR(255),
    distribution_media_websites INTEGER,
    guaranteed_media_placements INTEGER,
    end_client_media_details TEXT,
    middlemen_contact_details TEXT,
    google_search_optimised BOOLEAN DEFAULT FALSE,
    google_news_index BOOLEAN DEFAULT FALSE,
    images_allowed INTEGER,
    word_limit INTEGER,
    package_options JSONB DEFAULT '[]'::jsonb,
    price DECIMAL(10,2),
    turnaround_time VARCHAR(100),
    customer_info_needed TEXT,
    description TEXT,
    image_logo TEXT,
    best_seller BOOLEAN DEFAULT FALSE,
    content_writing_assistance BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    submitted_by INTEGER REFERENCES users(id),
    submitted_by_admin INTEGER REFERENCES admins(id),
    approved_at TIMESTAMP,
    approved_by INTEGER REFERENCES admins(id),
    rejected_at TIMESTAMP,
    rejected_by INTEGER REFERENCES admins(id),
    rejection_reason TEXT,
    admin_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_press_releases_name ON press_releases(name);
CREATE INDEX IF NOT EXISTS idx_press_releases_region ON press_releases(region);
CREATE INDEX IF NOT EXISTS idx_press_releases_niche ON press_releases(niche);
CREATE INDEX IF NOT EXISTS idx_press_releases_status ON press_releases(status);
CREATE INDEX IF NOT EXISTS idx_press_releases_best_seller ON press_releases(best_seller);
CREATE INDEX IF NOT EXISTS idx_press_releases_google_search_optimised ON press_releases(google_search_optimised);
CREATE INDEX IF NOT EXISTS idx_press_releases_google_news_index ON press_releases(google_news_index);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_press_releases_updated_at
    BEFORE UPDATE ON press_releases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();