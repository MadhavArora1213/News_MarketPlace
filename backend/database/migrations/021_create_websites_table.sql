-- Migration: Create websites table
-- Created: 2025-11-12

CREATE TABLE IF NOT EXISTS websites (
    id SERIAL PRIMARY KEY,
    media_name VARCHAR(255) NOT NULL,
    media_website_address VARCHAR(500) NOT NULL,
    news_media_type VARCHAR(50) NOT NULL CHECK (news_media_type IN ('Blog', 'Local news', 'News agency', 'News media', 'Just a website', 'Social media')),
    languages JSON NOT NULL,
    categories JSON NOT NULL,
    custom_category VARCHAR(255),
    location_type VARCHAR(20) NOT NULL CHECK (location_type IN ('Global', 'Specific')),
    country_name VARCHAR(100),
    ig VARCHAR(255),
    facebook VARCHAR(255),
    linkedin VARCHAR(255),
    tiktok VARCHAR(255),
    youtube VARCHAR(255),
    snapchat VARCHAR(255),
    twitter VARCHAR(255),
    social_media_embedded_allowed BOOLEAN DEFAULT FALSE,
    social_media_url_allowed BOOLEAN DEFAULT FALSE,
    external_website_link_allowed BOOLEAN DEFAULT FALSE,
    images_allowed INTEGER,
    words_limit INTEGER,
    back_date_allowed BOOLEAN DEFAULT FALSE,
    da_score INTEGER,
    dr_score INTEGER,
    pa_score INTEGER,
    do_follow_links BOOLEAN DEFAULT FALSE,
    disclaimer_required BOOLEAN DEFAULT FALSE,
    listicle_allowed BOOLEAN DEFAULT FALSE,
    turnaround_time VARCHAR(100),
    price DECIMAL(10,2),
    company_name_in_title BOOLEAN DEFAULT FALSE,
    individual_name_in_title BOOLEAN DEFAULT FALSE,
    sub_heading_allowed BOOLEAN DEFAULT FALSE,
    by_line_allowed BOOLEAN DEFAULT FALSE,
    permanent_placement BOOLEAN DEFAULT FALSE,
    deletion_allowed BOOLEAN DEFAULT FALSE,
    modification_allowed BOOLEAN DEFAULT FALSE,
    owner_name VARCHAR(255) NOT NULL,
    owner_nationality VARCHAR(100) NOT NULL,
    owner_gender VARCHAR(50) NOT NULL,
    owner_number VARCHAR(20) NOT NULL,
    owner_whatsapp VARCHAR(20),
    owner_email VARCHAR(255) NOT NULL,
    owner_telegram VARCHAR(100),
    registration_document VARCHAR(500),
    tax_document VARCHAR(500),
    bank_details_document VARCHAR(500),
    passport_document VARCHAR(500),
    contact_details_document VARCHAR(500),
    how_did_you_hear VARCHAR(255),
    comments TEXT,
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    captcha_response VARCHAR(2000),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_by INTEGER NOT NULL REFERENCES users(id),
    submitted_by_admin INTEGER REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_websites_status ON websites(status);
CREATE INDEX IF NOT EXISTS idx_websites_submitted_by ON websites(submitted_by);
CREATE INDEX IF NOT EXISTS idx_websites_created_at ON websites(created_at);

-- Add missing columns if they don't exist (for migration updates)
ALTER TABLE websites ADD COLUMN IF NOT EXISTS custom_category VARCHAR(255);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_websites_updated_at
    BEFORE UPDATE ON websites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();