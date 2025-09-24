"use client";

import { useQuery } from '@tanstack/react-query';
import { supabaseBrowserClient } from '@/lib/supabase/browser';
import { DashboardFamily, WeeklyTimeline } from '../types/dashboard';

export function useDignometroData() {
  // Dados principais das famílias
  const { 
    data: families, 
    isLoading: familiesLoading, 
    error: familiesError 
  } = useQuery({
    queryKey: ['dignometro-families'],
    queryFn: async (): Promise<DashboardFamily[]> => {
      const { data, error } = await supabaseBrowserClient
        .from('dignometro_dashboard')
        .select('*')
        .order('assessment_created_at', { ascending: false, nullsFirst: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Timeline semanal
  const { 
    data: timeline, 
    isLoading: timelineLoading, 
    error: timelineError 
  } = useQuery({
    queryKey: ['dignometro-timeline'],
    queryFn: async (): Promise<WeeklyTimeline[]> => {
      const { data, error } = await supabaseBrowserClient
        .from('dignometro_weekly_timeline')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(12); // Últimas 12 semanas
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    families: families || [],
    timeline: timeline || [],
    isLoading: familiesLoading || timelineLoading,
    error: familiesError || timelineError,
  };
}