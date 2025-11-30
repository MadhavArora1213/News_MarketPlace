-- Add paparazzi support to orders table
ALTER TABLE orders
ADD COLUMN paparazzi_id INT NULL AFTER publication_id,
ADD COLUMN paparazzi_name VARCHAR(255) NULL AFTER publication_name,
ADD COLUMN order_type ENUM('publication', 'paparazzi') DEFAULT 'publication' AFTER paparazzi_name,

-- Add foreign key constraint for paparazzi
ADD CONSTRAINT fk_orders_paparazzi FOREIGN KEY (paparazzi_id) REFERENCES paparazzi(id) ON DELETE CASCADE,

-- Update indexes
ADD INDEX idx_orders_paparazzi (paparazzi_id),
ADD INDEX idx_orders_type (order_type);

-- Make publication_id nullable since orders can now be for paparazzi
ALTER TABLE orders MODIFY COLUMN publication_id INT NULL;