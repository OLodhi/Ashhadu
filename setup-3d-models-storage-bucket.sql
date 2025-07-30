-- Create 3D models storage bucket for showcase 3D models
-- This sets up a separate bucket specifically for 3D model files

-- Create the 3d-models storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    '3d-models',
    '3d-models',
    true,
    52428800, -- 50MB limit
    ARRAY[
        'model/gltf-binary',      -- .glb files
        'application/octet-stream', -- .stl, .obj, .fbx, .ply (generic binary)
        'text/plain',             -- .obj, .dae (text-based)
        'model/obj',              -- .obj
        'application/x-fbx',      -- .fbx
        'model/x3d+xml',          -- .dae
        'application/x-ply'       -- .ply
    ]
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Set up RLS policies for 3d-models bucket
-- Allow public read access (for displaying 3D models)
CREATE POLICY "Public can view 3D models" ON storage.objects
    FOR SELECT
    USING (bucket_id = '3d-models');

-- Allow authenticated users to upload 3D models
CREATE POLICY "Authenticated users can upload 3D models" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = '3d-models' 
        AND auth.role() = 'authenticated'
    );

-- Allow authenticated users to update their 3D models
CREATE POLICY "Authenticated users can update 3D models" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = '3d-models' 
        AND auth.role() = 'authenticated'
    );

-- Allow authenticated users to delete their 3D models
CREATE POLICY "Authenticated users can delete 3D models" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = '3d-models' 
        AND auth.role() = 'authenticated'
    );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_storage_objects_3d_models 
ON storage.objects (bucket_id, name) 
WHERE bucket_id = '3d-models';