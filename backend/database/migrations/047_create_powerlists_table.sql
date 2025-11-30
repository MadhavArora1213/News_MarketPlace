-- Create powerlists table
CREATE TABLE IF NOT EXISTS powerlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    whatsapp VARCHAR(50),
    calling_number VARCHAR(50),
    telegram_username VARCHAR(100),
    direct_number VARCHAR(50),
    gender VARCHAR(20),
    date_of_birth DATE,
    dual_passport BOOLEAN DEFAULT FALSE,
    passport_nationality_one VARCHAR(100),
    passport_nationality_two VARCHAR(100),
    uae_permanent_residence BOOLEAN DEFAULT FALSE,
    other_permanent_residency BOOLEAN DEFAULT FALSE,
    other_residency_mention TEXT,
    current_company VARCHAR(255),
    position VARCHAR(255),
    linkedin_url VARCHAR(500),
    instagram_url VARCHAR(500),
    facebook_url VARCHAR(500),
    personal_website VARCHAR(500),
    company_website VARCHAR(500),
    company_industry VARCHAR(255),
    filling_on_behalf BOOLEAN DEFAULT FALSE,
    behalf_name VARCHAR(255),
    behalf_position VARCHAR(255),
    behalf_relation VARCHAR(255),
    behalf_gender VARCHAR(20),
    behalf_email VARCHAR(255),
    behalf_contact_number VARCHAR(50),
    captcha_verified BOOLEAN DEFAULT FALSE,
    agree_terms BOOLEAN NOT NULL DEFAULT FALSE,
    message TEXT,
    submitted_by INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_powerlists_email ON powerlists(email);
CREATE INDEX IF NOT EXISTS idx_powerlists_status ON powerlists(status);
CREATE INDEX IF NOT EXISTS idx_powerlists_submitted_by ON powerlists(submitted_by);
CREATE INDEX IF NOT EXISTS idx_powerlists_company_industry ON powerlists(company_industry);
CREATE INDEX IF NOT EXISTS idx_powerlists_gender ON powerlists(gender);
CREATE INDEX IF NOT EXISTS idx_powerlists_created_at ON powerlists(created_at);

-- Create powerlist_publications junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS powerlist_publications (
    id SERIAL PRIMARY KEY,
    powerlist_id INTEGER NOT NULL REFERENCES powerlists(id) ON DELETE CASCADE,
    publication_id INTEGER NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(powerlist_id, publication_id)
);

-- Create indexes for junction table
CREATE INDEX IF NOT EXISTS idx_powerlist_publications_powerlist_id ON powerlist_publications(powerlist_id);
CREATE INDEX IF NOT EXISTS idx_powerlist_publications_publication_id ON powerlist_publications(publication_id);