-- Add order_number field to orders table
-- Run this in Supabase SQL Editor

ALTER TABLE orders 
ADD COLUMN order_number TEXT UNIQUE;

-- Create index for fast lookups
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- Update existing orders to have order numbers based on their IDs
UPDATE orders 
SET order_number = 'ASH-' || UPPER(SUBSTRING(id::text, -6))
WHERE order_number IS NULL;

-- Make the field required for new orders
ALTER TABLE orders 
ALTER COLUMN order_number SET NOT NULL;