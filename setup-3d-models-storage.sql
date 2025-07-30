-- Setup 3D Models Storage Bucket in Supabase
-- Run this SQL in your Supabase SQL Editor to create the 3d-models storage bucket

-- Create 3D models storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('3d-models', '3d-models', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for 3d-models bucket

-- Anyone can view 3D models (for public product viewing)
CREATE POLICY "Anyone can view 3d models" ON storage.objects 
FOR SELECT 
USING (bucket_id = '3d-models');

-- Authenticated users (admins) can upload 3D models
CREATE POLICY "Admins can upload 3d models" ON storage.objects 
FOR INSERT 
WITH CHECK (
    bucket_id = '3d-models' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Admins can update 3D models
CREATE POLICY "Admins can update 3d models" ON storage.objects 
FOR UPDATE 
USING (
    bucket_id = '3d-models' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Admins can delete 3D models
CREATE POLICY "Admins can delete 3d models" ON storage.objects 
FOR DELETE 
USING (
    bucket_id = '3d-models' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = '3d-models';