import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Loop, LoopInsert, LoopUpdate } from '@/types/database';
import { toast } from 'sonner';

export function useLoops() {
  return useQuery({
    queryKey: ['loops'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('loops')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data ?? []) as unknown as Loop[];
    },
  });
}

export function useCreateLoop() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (loop: LoopInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('loops')
        .insert([{ ...loop, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as Loop;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loops'] });
      toast.success('Loop created successfully! 🔄');
    },
    onError: (error) => {
      toast.error(`Failed to create loop: ${error.message}`);
    },
  });
}

export function useUpdateLoop() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: LoopUpdate }) => {
      const { data, error } = await supabase
        .from('loops')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as Loop;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loops'] });
      toast.success('Loop updated! 🔄');
    },
    onError: (error) => {
      toast.error(`Failed to update loop: ${error.message}`);
    },
  });
}

export function useDeleteLoop() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('loops')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loops'] });
      toast.success('Loop deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete loop: ${error.message}`);
    },
  });
}
