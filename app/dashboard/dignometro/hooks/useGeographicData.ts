"use client";

import { useQuery } from '@tanstack/react-query';
import { supabaseBrowserClient } from '@/lib/supabase/browser';

export interface GeographicData {
  state: string;
  city: string;
  families_count: number;
  assessed_families: number;
  total_score: number;
  avg_score: number;
  assessment_rate: number;
  families: string[];
}

export const useGeographicData = () => {
  return useQuery({
    queryKey: ['geographic-data'],
    queryFn: async (): Promise<GeographicData[]> => {
      const supabase = supabaseBrowserClient;
      const { data, error } = await supabase
        .from('dignometro_dashboard')
        .select('state, city, poverty_score, poverty_level, family_name')
        .not('state', 'is', null);
      
      if (error) throw error;
      
      // Aggregate por estado e cidade
      const geographic = data.reduce((acc, family) => {
        const state = family.state || 'N/A';
        const city = family.city || 'N/A';
        const key = `${state}-${city}`;
        
        if (!acc[key]) {
          acc[key] = {
            state,
            city,
            families_count: 0,
            assessed_families: 0,
            total_score: 0,
            families: []
          };
        }
        
        acc[key].families_count++;
        acc[key].families.push(family.family_name);
        
        if (family.poverty_score) {
          acc[key].assessed_families++;
          acc[key].total_score += parseFloat(family.poverty_score);
        }
        
        return acc;
      }, {} as Record<string, any>);
      
      return Object.values(geographic).map(location => ({
        ...location,
        avg_score: location.assessed_families > 0 ? location.total_score / location.assessed_families : 0,
        assessment_rate: location.assessed_families / location.families_count
      })).sort((a, b) => b.avg_score - a.avg_score);
    },
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
};
