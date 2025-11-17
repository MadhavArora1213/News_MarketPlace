-- Migration: Create published_works table
-- Created: 2025-11-17

CREATE TABLE IF NOT EXISTS published_works (
    id SERIAL PRIMARY KEY,
    sn VARCHAR(50) UNIQUE NOT NULL,
    publication_name VARCHAR(255) NOT NULL,
    publication_website VARCHAR(500),
    article_link VARCHAR(500) NOT NULL,
    article_year INTEGER,
    article_date DATE,
    company_name VARCHAR(255),
    person_name VARCHAR(255),
    industry VARCHAR(255),
    company_country VARCHAR(255),
    individual_country VARCHAR(255),
    description TEXT,
    tags TEXT, -- JSON string for tags
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_published_works_sn ON published_works(sn);
CREATE INDEX IF NOT EXISTS idx_published_works_publication_name ON published_works(publication_name);
CREATE INDEX IF NOT EXISTS idx_published_works_article_year ON published_works(article_year);
CREATE INDEX IF NOT EXISTS idx_published_works_company_name ON published_works(company_name);
CREATE INDEX IF NOT EXISTS idx_published_works_person_name ON published_works(person_name);
CREATE INDEX IF NOT EXISTS idx_published_works_industry ON published_works(industry);
CREATE INDEX IF NOT EXISTS idx_published_works_company_country ON published_works(company_country);
CREATE INDEX IF NOT EXISTS idx_published_works_individual_country ON published_works(individual_country);
CREATE INDEX IF NOT EXISTS idx_published_works_is_featured ON published_works(is_featured);
CREATE INDEX IF NOT EXISTS idx_published_works_is_active ON published_works(is_active);
CREATE INDEX IF NOT EXISTS idx_published_works_created_at ON published_works(created_at);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_published_works_updated_at
    BEFORE UPDATE ON published_works
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();