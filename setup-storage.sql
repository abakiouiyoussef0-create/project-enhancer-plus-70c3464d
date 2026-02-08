-- 1. Create storage bucket for melodies (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'melodies', 
  'melodies', 
  true,
  52428800, -- 50MB
  ARRAY['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/wave']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Add storage policies for the melodies bucket
-- Run this in Supabase SQL Editor for project: lcxrwhdydwhihpuubirl

-- Drop policies if they exist to avoid collision errors
DROP POLICY IF EXISTS "Allow authenticated users to upload melodies" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read melodies" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update melodies" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete melodies" ON storage.objects;

-- Allow authenticated users to upload melodies
CREATE POLICY "Allow authenticated users to upload melodies"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'melodies');

-- Allow public to read melodies
CREATE POLICY "Allow public to read melodies"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'melodies');

-- Allow authenticated users to update melodies
CREATE POLICY "Allow authenticated users to update melodies"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'melodies');

-- Allow authenticated users to delete melodies
CREATE POLICY "Allow authenticated users to delete melodies"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'melodies');
