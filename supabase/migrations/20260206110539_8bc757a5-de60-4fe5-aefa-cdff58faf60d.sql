-- 1. Create the Beats Table
CREATE TABLE public.beats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    style TEXT,
    bpm INTEGER CHECK (bpm >= 60 AND bpm <= 200),
    mood TEXT,
    status TEXT CHECK (status IN ('In Progress', 'Finished', 'Ready to Send')) DEFAULT 'In Progress',
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 10),
    notes TEXT,
    is_placed BOOLEAN DEFAULT FALSE
);

-- 2. Create the Loops Table
CREATE TABLE public.loops (
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
    is_placed BOOLEAN DEFAULT FALSE
);

-- 3. Create the Planning Table
CREATE TABLE public.planning (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    day TEXT NOT NULL,
    task_name TEXT NOT NULL,
    focus TEXT CHECK (focus IN ('Beats', 'Loops', 'Mixing')),
    style_focus TEXT,
    planned_time NUMERIC,
    is_completed BOOLEAN DEFAULT FALSE
);

-- 4. Enable Row Level Security
ALTER TABLE public.beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Allow all access for now - public app without auth)
CREATE POLICY "Enable all access for beats" ON public.beats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for loops" ON public.loops FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for planning" ON public.planning FOR ALL USING (true) WITH CHECK (true);

-- 6. Insert Sample Data
INSERT INTO public.beats (title, style, bpm, mood, status, quality_score, is_placed) VALUES
('Thunder Strike', 'Trap', 140, 'Aggressive', 'Finished', 9, FALSE),
('Night Vision', 'Drill', 142, 'Dark', 'Ready to Send', 10, FALSE),
('Ocean Waves', 'Lo-Fi', 85, 'Chill', 'In Progress', 6, FALSE);

INSERT INTO public.loops (title, style, bpm, source, royalty_status, status, quality_score) VALUES
('Guitar Riff A', 'Rock', 120, 'Original', 'Free', 'Ready to Send', 8),
('Vocal Chop 1', 'Pop', 100, 'Sampled', 'Copyrights', 'Finished', 7);

INSERT INTO public.planning (day, task_name, focus, planned_time, is_completed) VALUES
('Monday', 'Cook up 5 Dark melodies', 'Loops', 2, TRUE),
('Monday', 'Mix the Thunder beat', 'Mixing', 1, FALSE);