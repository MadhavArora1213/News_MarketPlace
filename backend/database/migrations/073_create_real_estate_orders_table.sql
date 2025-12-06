-- Create real estate orders table
CREATE TABLE IF NOT EXISTS real_estate_orders (
    id SERIAL PRIMARY KEY,
    professional_id INTEGER NOT NULL REFERENCES real_estate_professionals(id) ON DELETE CASCADE,

    -- Customer Information
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_whatsapp_country_code VARCHAR(10),
    customer_whatsapp_number VARCHAR(20) NOT NULL,
    customer_calling_country_code VARCHAR(10),
    customer_calling_number VARCHAR(20),

    -- Order Requirements
    budget_range VARCHAR(50) NOT NULL CHECK (budget_range IN ('USD 15k-25k', 'USD 26k-50k', 'USD 51k-75k', 'USD 76k-100k', 'More than 100k')),
    influencers_required VARCHAR(20) NOT NULL CHECK (influencers_required IN ('1-10', '11-25', '26-50', '51-100', 'More than 100')),
    gender_required VARCHAR(10) NOT NULL CHECK (gender_required IN ('Male', 'Female', 'Both')),
    languages_required TEXT[], -- Array of language codes/names
    min_followers INTEGER,

    -- Additional Information
    message TEXT,
    captcha_token TEXT NOT NULL,
    terms_accepted BOOLEAN NOT NULL DEFAULT false,

    -- Order Status and Workflow
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    submitted_by INTEGER REFERENCES users(id),

    -- Admin Workflow Fields
    approved_at TIMESTAMP,
    approved_by INTEGER REFERENCES admins(id),
    rejected_at TIMESTAMP,
    rejected_by INTEGER REFERENCES admins(id),
    rejection_reason TEXT,
    admin_comments TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_real_estate_orders_professional_id ON real_estate_orders(professional_id);
CREATE INDEX IF NOT EXISTS idx_real_estate_orders_status ON real_estate_orders(status);
CREATE INDEX IF NOT EXISTS idx_real_estate_orders_customer_email ON real_estate_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_real_estate_orders_submitted_by ON real_estate_orders(submitted_by);
CREATE INDEX IF NOT EXISTS idx_real_estate_orders_approved_by ON real_estate_orders(approved_by);
CREATE INDEX IF NOT EXISTS idx_real_estate_orders_rejected_by ON real_estate_orders(rejected_by);
CREATE INDEX IF NOT EXISTS idx_real_estate_orders_created_at ON real_estate_orders(created_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_real_estate_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_real_estate_orders_updated_at
    BEFORE UPDATE ON real_estate_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_real_estate_orders_updated_at();