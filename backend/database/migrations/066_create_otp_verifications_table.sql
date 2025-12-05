-- Create OTP verifications table for persistent OTP storage
-- This replaces the in-memory storage that was lost on server restarts

CREATE TABLE IF NOT EXISTS otp_verifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    otp_code VARCHAR(10) NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups by email
CREATE INDEX IF NOT EXISTS idx_otp_verifications_email ON otp_verifications(email);

-- Create index for cleanup of expired OTPs
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expiry ON otp_verifications(expiry_time);

-- Add comment to table
COMMENT ON TABLE otp_verifications IS 'Stores OTP codes for email verification with expiry times';
COMMENT ON COLUMN otp_verifications.email IS 'Email address for OTP verification';
COMMENT ON COLUMN otp_verifications.otp_code IS 'The OTP code sent to the user';
COMMENT ON COLUMN otp_verifications.expiry_time IS 'When the OTP expires';
COMMENT ON COLUMN otp_verifications.created_at IS 'When the OTP was created';