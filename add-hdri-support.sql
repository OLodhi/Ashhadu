-- Add HDRI support to 3D models system
-- Run this script to add HDRI fields to existing tables

-- 1. Add HDRI fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS has_hdri BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS default_hdri_url TEXT,
ADD COLUMN IF NOT EXISTS default_hdri_intensity DECIMAL(3,1) DEFAULT 1.0 CHECK (default_hdri_intensity >= 0.0 AND default_hdri_intensity <= 2.0);

-- 2. Create product_hdris table for HDRI management
CREATE TABLE IF NOT EXISTS product_hdris (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size > 0),
    intensity DECIMAL(3,1) DEFAULT 1.0 CHECK (intensity >= 0.0 AND intensity <= 2.0),
    is_default BOOLEAN DEFAULT false NOT NULL,
    title TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_hdris_product_id ON product_hdris(product_id);
CREATE INDEX IF NOT EXISTS idx_product_hdris_is_default ON product_hdris(product_id, is_default) WHERE is_default = true;

-- 4. Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_product_hdris_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_hdris_updated_at
    BEFORE UPDATE ON product_hdris
    FOR EACH ROW
    EXECUTE FUNCTION update_product_hdris_updated_at();

-- 5. Add constraint to ensure only one default HDRI per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_hdris_unique_default 
ON product_hdris(product_id) 
WHERE is_default = true;

-- 6. Create RLS policies for product_hdris table
ALTER TABLE product_hdris ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view product HDRIs" ON product_hdris;
DROP POLICY IF EXISTS "Admins can manage product HDRIs" ON product_hdris;

-- Allow public read access for customer viewing
CREATE POLICY "Public can view product HDRIs" ON product_hdris
    FOR SELECT
    USING (true);

-- Allow admins to manage HDRIs
CREATE POLICY "Admins can manage product HDRIs" ON product_hdris
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 7. Add comments for documentation
COMMENT ON TABLE product_hdris IS 'HDRI environment maps for 3D model products';
COMMENT ON COLUMN product_hdris.product_id IS 'Reference to the product this HDRI belongs to';
COMMENT ON COLUMN product_hdris.url IS 'Storage URL for the HDRI file';
COMMENT ON COLUMN product_hdris.filename IS 'Original filename of the HDRI file';
COMMENT ON COLUMN product_hdris.file_size IS 'File size in bytes';
COMMENT ON COLUMN product_hdris.intensity IS 'Environment intensity (0.0 to 2.0)';
COMMENT ON COLUMN product_hdris.is_default IS 'Whether this is the default HDRI for the product';

-- 8. Insert sample HDRI data (optional - for testing)
-- You can remove this section if you don't want sample data
/*
INSERT INTO product_hdris (product_id, url, filename, file_size, intensity, is_default, title, description)
SELECT 
    p.id,
    'https://example.com/hdri/studio.hdr',
    'studio.hdr',
    2048576, -- 2MB
    1.0,
    true,
    'Studio HDRI',
    'Professional studio lighting environment'
FROM products p
WHERE p.has_3d_model = true
LIMIT 3; -- Add to first 3 products with 3D models
*/

-- 9. Update products table to mark which products have HDRI
-- This will be updated automatically when HDRIs are added through the admin interface
UPDATE products 
SET has_hdri = true 
WHERE id IN (
    SELECT DISTINCT product_id 
    FROM product_hdris
);

-- 10. Create function to automatically update has_hdri flag
CREATE OR REPLACE FUNCTION update_product_has_hdri()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the product's has_hdri flag
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE products 
        SET has_hdri = true
        WHERE id = NEW.product_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Check if this was the last HDRI for the product
        IF NOT EXISTS (
            SELECT 1 FROM product_hdris 
            WHERE product_id = OLD.product_id 
            AND id != OLD.id
        ) THEN
            UPDATE products 
            SET has_hdri = false, 
                default_hdri_url = NULL, 
                default_hdri_intensity = 1.0
            WHERE id = OLD.product_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic has_hdri flag management
CREATE TRIGGER trigger_update_product_has_hdri_insert
    AFTER INSERT ON product_hdris
    FOR EACH ROW
    EXECUTE FUNCTION update_product_has_hdri();

CREATE TRIGGER trigger_update_product_has_hdri_update
    AFTER UPDATE ON product_hdris
    FOR EACH ROW
    EXECUTE FUNCTION update_product_has_hdri();

CREATE TRIGGER trigger_update_product_has_hdri_delete
    AFTER DELETE ON product_hdris
    FOR EACH ROW
    EXECUTE FUNCTION update_product_has_hdri();

-- 11. Create function to sync default HDRI URL to products table
CREATE OR REPLACE FUNCTION sync_default_hdri_to_product()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- If this HDRI is set as default, update the product
        IF NEW.is_default = true THEN
            -- Unset any existing default HDRIs for this product
            UPDATE product_hdris 
            SET is_default = false 
            WHERE product_id = NEW.product_id 
            AND id != NEW.id;
            
            -- Update the product's default HDRI info
            UPDATE products 
            SET default_hdri_url = NEW.url,
                default_hdri_intensity = NEW.intensity
            WHERE id = NEW.product_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- If the deleted HDRI was the default, clear the product's default
        IF OLD.is_default = true THEN
            UPDATE products 
            SET default_hdri_url = NULL,
                default_hdri_intensity = 1.0
            WHERE id = OLD.product_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for default HDRI synchronization
CREATE TRIGGER trigger_sync_default_hdri_to_product
    AFTER INSERT OR UPDATE OR DELETE ON product_hdris
    FOR EACH ROW
    EXECUTE FUNCTION sync_default_hdri_to_product();

-- 12. Verification queries (run these to check the setup)
-- Check if tables were created successfully:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('product_hdris');

-- Check if columns were added:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' AND column_name IN ('has_hdri', 'default_hdri_url', 'default_hdri_intensity');

-- Check RLS policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = 'product_hdris';

COMMIT;