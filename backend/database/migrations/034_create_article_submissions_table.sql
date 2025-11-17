-- Migration: Create article_submissions table
-- Created: 2025-11-17

CREATE TABLE IF NOT EXISTS article_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    publication_id INTEGER NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    sub_title VARCHAR(255),
    by_line VARCHAR(255),
    tentative_publish_date DATE,
    article_text TEXT NOT NULL,
    image1 VARCHAR(500) NOT NULL,
    image2 VARCHAR(500),
    website_link VARCHAR(500),
    instagram_link VARCHAR(500),
    facebook_link VARCHAR(500),
    terms_agreed BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_article_submissions_user_id ON article_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_article_submissions_publication_id ON article_submissions(publication_id);
CREATE INDEX IF NOT EXISTS idx_article_submissions_status ON article_submissions(status);
CREATE INDEX IF NOT EXISTS idx_article_submissions_created_at ON article_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_article_submissions_title ON article_submissions(title);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_article_submissions_updated_at
    BEFORE UPDATE ON article_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();