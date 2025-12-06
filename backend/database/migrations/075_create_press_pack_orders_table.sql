-- Migration: Create press_pack_orders table
-- Created: 2025-12-06

CREATE TABLE IF NOT EXISTS press_pack_orders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    whatsapp_number VARCHAR(20),
    calling_number VARCHAR(20),
    press_release_selection INTEGER REFERENCES press_releases(id),
    email VARCHAR(255) NOT NULL,
    company_registration_document TEXT,
    letter_of_authorisation TEXT,
    image TEXT,
    word_pdf_document TEXT,
    submitted_by_type VARCHAR(50),
    package_selection VARCHAR(255),
    message TEXT,
    captcha_token TEXT,
    terms_accepted BOOLEAN DEFAULT FALSE,
    content_writing_assistance BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    submitted_by INTEGER REFERENCES users(id),
    submitted_by_admin INTEGER REFERENCES admins(id),
    approved_at TIMESTAMP,
    approved_by INTEGER REFERENCES admins(id),
    rejected_at TIMESTAMP,
    rejected_by INTEGER REFERENCES admins(id),
    rejection_reason TEXT,
    admin_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: Indexes will be added in a separate migration if needed

-- Note: updated_at will be manually updated in application code