-- Add share token to generations
ALTER TABLE video.generations
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMPTZ;

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_video_generations_share_token
  ON video.generations(share_token)
  WHERE share_token IS NOT NULL;

-- Public read policy for share token lookups (anon role)
CREATE POLICY "Public can view shared generation"
  ON video.generations FOR SELECT
  USING (
    share_token IS NOT NULL
    AND share_expires_at > NOW()
  );
