-- Quick fix: Add missing background_blur column to products table
-- This adds just the background_blur column that's needed for HDRI controls

-- Add background_blur column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS background_blur INTEGER DEFAULT 0 CHECK (background_blur >= 0 AND background_blur <= 10);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_background_blur ON products(background_blur);

-- Add comment for documentation
COMMENT ON COLUMN products.background_blur IS 'Background blur intensity (0-10 scale) for HDRI environments';

-- Verify the column was added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'background_blur';