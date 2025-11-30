-- Create paparazzi_orders table
CREATE TABLE IF NOT EXISTS paparazzi_orders (
    id SERIAL PRIMARY KEY,
    paparazzi_id INTEGER NOT NULL,
    paparazzi_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    admin_notes TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraint
    CONSTRAINT fk_paparazzi_orders_paparazzi_id
        FOREIGN KEY (paparazzi_id) REFERENCES paparazzi(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_paparazzi_orders_paparazzi_id ON paparazzi_orders(paparazzi_id);
CREATE INDEX IF NOT EXISTS idx_paparazzi_orders_status ON paparazzi_orders(status);
CREATE INDEX IF NOT EXISTS idx_paparazzi_orders_customer_email ON paparazzi_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_paparazzi_orders_order_date ON paparazzi_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_paparazzi_orders_created_at ON paparazzi_orders(created_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_paparazzi_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_paparazzi_orders_updated_at
    BEFORE UPDATE ON paparazzi_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_paparazzi_orders_updated_at();

-- Add comment to table
COMMENT ON TABLE paparazzi_orders IS 'Table for storing paparazzi call booking orders from users';