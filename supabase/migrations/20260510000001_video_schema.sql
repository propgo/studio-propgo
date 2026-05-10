-- PropGo Studio: video.* schema
-- All tables scoped to video schema, sharing auth.users from PropGo

CREATE SCHEMA IF NOT EXISTS video;

-- User profiles (Studio-specific extension of auth.users)
CREATE TABLE IF NOT EXISTS video.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_kit JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Credit wallets
CREATE TABLE IF NOT EXISTS video.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_credits INT NOT NULL DEFAULT 0,
  topup_credits INT NOT NULL DEFAULT 0,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'agency')),
  billing_cycle_start DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Stripe subscriptions
CREATE TABLE IF NOT EXISTS video.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Projects (one property = one project)
CREATE TABLE IF NOT EXISTS video.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  propgo_listing_id UUID,
  title TEXT NOT NULL,
  address TEXT,
  state TEXT,
  city TEXT,
  property_type TEXT CHECK (property_type IN ('apartment','condo','terrace','semi_d','bungalow','commercial','land')),
  floors INT,
  bedrooms INT,
  bathrooms INT,
  built_up_sqft INT,
  land_sqft INT,
  furnishing TEXT CHECK (furnishing IN ('fully','partially','unfurnished')),
  tenure TEXT CHECK (tenure IN ('freehold','leasehold')),
  key_features TEXT[] DEFAULT '{}',
  price NUMERIC,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','storyboard_ready','generating','complete')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Floor plans (separate from photos)
CREATE TABLE IF NOT EXISTS video.project_floor_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES video.projects(id) ON DELETE CASCADE,
  storage_url TEXT NOT NULL,
  floor_label TEXT NOT NULL DEFAULT 'ground_floor' CHECK (floor_label IN ('ground_floor','first_floor','second_floor','basement','rooftop')),
  sort_order INT NOT NULL DEFAULT 0,
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  include_in_video BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Property photos with room tags
CREATE TABLE IF NOT EXISTS video.project_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES video.projects(id) ON DELETE CASCADE,
  storage_url TEXT NOT NULL,
  photo_type TEXT NOT NULL DEFAULT 'interior' CHECK (photo_type IN ('exterior','interior','amenity')),
  scene_tag TEXT NOT NULL DEFAULT 'other',
  ai_suggested_tag TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI-generated storyboards
CREATE TABLE IF NOT EXISTS video.storyboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES video.projects(id) ON DELETE CASCADE,
  scenes JSONB NOT NULL DEFAULT '[]'::jsonb,
  version INT NOT NULL DEFAULT 1,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, version)
);

-- Generation jobs
CREATE TABLE IF NOT EXISTS video.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES video.projects(id) ON DELETE CASCADE,
  storyboard_id UUID REFERENCES video.storyboards(id),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL CHECK (model IN ('kling-2.6','seedance-2.0','runway-gen4','veo-3')),
  aspect_ratio TEXT NOT NULL DEFAULT '16:9' CHECK (aspect_ratio IN ('9:16','16:9','1:1','4:3')),
  quality TEXT NOT NULL DEFAULT '720p' CHECK (quality IN ('720p','1080p')),
  music_track TEXT,
  credits_used INT NOT NULL DEFAULT 0,
  voiceover_script JSONB DEFAULT '[]'::jsonb,
  voice_style TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','tagging','generating','rendering','complete','failed')),
  fal_job_id TEXT,
  trigger_run_id TEXT,
  output_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Credit transactions ledger
CREATE TABLE IF NOT EXISTS video.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('subscription_grant','topup','generation_consume','refund')),
  amount INT NOT NULL,
  generation_id UUID REFERENCES video.generations(id),
  stripe_payment_intent_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_video_projects_user_id ON video.projects(user_id);
CREATE INDEX idx_video_projects_status ON video.projects(status);
CREATE INDEX idx_video_photos_project_id ON video.project_photos(project_id);
CREATE INDEX idx_video_floor_plans_project_id ON video.project_floor_plans(project_id);
CREATE INDEX idx_video_storyboards_project_id ON video.storyboards(project_id);
CREATE INDEX idx_video_generations_user_id ON video.generations(user_id);
CREATE INDEX idx_video_generations_project_id ON video.generations(project_id);
CREATE INDEX idx_video_generations_status ON video.generations(status);
CREATE INDEX idx_video_credit_tx_user_id ON video.credit_transactions(user_id);
CREATE INDEX idx_video_wallets_user_id ON video.wallets(user_id);

-- Row Level Security
ALTER TABLE video.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE video.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE video.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE video.project_floor_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE video.project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video.storyboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE video.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE video.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users manage own profile" ON video.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users view own wallet" ON video.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages wallets" ON video.wallets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Users view own subscription" ON video.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages subscriptions" ON video.subscriptions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Users manage own projects" ON video.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own floor plans" ON video.project_floor_plans FOR ALL USING (
  auth.uid() = (SELECT user_id FROM video.projects WHERE id = project_id)
);
CREATE POLICY "Users manage own photos" ON video.project_photos FOR ALL USING (
  auth.uid() = (SELECT user_id FROM video.projects WHERE id = project_id)
);
CREATE POLICY "Users manage own storyboards" ON video.storyboards FOR ALL USING (
  auth.uid() = (SELECT user_id FROM video.projects WHERE id = project_id)
);
CREATE POLICY "Users manage own generations" ON video.generations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role manages generations" ON video.generations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Users view own transactions" ON video.credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages transactions" ON video.credit_transactions FOR ALL USING (auth.role() = 'service_role');

-- Auto-create profile and wallet on user signup
CREATE OR REPLACE FUNCTION video.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO video.profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO video.wallets (user_id, monthly_credits, plan)
    VALUES (NEW.id, 20, 'free') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created_studio
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE video.handle_new_user();
