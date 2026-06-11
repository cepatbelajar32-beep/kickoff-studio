-- ============================================
-- KICKOFF STUDIO — Supabase Schema
-- Nebeng di project BacaCepat Pro
-- Semua table pakai prefix kickoff_
-- ============================================

-- 1. Sessions: data bisnis user (input sekali)
CREATE TABLE IF NOT EXISTS kickoff_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bisnis_name TEXT NOT NULL,
  niche TEXT NOT NULL CHECK (niche IN ('cafe', 'seller', 'barber', 'distro', 'general')),
  tagline TEXT,
  kota TEXT,
  logo_url TEXT,
  wa_number TEXT,
  link_toko TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Credits: quota per user per tier
CREATE TABLE IF NOT EXISTS kickoff_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier TEXT NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'pro', 'max')),
  -- Caption: jumlah hari yang sudah di-generate
  caption_days_used INTEGER DEFAULT 0,
  caption_days_limit INTEGER DEFAULT 38,
  -- Image feed
  image_feed_used INTEGER DEFAULT 0,
  image_feed_limit INTEGER DEFAULT 0, -- 0=basic(no image), 38=pro, 76=max(2x)
  -- Image story
  image_story_used INTEGER DEFAULT 0,
  image_story_limit INTEGER DEFAULT 0, -- 0=basic/pro, 38=max
  -- Alternatif caption per hari
  caption_variants INTEGER DEFAULT 2, -- 2=basic, 3=pro, 5=max
  -- Image prompt detail
  image_prompt_detail TEXT DEFAULT 'basic' CHECK (image_prompt_detail IN ('basic', 'detail')),
  -- Logo inject
  logo_inject BOOLEAN DEFAULT FALSE,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 3. Outputs: hasil generate per hari per user
CREATE TABLE IF NOT EXISTS kickoff_outputs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  match_date DATE NOT NULL,
  match_info JSONB, -- {home, away, group, jam_wib, fase}
  captions JSONB, -- array of caption variants
  image_prompts JSONB, -- array of image prompts
  image_feed_urls JSONB, -- array of generated image URLs
  image_story_urls JSONB, -- array of generated story image URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_date)
);

-- 4. RLS Policies
ALTER TABLE kickoff_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kickoff_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE kickoff_outputs ENABLE ROW LEVEL SECURITY;

-- Sessions: user hanya bisa akses data sendiri
CREATE POLICY "Users can manage own session"
  ON kickoff_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Credits: user bisa read, hanya service role yang bisa update
CREATE POLICY "Users can read own credits"
  ON kickoff_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage credits"
  ON kickoff_credits FOR ALL
  USING (auth.role() = 'service_role');

-- Outputs: user hanya bisa akses data sendiri
CREATE POLICY "Users can manage own outputs"
  ON kickoff_outputs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Function: setup credits setelah aktivasi tier
CREATE OR REPLACE FUNCTION kickoff_activate_tier(
  p_user_id UUID,
  p_tier TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO kickoff_credits (
    user_id, tier,
    caption_days_limit, caption_variants,
    image_feed_limit, image_story_limit,
    image_prompt_detail, logo_inject
  )
  VALUES (
    p_user_id,
    p_tier,
    38, -- semua tier dapat 38 hari
    CASE p_tier WHEN 'basic' THEN 2 WHEN 'pro' THEN 3 WHEN 'max' THEN 5 END,
    CASE p_tier WHEN 'basic' THEN 0 WHEN 'pro' THEN 38 WHEN 'max' THEN 76 END,
    CASE p_tier WHEN 'max' THEN 38 ELSE 0 END,
    CASE p_tier WHEN 'basic' THEN 'basic' ELSE 'detail' END,
    CASE p_tier WHEN 'basic' THEN FALSE ELSE TRUE END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    tier = p_tier,
    caption_variants = EXCLUDED.caption_variants,
    image_feed_limit = EXCLUDED.image_feed_limit,
    image_story_limit = EXCLUDED.image_story_limit,
    image_prompt_detail = EXCLUDED.image_prompt_detail,
    logo_inject = EXCLUDED.logo_inject;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TAMBAHAN: Activation Codes & Image Storage
-- ============================================

-- Tabel kode aktivasi
CREATE TABLE IF NOT EXISTS kickoff_activation_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'pro', 'max')),
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE kickoff_activation_codes ENABLE ROW LEVEL SECURITY;

-- Hanya service role yang bisa manage kode
CREATE POLICY "Service role manages codes"
  ON kickoff_activation_codes FOR ALL
  USING (auth.role() = 'service_role');

-- User bisa read kode yang mereka pakai
CREATE POLICY "Users can read own used codes"
  ON kickoff_activation_codes FOR SELECT
  USING (used_by = auth.uid());

-- Function generate batch kode
CREATE OR REPLACE FUNCTION kickoff_generate_codes(
  p_tier TEXT,
  p_count INTEGER
)
RETURNS TABLE(generated_code TEXT) AS $$
DECLARE
  v_prefix TEXT;
  v_code TEXT;
  v_i INTEGER;
BEGIN
  v_prefix := CASE p_tier
    WHEN 'basic' THEN 'KICKBASIC-2026'
    WHEN 'pro' THEN 'KICKPRO-2026'
    WHEN 'max' THEN 'KICKMAX-2026'
  END;

  FOR v_i IN 1..p_count LOOP
    v_code := v_prefix || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    INSERT INTO kickoff_activation_codes (code, tier) VALUES (v_code, p_tier)
    ON CONFLICT (code) DO NOTHING;
    RETURN QUERY SELECT v_code;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tambah kolom regen_count ke kickoff_outputs (jalankan jika table sudah ada)
ALTER TABLE kickoff_outputs ADD COLUMN IF NOT EXISTS regen_count INTEGER DEFAULT 0;

-- Tambah kolom poster_tagline ke kickoff_sessions
ALTER TABLE kickoff_sessions ADD COLUMN IF NOT EXISTS poster_tagline TEXT;
