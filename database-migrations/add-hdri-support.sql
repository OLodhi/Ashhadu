-- Migration: Add HDRI Support to Products Table
-- Description: Adds HDRI environment lighting support with background blur controls
-- Date: 2025-01-26

-- Add HDRI-related columns to the products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS hdri_files JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS default_hdri TEXT,
ADD COLUMN IF NOT EXISTS background_blur INTEGER DEFAULT 0 CHECK (background_blur >= 0 AND background_blur <= 10);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_default_hdri ON products(default_hdri);
CREATE INDEX IF NOT EXISTS idx_products_background_blur ON products(background_blur);

-- Create HDRI files table for more structured storage (optional - can be used instead of JSONB)
CREATE TABLE IF NOT EXISTS product_hdri_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    intensity DECIMAL(3,1) DEFAULT 1.0 CHECK (intensity >= 0.1 AND intensity <= 2.0),
    is_default BOOLEAN DEFAULT FALSE,
    title TEXT,
    description TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for product_hdri_files table
CREATE INDEX IF NOT EXISTS idx_product_hdri_files_product_id ON product_hdri_files(product_id);
CREATE INDEX IF NOT EXISTS idx_product_hdri_files_is_default ON product_hdri_files(is_default);
CREATE INDEX IF NOT EXISTS idx_product_hdri_files_uploaded_at ON product_hdri_files(uploaded_at);

-- Add constraint to ensure only one default HDRI per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_hdri_files_unique_default 
ON product_hdri_files(product_id) 
WHERE is_default = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN products.hdri_files IS 'JSONB array of HDRI environment files for 3D model lighting';
COMMENT ON COLUMN products.default_hdri IS 'ID of the default HDRI file to use for 3D model lighting';
COMMENT ON COLUMN products.background_blur IS 'Background blur intensity (0-10 scale) for HDRI environments';

COMMENT ON TABLE product_hdri_files IS 'Structured storage for HDRI environment files used in 3D model lighting';
COMMENT ON COLUMN product_hdri_files.intensity IS 'Light intensity multiplier (0.1-2.0) for the HDRI environment';
COMMENT ON COLUMN product_hdri_files.is_default IS 'Whether this HDRI is the default environment for the product';

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for product_hdri_files table
DROP TRIGGER IF EXISTS update_product_hdri_files_updated_at ON product_hdri_files;
CREATE TRIGGER update_product_hdri_files_updated_at
    BEFORE UPDATE ON product_hdri_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- INSERT INTO product_hdri_files (product_id, url, filename, file_size, intensity, is_default, title)
-- VALUES 
-- ('example-product-id', 'https://example.com/studio.hdr', 'studio_lighting.hdr', 52428800, 1.2, true, 'Studio Lighting'),
-- ('example-product-id', 'https://example.com/outdoor.hdr', 'outdoor_environment.hdr', 73728000, 0.8, false, 'Outdoor Environment');

-- Rollback script (commented out)
/*
-- To rollback this migration:
DROP TABLE IF EXISTS product_hdri_files;
DROP INDEX IF EXISTS idx_products_default_hdri;
DROP INDEX IF EXISTS idx_products_background_blur;
ALTER TABLE products 
DROP COLUMN IF EXISTS hdri_files,
DROP COLUMN IF EXISTS default_hdri,
DROP COLUMN IF EXISTS background_blur;
DROP FUNCTION IF EXISTS update_updated_at_column();
*/