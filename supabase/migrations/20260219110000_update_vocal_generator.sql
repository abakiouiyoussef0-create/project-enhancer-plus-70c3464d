-- Update table for MusicGPT-style vocal generations
ALTER TABLE IF EXISTS sample_generations 
  ADD COLUMN IF NOT EXISTS prompt TEXT,
  ADD COLUMN IF NOT EXISTS sample_count INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS previous_sample_id TEXT,
  ADD COLUMN IF NOT EXISTS refinement_instructions TEXT,
  ADD COLUMN IF NOT EXISTS samples JSONB;

-- Remove old columns that are no longer needed
ALTER TABLE IF EXISTS sample_generations 
  DROP COLUMN IF EXISTS instrument,
  DROP COLUMN IF EXISTS genre,
  DROP COLUMN IF EXISTS source_path,
  DROP COLUMN IF EXISTS audio_url,
  DROP COLUMN IF EXISTS midi_url;

-- Update indexes
DROP INDEX IF EXISTS idx_sample_generations_status;
DROP INDEX IF EXISTS idx_sample_generations_created_at;

CREATE INDEX IF NOT EXISTS idx_sample_generations_status ON sample_generations(status);
CREATE INDEX IF NOT EXISTS idx_sample_generations_created_at ON sample_generations(created_at);
CREATE INDEX IF NOT EXISTS idx_sample_generations_prompt ON sample_generations(prompt);

-- Add storage bucket for audio samples if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio-samples', 'audio-samples', true)
ON CONFLICT (id) DO NOTHING;

-- Ensure storage policies exist
DO $$
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Anyone can view audio samples" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can upload audio samples" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can update audio samples" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can delete audio samples" ON storage.objects;
  
  -- Create new policies
  CREATE POLICY "Anyone can view audio samples" ON storage.objects
    FOR SELECT USING (bucket_id = 'audio-samples');

  CREATE POLICY "Anyone can upload audio samples" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'audio-samples');

  CREATE POLICY "Anyone can update audio samples" ON storage.objects
    FOR UPDATE USING (bucket_id = 'audio-samples');

  CREATE POLICY "Anyone can delete audio samples" ON storage.objects
    FOR DELETE USING (bucket_id = 'audio-samples');
END $$;
