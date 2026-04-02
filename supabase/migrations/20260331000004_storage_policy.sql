-- Enable RLS on storage.objects (already enabled by default, but ensure it)
-- Allow authenticated users to upload to their own folder in listing-images bucket
CREATE POLICY "listing_images_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'listing-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to listing images
CREATE POLICY "listing_images_select" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'listing-images');

-- Allow users to delete their own images
CREATE POLICY "listing_images_delete" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'listing-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
