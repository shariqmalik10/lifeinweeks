-- ============================================================
-- Life in Weeks — Migration from existing DB
-- Run these in Supabase SQL Editor in order.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. ALTER profiles table (add columns the app needs)
--    Your existing table: id, email, full_name, timezone, preferences
--    We add: first_name, last_name, birth_date, avatar_url
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Backfill first_name/last_name from full_name for existing users
UPDATE public.profiles
SET
  first_name = split_part(full_name, ' ', 1),
  last_name  = CASE
    WHEN position(' ' in coalesce(full_name, '')) > 0
    THEN substring(full_name from position(' ' in full_name) + 1)
    ELSE null
  END
WHERE full_name IS NOT NULL
  AND first_name IS NULL;

-- ────────────────────────────────────────────────────────────
-- 2. RLS on profiles (drop-if-exists then create, safe to re-run)
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON public.profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────
-- 3. Auto-create profile on sign-up
--    (handles new OAuth users — inserts into profiles if not exists)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 4. Create user_settings table
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_settings (
  id                  uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id             uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  dark_mode           boolean DEFAULT false NOT NULL,
  email_notifications boolean DEFAULT true NOT NULL,
  lifespan_years      integer DEFAULT 90 NOT NULL
                        CHECK (lifespan_years >= 50 AND lifespan_years <= 120),
  created_at          timestamptz DEFAULT now() NOT NULL,
  updated_at          timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create settings on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_settings ON auth.users;
CREATE TRIGGER on_auth_user_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_settings();

-- Backfill settings for existing users who don't have them yet
INSERT INTO public.user_settings (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_settings)
ON CONFLICT (user_id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 5. Create tasks table
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tasks (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title       text NOT NULL
                CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  description text CHECK (char_length(description) <= 1000),
  date        date NOT NULL,
  time        time,
  priority    text NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  completed   boolean DEFAULT false NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON public.tasks (user_id, date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed ON public.tasks (user_id, completed);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 6. Create goals table
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.goals (
  id                  uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id             uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title               text NOT NULL
                        CHECK (char_length(title) >= 2 AND char_length(title) <= 100),
  description         text CHECK (char_length(description) <= 500),
  target_date         date NOT NULL,
  progress            integer DEFAULT 0 NOT NULL
                        CHECK (progress >= 0 AND progress <= 100),
  color               text NOT NULL
                        CHECK (color IN ('orange', 'blue', 'green', 'purple')),
  icon                text,
  category            text CHECK (category IN (
                        'health', 'finance', 'career', 'personal', 'skill', 'leisure'
                      )),
  target_metric       text CHECK (char_length(target_metric) <= 50),
  reminder_frequency  text DEFAULT 'none'
                        CHECK (reminder_frequency IN (
                          'none', 'daily', 'weekly', 'biweekly', 'monthly'
                        )),
  completed           boolean DEFAULT false NOT NULL,
  completed_at        timestamptz,
  created_at          timestamptz DEFAULT now() NOT NULL,
  updated_at          timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_goals_user ON public.goals (user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_completed ON public.goals (user_id, completed);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals"
  ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals"
  ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals"
  ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 7. Updated-at triggers (auto-set updated_at on UPDATE)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER set_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_goals_updated_at ON public.goals;
CREATE TRIGGER set_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ────────────────────────────────────────────────────────────
-- 8. Invite codes (optional — for gated sign-up later)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.invite_codes (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  code        text NOT NULL UNIQUE,
  used        boolean DEFAULT false NOT NULL,
  used_by     uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON public.invite_codes FOR ALL
  USING (true)
  WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- DONE. Existing tables (cards, habits, time_blocks, etc.)
-- are untouched and will continue to work as-is.
-- ────────────────────────────────────────────────────────────
