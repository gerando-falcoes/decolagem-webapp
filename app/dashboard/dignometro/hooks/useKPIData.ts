"use client";

import { useQuery } from '@tanstack/react-query';
import { supabaseBrowserClient } from '@/lib/supabase/browser';

interface KPIData {
  totalFamilies: number;
  avgScore: number;
  criticalFamilies: number;
  successfulFamilies: number;
}

export const useKPIData = () => {
  return useQuery({
    queryKey: ['kpi-stats'],
    queryFn: async (): Promise<KPIData> => {
      const { data, error } = await supabaseBrowserClient
        .from('dignometro_dashboard')
        .select('poverty_score, poverty_level, assessment_date');
      
      if (error) throw error;
      
      // Filtrar apenas famílias com avaliações válidas
      const familiesWithScores = data.filter(f => f.poverty_score !== null);
      
      // Calcular pontuação média
      const avgScore = familiesWithScores.length > 0 
        ? familiesWithScores.reduce((sum, f) => sum + f.poverty_score, 0) / familiesWithScores.length
        : 0;
      
      // Contar famílias críticas
      const criticalFamilies = data.filter(f => 
        ['pobreza extrema', 'pobreza'].includes(f.poverty_level)
      ).length;
      
      // Contar famílias em prosperidade
      const successfulFamilies = data.filter(f => 
        ['quebra de ciclo da pobreza', 'prosperidade em desenvolvimento'].includes(f.poverty_level)
      ).length;
      
      return {
        totalFamilies: data.length,
        avgScore: Number(avgScore.toFixed(1)),
        criticalFamilies,
        successfulFamilies
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};
