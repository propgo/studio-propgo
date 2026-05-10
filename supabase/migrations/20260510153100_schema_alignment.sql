-- Align schema with Phase 4 code
-- Rename storage_url → storage_path, sort_order → upload_order, add photos_tagged

-- project_floor_plans: add storage_path column (code uses this name)
ALTER TABLE video.project_floor_plans
  ADD COLUMN IF NOT EXISTS storage_path TEXT;

UPDATE video.project_floor_plans
  SET storage_path = storage_url
  WHERE storage_path IS NULL;

-- project_floor_plans: expand floor_label CHECK to match code values
ALTER TABLE video.project_floor_plans
  DROP CONSTRAINT IF EXISTS project_floor_plans_floor_label_check;

ALTER TABLE video.project_floor_plans
  ADD CONSTRAINT project_floor_plans_floor_label_check
  CHECK (floor_label IN (
    'ground','first','second','third','basement','rooftop',
    'ground_floor','first_floor','second_floor','basement_floor'
  ));

-- project_photos: add storage_path + upload_order columns
ALTER TABLE video.project_photos
  ADD COLUMN IF NOT EXISTS storage_path TEXT;

UPDATE video.project_photos
  SET storage_path = storage_url
  WHERE storage_path IS NULL;

ALTER TABLE video.project_photos
  ADD COLUMN IF NOT EXISTS upload_order INT NOT NULL DEFAULT 0;

ALTER TABLE video.project_photos
  ADD COLUMN IF NOT EXISTS ai_suggested_tag TEXT;

-- projects: add photos_tagged flag
ALTER TABLE video.projects
  ADD COLUMN IF NOT EXISTS photos_tagged BOOLEAN NOT NULL DEFAULT false;

-- projects: add thumbnail_url column for project cards
ALTER TABLE video.projects
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
