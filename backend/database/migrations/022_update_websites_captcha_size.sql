-- Migration: Update captcha_response column size in websites table
-- Created: 2025-11-12

ALTER TABLE websites ALTER COLUMN captcha_response TYPE VARCHAR(2000);

-- Add comment
COMMENT ON COLUMN websites.captcha_response IS 'reCAPTCHA response token - increased to 2000 chars to accommodate larger tokens';