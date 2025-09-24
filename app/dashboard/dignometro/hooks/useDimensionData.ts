"use client";

import { useQuery } from '@tanstack/react-query';
import { supabaseBrowserClient } from '@/lib/supabase/browser';

interface DimensionData {
  dimension: string;
  percentage: number;
  positive_count: number;
  total_count: number;
  color: string;
}

export const useDimensionData = () => {
  return useQuery({
    queryKey: ['dimensions-performance'],
    queryFn: async (): Promise<DimensionData[]> => {
      // Query customizada para analisar o JSONB answers
      const { data, error } = await supabaseBrowserClient.rpc('get_dimension_performance');
      
      if (error) {
        // Fallback: buscar dados da view dignometro_dashboard
        const { data: assessments, error: fallbackError } = await supabaseBrowserClient
          .from('dignometro_dashboard')
          .select('answers')
          .not('answers', 'is', null);
        
        if (fallbackError) throw fallbackError;
        
        // Processar dimensões no cliente
        const dimensionStats: Record<string, { total: number; positive: number }> = {};
        
        assessments.forEach(assessment => {
          Object.entries(assessment.answers || {}).forEach(([dim, value]) => {
            if (!dimensionStats[dim]) {
              dimensionStats[dim] = { total: 0, positive: 0 };
            }
            dimensionStats[dim].total++;
            if (value === true) dimensionStats[dim].positive++;
          });
        });
        
        return Object.entries(dimensionStats).map(([dimension, stats]) => ({
          dimension,
          percentage: Math.round((stats.positive / stats.total) * 100),
          positive_count: stats.positive,
          total_count: stats.total,
          color: stats.positive / stats.total > 0.7 ? '#16A34A' : 
                 stats.positive / stats.total > 0.4 ? '#EAB308' : '#DC2626'
        })).sort((a, b) => a.percentage - b.percentage);
      }
      
      // Processar dados da função RPC e adicionar cores
      return data.map((item: any) => ({
        ...item,
        color: item.percentage > 70 ? '#16A34A' : 
               item.percentage > 40 ? '#EAB308' : '#DC2626'
      })).sort((a: any, b: any) => a.percentage - b.percentage);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};
