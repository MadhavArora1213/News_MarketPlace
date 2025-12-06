-- Migration: Create real_estate_professionals table
-- Created: 2025-12-06

CREATE TABLE IF NOT EXISTS real_estate_professionals (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    ig_url TEXT,
    no_of_followers INTEGER,
    verified_tick BOOLEAN DEFAULT FALSE,
    linkedin TEXT,
    tiktok TEXT,
    facebook TEXT,
    youtube TEXT,
    real_estate_agency_owner BOOLEAN DEFAULT FALSE,
    real_estate_agent BOOLEAN DEFAULT FALSE,
    developer_employee BOOLEAN DEFAULT FALSE,
    gender VARCHAR(50),
    nationality VARCHAR(100),
    current_residence_city VARCHAR(255),
    languages JSONB DEFAULT '[]'::jsonb,
    image TEXT,
    status VARCHAR(20) DEFAULT 'pending',
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
CREATE INDEX IF NOT EXISTS idx_real_estate_professionals_first_name ON real_estate_professionals(first_name);
CREATE INDEX IF NOT EXISTS idx_real_estate_professionals_last_name ON real_estate_professionals(last_name);
CREATE INDEX IF NOT EXISTS idx_real_estate_professionals_gender ON real_estate_professionals(gender);
CREATE INDEX IF NOT EXISTS idx_real_estate_professionals_nationality ON real_estate_professionals(nationality);
CREATE INDEX IF NOT EXISTS idx_real_estate_professionals_current_residence_city ON real_estate_professionals(current_residence_city);
CREATE INDEX IF NOT EXISTS idx_real_estate_professionals_verified_tick ON real_estate_professionals(verified_tick);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_real_estate_professionals_updated_at
    BEFORE UPDATE ON real_estate_professionals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();