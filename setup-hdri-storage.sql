-- Setup Supabase Storage for HDRI files
-- Run this script in your Supabase SQL editor

-- 1. Create storage bucket for HDRI files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'hdri-files',
    'hdri-files',
    true,
    104857600, -- 100MB limit for HDRI files
    ARRAY[
        'image/x-hdr',
        'application/octet-stream',
        'image/vnd.radiance',
        'image/x-exr',
        'application/x-hdr'
    ]
) ON CONFLICT (id) DO NOTHING;

-- 2. Create storage policies for HDRI files (drop existing first to avoid conflicts)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view HDRI files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload HDRI files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage HDRI files" ON storage.objects;

-- Allow public read access to HDRI files (for customer viewing)
CREATE POLICY "Public can view HDRI files" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'hdri-files');

-- Allow authenticated users to upload HDRI files (admins will be validated separately)
CREATE POLICY "Authenticated users can upload HDRI files" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'hdri-files' 
        AND auth.role() = 'authenticated'
    );

-- Allow admins to manage HDRI files
CREATE POLICY "Admins can manage HDRI files" ON storage.objects
    FOR ALL
    USING (
        bucket_id = 'hdri-files'
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 3. Update the existing upload API configuration
-- Note: This is for documentation - the actual API changes need to be made in the code

-- 4. Create helper function to validate HDRI file extensions
CREATE OR REPLACE FUNCTION is_valid_hdri_file(filename TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN filename ~* '\.(hdr|exr|hdri|pic)$';
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to generate HDRI file path
CREATE OR REPLACE FUNCTION generate_hdri_file_path(
    product_id UUID,
    filename TEXT,
    folder TEXT DEFAULT 'products'
)
RETURNS TEXT AS $$
BEGIN
    -- Generate path: folder/product_id/hdri_timestamp_filename
    RETURN format('%s/%s/hdri_%s_%s', 
        folder, 
        product_id, 
        extract(epoch from now())::bigint,
        filename
    );
END;
$$ LANGUAGE plpgsql;

-- 6. Create view for easy HDRI file access with product information
CREATE OR REPLACE VIEW product_hdri_details AS
SELECT 
    ph.id,
    ph.product_id,
    p.name as product_name,
    p.slug as product_slug,
    ph.url,
    ph.filename,
    ph.file_size,
    ph.intensity,
    ph.is_default,
    ph.title,
    ph.description,
    ph.created_at,
    ph.updated_at,
    -- Storage object information
    so.name as storage_path,
    so.metadata as storage_metadata
FROM product_hdris ph
JOIN products p ON ph.product_id = p.id
LEFT JOIN storage.objects so ON so.name = substring(ph.url from 'hdri-files/(.*)$')
WHERE so.bucket_id = 'hdri-files' OR so.bucket_id IS NULL;

-- 7. Grant permissions for the view (views inherit RLS from underlying tables)
GRANT SELECT ON product_hdri_details TO anon, authenticated;

-- 9. Create function to clean up orphaned HDRI files
CREATE OR REPLACE FUNCTION cleanup_orphaned_hdri_files()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    file_record RECORD;
BEGIN
    -- Find storage objects that don't have corresponding database entries
    FOR file_record IN
        SELECT so.name
        FROM storage.objects so
        WHERE so.bucket_id = 'hdri-files'
        AND NOT EXISTS (
            SELECT 1 FROM product_hdris ph
            WHERE ph.url LIKE '%' || so.name
        )
    LOOP
        -- Delete the orphaned file
        DELETE FROM storage.objects 
        WHERE bucket_id = 'hdri-files' 
        AND name = file_record.name;
        
        deleted_count := deleted_count + 1;
    END LOOP;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to validate HDRI file before database insertion
CREATE OR REPLACE FUNCTION validate_hdri_upload(
    p_product_id UUID,
    p_filename TEXT,
    p_file_size INTEGER,
    p_intensity DECIMAL DEFAULT 1.0
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    product_exists BOOLEAN;
    file_valid BOOLEAN;
BEGIN
    -- Initialize result
    result := json_build_object(
        'valid', false,
        'errors', json_build_array(),
        'warnings', json_build_array()
    );
    
    -- Check if product exists and has 3D models
    SELECT EXISTS(
        SELECT 1 FROM products 
        WHERE id = p_product_id 
        AND has_3d_model = true
    ) INTO product_exists;
    
    IF NOT product_exists THEN
        result := jsonb_set(
            result::jsonb,
            '{errors}',
            (result->>'errors')::jsonb || '["Product not found or does not have 3D models"]'::jsonb
        );
        RETURN result;
    END IF;
    
    -- Validate file extension
    SELECT is_valid_hdri_file(p_filename) INTO file_valid;
    
    IF NOT file_valid THEN
        result := jsonb_set(
            result::jsonb,
            '{errors}',
            (result->>'errors')::jsonb || '["Invalid HDRI file format. Supported: .hdr, .exr, .hdri, .pic"]'::jsonb
        );
        RETURN result;
    END IF;
    
    -- Validate file size (100MB limit)
    IF p_file_size > 104857600 THEN
        result := jsonb_set(
            result::jsonb,
            '{errors}',
            (result->>'errors')::jsonb || '["File too large. Maximum size is 100MB"]'::jsonb
        );
        RETURN result;
    END IF;
    
    -- Validate intensity
    IF p_intensity < 0.0 OR p_intensity > 2.0 THEN
        result := jsonb_set(
            result::jsonb,
            '{errors}',
            (result->>'errors')::jsonb || '["Intensity must be between 0.0 and 2.0"]'::jsonb
        );
        RETURN result;
    END IF;
    
    -- Add warnings for large files
    IF p_file_size > 52428800 THEN -- 50MB
        result := jsonb_set(
            result::jsonb,
            '{warnings}',
            (result->>'warnings')::jsonb || '["Large HDRI file may impact loading performance"]'::jsonb
        );
    END IF;
    
    -- If we get here, validation passed
    result := jsonb_set(result::jsonb, '{valid}', 'true'::jsonb);
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 11. Create sample HDRI management functions for admin use

-- Get HDRI usage statistics
CREATE OR REPLACE FUNCTION get_hdri_statistics()
RETURNS JSON AS $$
BEGIN
    RETURN json_build_object(
        'total_hdris', (SELECT COUNT(*) FROM product_hdris),
        'products_with_hdri', (SELECT COUNT(*) FROM products WHERE has_hdri = true),
        'total_storage_mb', (
            SELECT ROUND(SUM(file_size)::decimal / 1048576, 2) 
            FROM product_hdris
        ),
        'default_hdris', (SELECT COUNT(*) FROM product_hdris WHERE is_default = true),
        'avg_intensity', (
            SELECT ROUND(AVG(intensity), 2) 
            FROM product_hdris
        )
    );
END;
$$ LANGUAGE plpgsql;

-- 12. Documentation and verification

-- Verify bucket creation
-- SELECT * FROM storage.buckets WHERE id = 'hdri-files';

-- Verify policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%HDRI%';

-- Test HDRI validation function
-- SELECT validate_hdri_upload('some-uuid'::uuid, 'test.hdr', 1048576, 1.0);

-- Get HDRI statistics
-- SELECT get_hdri_statistics();

COMMIT;