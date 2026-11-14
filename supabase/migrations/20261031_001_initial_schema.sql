-- ============================================================
-- CareerPilot AI – Complete Consolidated Schema
-- Authoritative Schema & Security Policies
-- ============================================================

-- ──────────────────────────────────────────────
-- EXTENSIONS
-- ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Fuzzy search on job titles / companies
CREATE EXTENSION IF NOT EXISTS "unaccent";      -- Accent-insensitive search

-- ──────────────────────────────────────────────
-- HELPER: auto-update updated_at column
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE 1: users
-- Mirrors auth.users — single source of truth for app identity
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT        NOT NULL UNIQUE,
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT        NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  last_sign_in  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: users updated_at
DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-insert into public.users and update profile metadata on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_city TEXT;
  v_user_type TEXT;
  v_headline TEXT;
BEGIN
  v_city := NEW.raw_user_meta_data->>'city';
  v_user_type := NEW.raw_user_meta_data->>'user_type';

  IF v_user_type = 'job_seeker' THEN
    v_headline := 'Job Seeker';
  ELSIF v_user_type = 'career_switcher' THEN
    v_headline := 'Career Switcher';
  ELSIF v_user_type = 'student_grad' THEN
    v_headline := 'Recent Graduate / Student';
  ELSIF v_user_type = 'freelancer' THEN
    v_headline := 'Freelancer / Consultant';
  END IF;

  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);

  UPDATE public.profiles
  SET 
    location = COALESCE(v_city, location),
    headline = COALESCE(v_headline, headline)
  WHERE user_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLE 2: profiles
-- Extended professional & academic info (1-to-1 with users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  headline            TEXT,
  bio                 TEXT,
  country             TEXT        DEFAULT 'India',
  state               TEXT,
  city                TEXT,
  location            TEXT,
  phone               TEXT,
  website_url         TEXT,
  linkedin_url        TEXT,
  github_url          TEXT,
  portfolio_url       TEXT,
  college_name        TEXT,
  degree              TEXT,
  field_of_study      TEXT,
  cgpa                TEXT,
  passing_year        SMALLINT,
  years_experience    SMALLINT    CHECK (years_experience >= 0),
  skills              TEXT[]      NOT NULL DEFAULT '{}',
  desired_roles       TEXT[]      NOT NULL DEFAULT '{}',
  desired_locations   TEXT[]      NOT NULL DEFAULT '{}',
  desired_salary_min  INTEGER     CHECK (desired_salary_min >= 0),
  desired_salary_max  INTEGER     CHECK (desired_salary_max >= 0),
  open_to_work        BOOLEAN     NOT NULL DEFAULT TRUE,
  profile_complete    SMALLINT    NOT NULL DEFAULT 0 CHECK (profile_complete BETWEEN 0 AND 100),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT salary_range_valid CHECK (
    desired_salary_max IS NULL OR desired_salary_min IS NULL OR
    desired_salary_max >= desired_salary_min
  )
);

-- Trigger: profiles updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create a blank profile when user row is inserted
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_create_profile ON public.users;
CREATE TRIGGER on_user_created_create_profile
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- ============================================================
-- TABLE 3: resumes
-- Uploaded resumes with AI parsing and ATS scoring
-- ============================================================
CREATE TABLE IF NOT EXISTS public.resumes (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title         TEXT        NOT NULL DEFAULT 'My Resume',
  content       TEXT,
  file_url      TEXT,
  file_name     TEXT,
  file_size     INTEGER     CHECK (file_size > 0),
  mime_type     TEXT,
  is_primary    BOOLEAN     NOT NULL DEFAULT FALSE,
  ai_score      SMALLINT    CHECK (ai_score BETWEEN 0 AND 100),
  ai_feedback   JSONB,
  ai_keywords   TEXT[]      NOT NULL DEFAULT '{}',
  ai_analyzed_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS resumes_updated_at ON public.resumes;
CREATE TRIGGER resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE UNIQUE INDEX IF NOT EXISTS idx_resumes_one_primary_per_user
  ON public.resumes(user_id)
  WHERE is_primary = TRUE;

CREATE INDEX IF NOT EXISTS idx_resumes_user_id   ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_ai_score  ON public.resumes(ai_score DESC);

-- ============================================================
-- TABLE 4: jobs
-- Multi-source aggregated opportunities
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.job_type_enum AS ENUM ('full-time','part-time','contract','internship','freelance');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.experience_level_enum AS ENUM ('entry','mid','senior','lead','executive');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.jobs (
  id               UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT                        NOT NULL,
  company          TEXT                        NOT NULL,
  company_logo_url TEXT,
  location         TEXT,
  is_remote        BOOLEAN                     NOT NULL DEFAULT FALSE,
  description      TEXT,
  requirements     TEXT,
  benefits         TEXT,
  salary_min       INTEGER                     CHECK (salary_min >= 0),
  salary_max       INTEGER                     CHECK (salary_max >= 0),
  salary_currency  TEXT                        NOT NULL DEFAULT 'INR',
  job_type         public.job_type_enum,
  experience_level public.experience_level_enum,
  skills_required  TEXT[]                      NOT NULL DEFAULT '{}',
  source           TEXT,
  source_url       TEXT,
  source_job_id    TEXT,
  posted_at        TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,
  is_active        BOOLEAN                     NOT NULL DEFAULT TRUE,
  views_count      INTEGER                     NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
  CONSTRAINT jobs_salary_range_valid CHECK (
    salary_max IS NULL OR salary_min IS NULL OR salary_max >= salary_min
  ),
  CONSTRAINT source_dedup UNIQUE (source, source_job_id)
);

CREATE INDEX IF NOT EXISTS idx_jobs_title_trgm     ON public.jobs USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_jobs_company_trgm   ON public.jobs USING GIN (company gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active      ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type       ON public.jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_exp_level      ON public.jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at      ON public.jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_skills         ON public.jobs USING GIN (skills_required);

-- ============================================================
-- TABLE 5: applications
-- User job applications with status tracking
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.application_status_enum AS ENUM (
    'saved','applied','screening','interview','offer','rejected','withdrawn'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.applications (
  id                  UUID                            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID                            NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_id              UUID                            NOT NULL REFERENCES public.jobs(id)  ON DELETE CASCADE,
  resume_id           UUID                            REFERENCES public.resumes(id) ON DELETE SET NULL,
  status              public.application_status_enum  NOT NULL DEFAULT 'saved',
  cover_letter        TEXT,
  notes               TEXT,
  ai_match_score      SMALLINT                        CHECK (ai_match_score BETWEEN 0 AND 100),
  ai_match_reasons    JSONB,
  applied_at          TIMESTAMPTZ,
  interview_at        TIMESTAMPTZ,
  offer_received_at   TIMESTAMPTZ,
  last_activity_at    TIMESTAMPTZ                     NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ                     NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ                     NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, job_id)
);

CREATE OR REPLACE FUNCTION public.handle_application_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at       = NOW();
  NEW.last_activity_at = NOW();
  IF NEW.status = 'applied' AND OLD.status != 'applied' THEN
    NEW.applied_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS applications_updated_at ON public.applications;
CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_application_updated();

CREATE INDEX IF NOT EXISTS idx_applications_user_id   ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id    ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status    ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_activity  ON public.applications(last_activity_at DESC);

-- ============================================================
-- TABLE 6: notifications
-- In-app notifications for users
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.notification_type_enum AS ENUM (
    'job_match','application_update','resume_feedback',
    'interview_reminder','offer_received','system'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID                            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID                            NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type       public.notification_type_enum   NOT NULL,
  title      TEXT                            NOT NULL,
  message    TEXT                            NOT NULL,
  data       JSONB,
  action_url TEXT,
  is_read    BOOLEAN                         NOT NULL DEFAULT FALSE,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ                     NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_notification_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
    NEW.read_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notifications_read_at ON public.notifications;
CREATE TRIGGER notifications_read_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.handle_notification_read();

CREATE INDEX IF NOT EXISTS idx_notifications_user_id  ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread   ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created  ON public.notifications(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ── users ──
DROP POLICY IF EXISTS "Users can view own row" ON public.users;
CREATE POLICY "Users can view own row"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own row" ON public.users;
CREATE POLICY "Users can update own row"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── profiles ──
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── resumes ──
DROP POLICY IF EXISTS "Users can manage own resumes" ON public.resumes;
CREATE POLICY "Users can manage own resumes"
  ON public.resumes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── jobs ──
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
CREATE POLICY "Anyone can view active jobs"
  ON public.jobs FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage jobs" ON public.jobs;
CREATE POLICY "Admins can manage jobs"
  ON public.jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Allow public insert and update on jobs" ON public.jobs;
CREATE POLICY "Allow public insert and update on jobs"
  ON public.jobs FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── applications ──
DROP POLICY IF EXISTS "Users can manage own applications" ON public.applications;
CREATE POLICY "Users can manage own applications"
  ON public.applications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── notifications ──
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (TRUE);

-- ============================================================
-- STORAGE: resumes bucket & security policies
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view resumes" ON storage.objects;
CREATE POLICY "Public can view resumes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes');

DROP POLICY IF EXISTS "Users can upload own resume" ON storage.objects;
CREATE POLICY "Users can upload own resume"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update own resume" ON storage.objects;
CREATE POLICY "Users can update own resume"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own resume" ON storage.objects;
CREATE POLICY "Users can delete own resume"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
