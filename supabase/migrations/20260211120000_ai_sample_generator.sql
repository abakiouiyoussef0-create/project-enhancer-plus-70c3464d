-- Create table for tracking AI sample generations
CREATE TABLE IF NOT EXISTS sample_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'processing',
  instrument TEXT,
  genre TEXT,
  bpm INTEGER,
  key TEXT,
  scale TEXT,
  source_path TEXT,
  audio_url TEXT,
  midi_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sample_generations_status ON sample_generations(status);
CREATE INDEX IF NOT EXISTS idx_sample_generations_created_at ON sample_generations(created_at);

-- Add storage bucket for audio samples
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio-samples', 'audio-samples', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Anyone can view audio samples" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio-samples');

CREATE POLICY "Anyone can upload audio samples" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'audio-samples');

CREATE POLICY "Anyone can update audio samples" ON storage.objects
  FOR UPDATE USING (bucket_id = 'audio-samples');

CREATE POLICY "Anyone can delete audio samples" ON storage.objects
  FOR DELETE USING (bucket_id = 'audio-samples');
