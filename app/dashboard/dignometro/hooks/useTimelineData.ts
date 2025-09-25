"use client";

import { useQuery } from '@tanstack/react-query';
import { supabaseBrowserClient } from '@/lib/supabase/browser';
import { format } from 'date-fns';

interface TimelineWeek {
  week: string;
  score: number;
  assessments: number;
  quebra_ciclo: number;
  prosperidade: number;
  dignidade: number;
  pobreza: number;
  pobreza_extrema: number;
}

export const useTimelineData = (weeks = 12) => {
  return useQuery({
    queryKey: ['timeline', weeks],
    queryFn: async (): Promise<TimelineWeek[]> => {
      const { data, error } = await supabaseBrowserClient
        .from('dignometro_weekly_timeline')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(weeks);
      
      if (error) throw error;
      
      return data.map(week => ({
        week: format(new Date(week.week_start), 'dd/MM'),
        score: parseFloat(week.avg_score || 0),
        assessments: week.assessments_count,
        quebra_ciclo: week.quebra_ciclo_count,
        prosperidade: week.prosperidade_count,
        dignidade: week.dignidade_count,
        pobreza: week.pobreza_count,
        pobreza_extrema: week.pobreza_extrema_count
      }));
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });
};
