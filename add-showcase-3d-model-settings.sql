-- Add showcase 3D model settings to site_settings table
-- This allows admins to upload and configure a 3D model for homepage showcase

-- Insert showcase 3D model settings
INSERT INTO site_settings (key, value, category, label, description, type) VALUES
(
    'showcase_3d_model_enabled',
    'false',
    'showcase',
    'Enable Showcase 3D Model',
    'Enable the 3D model showcase on the homepage',
    'boolean'
),
(
    'showcase_3d_model_url',
    '""',
    'showcase',
    'Showcase 3D Model File',
    'URL of the 3D model file to display on homepage',
    'string'
),
(
    'showcase_3d_model_format',
    '"glb"',
    'showcase',
    'Showcase 3D Model Format',
    'File format of the showcase 3D model (glb, stl, obj, ply)',
    'string'
),
(
    'showcase_3d_rotation_speed',
    '1.0',
    'showcase',
    'Rotation Speed',
    'Speed of automatic rotation (0.5 = slow, 1.0 = normal, 2.0 = fast)',
    'number'
),
(
    'showcase_3d_title',
    '"Featured Islamic Art"',
    'showcase',
    'Showcase Title',
    'Title to display above the 3D model showcase',
    'string'
),
(
    'showcase_3d_description',
    '"Experience our artisanal Islamic art in interactive 3D"',
    'showcase',
    'Showcase Description',
    'Description text to display below the showcase title',
    'string'
)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    category = EXCLUDED.category,
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    updated_at = NOW();

-- Create index for faster lookups of showcase settings
CREATE INDEX IF NOT EXISTS idx_site_settings_showcase 
ON site_settings (category) 
WHERE category = 'showcase';