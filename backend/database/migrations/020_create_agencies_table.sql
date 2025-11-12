-- Migration: Create agencies table
-- Created: 2024-11-12

CREATE TABLE IF NOT EXISTS agencies (
    id SERIAL PRIMARY KEY,
    agency_name VARCHAR(255) NOT NULL,
    agency_legal_entity_name VARCHAR(255),
    agency_website VARCHAR(500),
    agency_ig VARCHAR(255),
    agency_linkedin VARCHAR(255),
    agency_facebook VARCHAR(255),
    agency_address TEXT,
    agency_owner_name VARCHAR(255),
    agency_owner_linkedin VARCHAR(255),
    agency_founded_year INTEGER,
    agency_owner_passport_nationality VARCHAR(100),
    agency_document_incorporation_trade_license VARCHAR(500),
    agency_document_tax_registration VARCHAR(500),
    agency_bank_details VARCHAR(500),
    agency_owner_passport VARCHAR(500),
    agency_owner_photo VARCHAR(500),
    agency_email VARCHAR(255),
    agency_contact_number VARCHAR(50),
    agency_owner_email VARCHAR(255),
    agency_owner_contact_number VARCHAR(50),
    agency_owner_whatsapp_number VARCHAR(50),
    telegram VARCHAR(255),
    how_did_you_hear_about_us VARCHAR(255),
    any_to_say VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agencies_status ON agencies(status);
CREATE INDEX IF NOT EXISTS idx_agencies_created_at ON agencies(created_at);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_agencies_updated_at
    BEFORE UPDATE ON agencies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();