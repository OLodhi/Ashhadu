-- Add guest flag to customers table to distinguish guest checkouts from registered users
ALTER TABLE customers 
ADD COLUMN is_guest BOOLEAN DEFAULT false NOT NULL;

-- Add index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_customers_is_guest ON customers(is_guest);

-- Update existing customers to mark them as registered (not guests)
-- You can adjust this based on your business logic
UPDATE customers 
SET is_guest = false 
WHERE is_guest IS NULL;

-- Optional: Add comment for clarity
COMMENT ON COLUMN customers.is_guest IS 'True for guest checkout customers, false for registered users with accounts';