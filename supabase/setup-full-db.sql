-- PERUNZ PRODUCTIONS - Full Database Setup (ROBUST VERSION)
-- Run this in Supabase SQL Editor.

-- 1. Create Tables (if they don't exist at all)
CREATE TABLE IF NOT EXISTS public.beats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    style TEXT,
    bpm INTEGER CHECK (bpm >= 60 AND bpm <= 200),
    mood TEXT,
    status TEXT CHECK (status IN ('In Progress', 'Finished', 'Ready to Send')) DEFAULT 'In Progress',
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 10),
    notes TEXT,
    is_placed BOOLEAN DEFAULT FALSE,
    mix_rating INTEGER DEFAULT 0,
    arrangement_rating INTEGER DEFAULT 0,
    dope_rating INTEGER DEFAULT 0,
    instruments_used INTEGER DEFAULT 0,
    music_key TEXT
);

CREATE TABLE IF NOT EXISTS public.loops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    style TEXT,
    bpm INTEGER,
    source TEXT CHECK (source IN ('Original', 'Sampled')),
    royalty_status TEXT CHECK (royalty_status IN ('Free', 'Copyrights')),
    status TEXT CHECK (status IN ('In Progress', 'Finished', 'Ready to Send')) DEFAULT 'In Progress',
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 10),
    notes TEXT,
    is_placed BOOLEAN DEFAULT FALSE,
    mix_rating INTEGER DEFAULT 0,
    arrangement_rating INTEGER DEFAULT 0,
    dope_rating INTEGER DEFAULT 0,
    instruments_used INTEGER DEFAULT 0,
    music_key TEXT
);

CREATE TABLE IF NOT EXISTS public.planning (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    day TEXT NOT NULL,
    task_name TEXT NOT NULL,
    focus TEXT CHECK (focus IN ('Beats', 'Loops', 'Mixing')),
    style_focus TEXT,
    planned_time NUMERIC,
    is_completed BOOLEAN DEFAULT FALSE
);

-- 2. Add 'user_id' column if it's missing (Fixes "column does not exist" error)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beats' AND column_name = 'user_id') THEN
        ALTER TABLE public.beats ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loops' AND column_name = 'user_id') THEN
        ALTER TABLE public.loops ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planning' AND column_name = 'user_id') THEN
        ALTER TABLE public.planning ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Enable Row Level Security
ALTER TABLE public.beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning ENABLE ROW LEVEL SECURITY;

-- 4. Re-create POLICIES (Users can only see their own stuff)
-- We drop them first to ensure we don't get 'policy already exists' errors

DROP POLICY IF EXISTS "Users can view their own beats" ON public.beats;
DROP POLICY IF EXISTS "Users can create their own beats" ON public.beats;
DROP POLICY IF EXISTS "Users can update their own beats" ON public.beats;
DROP POLICY IF EXISTS "Users can delete their own beats" ON public.beats;

DROP POLICY IF EXISTS "Users can view their own loops" ON public.loops;
DROP POLICY IF EXISTS "Users can create their own loops" ON public.loops;
DROP POLICY IF EXISTS "Users can update their own loops" ON public.loops;
DROP POLICY IF EXISTS "Users can delete their own loops" ON public.loops;

DROP POLICY IF EXISTS "Users can view their own planning" ON public.planning;
DROP POLICY IF EXISTS "Users can create their own planning" ON public.planning;
DROP POLICY IF EXISTS "Users can update their own planning" ON public.planning;
DROP POLICY IF EXISTS "Users can delete their own planning" ON public.planning;

CREATE POLICY "Users can view their own beats" ON public.beats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own beats" ON public.beats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own beats" ON public.beats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own beats" ON public.beats FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own loops" ON public.loops FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own loops" ON public.loops FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own loops" ON public.loops FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own loops" ON public.loops FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own planning" ON public.planning FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own planning" ON public.planning FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own planning" ON public.planning FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own planning" ON public.planning FOR DELETE USING (auth.uid() = user_id);


-- 5. Storage Bucket (Vocals)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vocals', 
  'vocals', 
  true,
  52428800, -- 50MB
  ARRAY['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/wave']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Users can upload vocals" ON storage.objects;
DROP POLICY IF EXISTS "Users can view vocals" ON storage.objects;
DROP POLICY IF EXISTS "Users can update vocals" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete vocals" ON storage.objects;

CREATE POLICY "Users can upload vocals" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vocals' AND auth.role() = 'authenticated');
CREATE POLICY "Users can view vocals" ON storage.objects FOR SELECT USING (bucket_id = 'vocals');
CREATE POLICY "Users can update vocals" ON storage.objects FOR UPDATE USING (bucket_id = 'vocals' AND auth.uid() = owner);
CREATE POLICY "Users can delete vocals" ON storage.objects FOR DELETE USING (bucket_id = 'vocals' AND auth.uid() = owner);

