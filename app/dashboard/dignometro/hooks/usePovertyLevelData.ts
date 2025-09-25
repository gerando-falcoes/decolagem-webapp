"use client";

import { useQuery } from '@tanstack/react-query';
import { supabaseBrowserClient } from '@/lib/supabase/browser';
import { POVERTY_COLORS } from '../constants/colors';

interface PovertyLevelData {
  name: string;
  value: number;
  color: string;
}

export const usePovertyLevelData = () => {
  return useQuery({
    queryKey: ['poverty-levels'],
    queryFn: async (): Promise<PovertyLevelData[]> => {
      const { data, error } = await supabaseBrowserClient
        .from('dignometro_dashboard')
        .select('poverty_level')
        .not('poverty_level', 'is', null);
      
      if (error) throw error;
      
      // Aggregate por nível
      const levelCounts = data.reduce((acc: Record<string, number>, item) => {
        acc[item.poverty_level] = (acc[item.poverty_level] || 0) + 1;
        return acc;
      }, {});
      
      return Object.entries(levelCounts).map(([level, count]) => ({
        name: level,
        value: count,
        color: POVERTY_COLORS[level as keyof typeof POVERTY_COLORS] || '#6B7280'
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};
