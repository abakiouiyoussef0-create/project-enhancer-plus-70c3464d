
-- Create beats table
CREATE TABLE public.beats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    style TEXT,
    bpm INTEGER,
    mood TEXT,
    status TEXT DEFAULT 'In Progress',
    quality_score INTEGER,
    notes TEXT,
    is_placed BOOLEAN DEFAULT FALSE,
    mix_rating INTEGER DEFAULT 0,
    arrangement_rating INTEGER DEFAULT 0,
    dope_rating INTEGER DEFAULT 0,
    instruments_used INTEGER DEFAULT 0,
    music_key TEXT,
    user_id UUID
);

-- Create loops table
CREATE TABLE public.loops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    style TEXT,
    bpm INTEGER,
    source TEXT,
    royalty_status TEXT,
    status TEXT DEFAULT 'In Progress',
    quality_score INTEGER,
    notes TEXT,
    is_placed BOOLEAN DEFAULT FALSE,
    mix_rating INTEGER DEFAULT 0,
    arrangement_rating INTEGER DEFAULT 0,
    dope_rating INTEGER DEFAULT 0,
    instruments_used INTEGER DEFAULT 0,
    music_key TEXT,
    user_id UUID
);

-- Create planning table
CREATE TABLE public.planning (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    day TEXT NOT NULL,
    task_name TEXT NOT NULL,
    focus TEXT,
    style_focus TEXT,
    planned_time NUMERIC,
    is_completed BOOLEAN DEFAULT FALSE,
    user_id UUID
);

-- Enable RLS
ALTER TABLE public.beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning ENABLE ROW LEVEL SECURITY;

-- Beats RLS policies
CREATE POLICY "Users can view their own beats" ON public.beats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own beats" ON public.beats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own beats" ON public.beats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own beats" ON public.beats FOR DELETE USING (auth.uid() = user_id);

-- Loops RLS policies
CREATE POLICY "Users can view their own loops" ON public.loops FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own loops" ON public.loops FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own loops" ON public.loops FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own loops" ON public.loops FOR DELETE USING (auth.uid() = user_id);

-- Planning RLS policies
CREATE POLICY "Users can view their own planning" ON public.planning FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own planning" ON public.planning FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own planning" ON public.planning FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own planning" ON public.planning FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for vocals
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vocals', 
  'vocals', 
  true,
  52428800,
  ARRAY['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/wave']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Users can upload vocals" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vocals' AND auth.role() = 'authenticated');
CREATE POLICY "Users can view vocals" ON storage.objects FOR SELECT USING (bucket_id = 'vocals');
CREATE POLICY "Users can update vocals" ON storage.objects FOR UPDATE USING (bucket_id = 'vocals' AND auth.uid() = owner);
CREATE POLICY "Users can delete vocals" ON storage.objects FOR DELETE USING (bucket_id = 'vocals' AND auth.uid() = owner);
