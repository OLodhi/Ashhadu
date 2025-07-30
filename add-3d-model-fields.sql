-- Add 3D Model Support to Database Schema
-- Run this SQL in your Supabase SQL Editor to add 3D model functionality

-- First, add 3D model fields to the products table
ALTER TABLE products 
ADD COLUMN has_3d_model BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN featured_model TEXT; -- URL of the featured 3D model

-- Create custom enum for 3D model formats
CREATE TYPE model_3d_format AS ENUM ('glb', 'stl', 'obj', 'fbx', 'dae', 'ply');

-- Create product_models table for 3D model storage
CREATE TABLE IF NOT EXISTS product_models (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_type TEXT DEFAULT '3dModel' NOT NULL,
    format model_3d_format NOT NULL,
    file_size INTEGER NOT NULL, -- Size in bytes
    featured BOOLEAN DEFAULT false NOT NULL,
    title TEXT,
    description TEXT,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    thumbnail TEXT, -- Preview image URL for the 3D model
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_models_product_id ON product_models(product_id);
CREATE INDEX IF NOT EXISTS idx_product_models_featured ON product_models(featured);
CREATE INDEX IF NOT EXISTS idx_product_models_format ON product_models(format);

-- Create updated_at trigger for product_models
CREATE OR REPLACE FUNCTION update_product_models_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_models_updated_at
    BEFORE UPDATE ON product_models
    FOR EACH ROW
    EXECUTE FUNCTION update_product_models_updated_at();

-- Update existing products trigger to handle has_3d_model flag
CREATE OR REPLACE FUNCTION update_product_3d_model_flag()
RETURNS TRIGGER AS $$
BEGIN
    -- Update has_3d_model flag based on existence of models
    UPDATE products 
    SET has_3d_model = EXISTS (
        SELECT 1 FROM product_models 
        WHERE product_models.product_id = NEW.product_id
    )
    WHERE id = NEW.product_id;
    
    -- Set featured_model if this is the featured model
    IF NEW.featured = true THEN
        UPDATE products 
        SET featured_model = NEW.url
        WHERE id = NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_models_update_product_flag
    AFTER INSERT OR UPDATE OR DELETE ON product_models
    FOR EACH ROW
    EXECUTE FUNCTION update_product_3d_model_flag();

-- Create RLS policies for product_models table
ALTER TABLE product_models ENABLE ROW LEVEL SECURITY;

-- Public can view published product models
CREATE POLICY "Public can view published product models" ON product_models
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_models.product_id 
            AND products.status = 'published'
        )
    );

-- Admins can do everything with product models
CREATE POLICY "Admins can manage product models" ON product_models
    FOR ALL
    USING (
        COALESCE(
            (auth.jwt() -> 'user_metadata' ->> 'role')::text,
            (auth.jwt() -> 'app_metadata' ->> 'role')::text
        ) = 'admin'
    );

-- Add comment to document the new fields
COMMENT ON COLUMN products.has_3d_model IS 'Boolean flag indicating if product has associated 3D models';
COMMENT ON COLUMN products.featured_model IS 'URL of the featured 3D model for this product';
COMMENT ON TABLE product_models IS 'Stores 3D model files associated with products (GLB, STL, OBJ, etc.)';
COMMENT ON COLUMN product_models.format IS 'File format of the 3D model (glb, stl, obj, fbx, dae, ply)';
COMMENT ON COLUMN product_models.file_size IS 'File size in bytes for storage management';
COMMENT ON COLUMN product_models.thumbnail IS 'Preview image URL generated from the 3D model';

-- Insert sample 3D model data for testing (optional)
-- Uncomment these lines if you want to add sample data
/*
-- Sample product with 3D model (assuming a product exists)
INSERT INTO product_models (product_id, url, filename, format, file_size, featured, title, sort_order)
SELECT 
    id as product_id,
    'https://example.com/models/sample-calligraphy.glb' as url,
    'ayat-al-kursi-model.glb' as filename,
    'glb' as format,
    2500000 as file_size, -- 2.5MB
    true as featured,
    'Ayat al-Kursi 3D Model' as title,
    0 as sort_order
FROM products 
WHERE slug = 'ayat-al-kursi-calligraphy-model' 
LIMIT 1;
*/

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('has_3d_model', 'featured_model')
ORDER BY ordinal_position;

-- Show the new product_models table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'product_models'
ORDER BY ordinal_position;