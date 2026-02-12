import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Beat, BeatInsert, BeatUpdate } from '@/types/database';
import { toast } from 'sonner';

export function useBeats() {
  return useQuery({
    queryKey: ['beats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('beats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data ?? []) as unknown as Beat[];
    },
  });
}

export function useCreateBeat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (beat: BeatInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('beats')
        .insert([{ ...beat, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as Beat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beats'] });
      toast.success('Beat created successfully! ⚡');
    },
    onError: (error) => {
      toast.error(`Failed to create beat: ${error.message}`);
    },
  });
}

export function useUpdateBeat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BeatUpdate }) => {
      const { data, error } = await supabase
        .from('beats')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as Beat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beats'] });
      toast.success('Beat updated! ⚡');
    },
    onError: (error) => {
      toast.error(`Failed to update beat: ${error.message}`);
    },
  });
}

export function useDeleteBeat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('beats')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beats'] });
      toast.success('Beat deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete beat: ${error.message}`);
    },
  });
}
