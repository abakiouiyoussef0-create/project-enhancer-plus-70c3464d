import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Planning, PlanningInsert, PlanningUpdate } from '@/types/database';
import { toast } from 'sonner';

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function usePlanning() {
  return useQuery({
    queryKey: ['planning'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planning')
        .select('*');
      
      if (error) throw error;
      
      // Sort by day order
      return (data as Planning[]).sort((a, b) => {
        return DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day);
      });
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (task: PlanningInsert) => {
      const { data, error } = await supabase
        .from('planning')
        .insert([task])
        .select()
        .single();
      
      if (error) throw error;
      return data as Planning;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planning'] });
      toast.success('Task created! 📅');
    },
    onError: (error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PlanningUpdate }) => {
      const { data, error } = await supabase
        .from('planning')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Planning;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planning'] });
      toast.success('Task updated! 📅');
    },
    onError: (error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('planning')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planning'] });
      toast.success('Task deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });
}

export function useToggleTaskComplete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const { data, error } = await supabase
        .from('planning')
        .update({ is_completed })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Planning;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['planning'] });
      if (data?.is_completed) {
        toast.success('Task completed! ⚡');
      }
    },
    onError: (error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });
}
