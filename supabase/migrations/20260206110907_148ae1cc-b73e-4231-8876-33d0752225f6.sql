-- Add user_id column to all tables for user-specific data
ALTER TABLE public.beats ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.loops ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.planning ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Enable all access for beats" ON public.beats;
DROP POLICY IF EXISTS "Enable all access for loops" ON public.loops;
DROP POLICY IF EXISTS "Enable all access for planning" ON public.planning;

-- Create user-specific RLS policies for beats
CREATE POLICY "Users can view their own beats" ON public.beats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own beats" ON public.beats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own beats" ON public.beats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own beats" ON public.beats
  FOR DELETE USING (auth.uid() = user_id);

-- Create user-specific RLS policies for loops
CREATE POLICY "Users can view their own loops" ON public.loops
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own loops" ON public.loops
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loops" ON public.loops
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loops" ON public.loops
  FOR DELETE USING (auth.uid() = user_id);

-- Create user-specific RLS policies for planning
CREATE POLICY "Users can view their own planning" ON public.planning
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own planning" ON public.planning
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planning" ON public.planning
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planning" ON public.planning
  FOR DELETE USING (auth.uid() = user_id);