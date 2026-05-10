-- Storage buckets for PropGo Studio
-- studio-uploads: private bucket for raw photo and floor plan uploads (RLS per user)
-- studio-videos: public bucket for final rendered video CDN delivery

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'studio-uploads',
    'studio-uploads',
    false,
    52428800, -- 50 MB per file
    ARRAY[
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf'
    ]
  ),
  (
    'studio-videos',
    'studio-videos',
    true,
    524288000, -- 500 MB per file
    ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- RLS policies for studio-uploads (private)
CREATE POLICY "Users can upload to their own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'studio-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read their own uploads"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'studio-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own uploads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'studio-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own uploads"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'studio-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- studio-videos is public — anyone can read, only authenticated can write
CREATE POLICY "Public can read studio videos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'studio-videos');

CREATE POLICY "Authenticated users can upload studio videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'studio-videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
