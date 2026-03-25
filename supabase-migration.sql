-- ============================================================
-- Supabase Migration: User data tables + RLS + Auth trigger
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 0. Clean up any leftover tables from previous partial runs
--    (their FK constraints block the TEXT→UUID conversion below)
DROP TABLE IF EXISTS public.review;
DROP TABLE IF EXISTS public.user_word;
DROP TABLE IF EXISTS public.user_profile;

-- 1. Convert all IDs from TEXT to UUID
--    Must drop FK constraints first, then re-add after conversion.
ALTER TABLE public.word DROP CONSTRAINT IF EXISTS word_category_id_fkey;
ALTER TABLE public.word DROP CONSTRAINT IF EXISTS word_sub_category_id_fkey;
ALTER TABLE public.sub_category DROP CONSTRAINT IF EXISTS sub_category_category_id_fkey;

ALTER TABLE public.category
  ALTER COLUMN id TYPE UUID USING id::uuid;

ALTER TABLE public.sub_category
  ALTER COLUMN id TYPE UUID USING id::uuid,
  ALTER COLUMN category_id TYPE UUID USING category_id::uuid;

ALTER TABLE public.word
  ALTER COLUMN id TYPE UUID USING id::uuid,
  ALTER COLUMN category_id TYPE UUID USING category_id::uuid,
  ALTER COLUMN sub_category_id TYPE UUID USING sub_category_id::uuid;

ALTER TABLE public.sub_category
  ADD CONSTRAINT sub_category_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(id);

ALTER TABLE public.word
  ADD CONSTRAINT word_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(id),
  ADD CONSTRAINT word_sub_category_id_fkey FOREIGN KEY (sub_category_id) REFERENCES public.sub_category(id);

-- 2. user_word table (SRS progress tracking)
CREATE TABLE public.user_word (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id UUID NOT NULL REFERENCES public.word(id),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 8),
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  suspended BOOLEAN NOT NULL DEFAULT false,
  marked_as_learned BOOLEAN NOT NULL DEFAULT false,
  successful_guesses INTEGER NOT NULL DEFAULT 0,
  failed_guesses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, word_id)
);

-- 3. review table (audit log of every guess)
CREATE TABLE public.review (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES public.word(id),
  user_word_id UUID NOT NULL REFERENCES public.user_word(id) ON DELETE CASCADE,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_success BOOLEAN NOT NULL,
  guess TEXT NOT NULL DEFAULT ''
);

-- 4. user_profile table
CREATE TABLE public.user_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Auto-create user_profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profile (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Row Level Security

ALTER TABLE public.user_word ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own user_words" ON public.user_word FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own user_words" ON public.user_word FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own user_words" ON public.user_word FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.review ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reviews" ON public.review FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reviews" ON public.review FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.user_profile FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profile FOR UPDATE USING (auth.uid() = id);

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_user_word_user_id ON public.user_word(user_id);
CREATE INDEX IF NOT EXISTS idx_user_word_user_word ON public.user_word(user_id, word_id);
CREATE INDEX IF NOT EXISTS idx_user_word_due ON public.user_word(user_id, suspended, next_review_at);
CREATE INDEX IF NOT EXISTS idx_review_user_id ON public.review(user_id);
