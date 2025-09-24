"use client";

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseBrowserClient } from '@/lib/supabase/browser';
import Fuse from 'fuse.js';

interface FamilySearchResult {
  family_id: string;
  family_name: string;
  city: string;
  state: string;
  mentor_email: string | null;
  poverty_score: number | null;
  poverty_level: string | null;
  assessment_date: string | null;
  cpf: string | null;
}

export const useFamilySearch = (query: string) => {
  const [allFamilies, setAllFamilies] = useState<FamilySearchResult[]>([]);
  
  // Carregar todas as famílias uma vez
  const { isLoading } = useQuery({
    queryKey: ['all-families-for-search'],
    queryFn: async (): Promise<FamilySearchResult[]> => {
      const supabase = supabaseBrowserClient;
      const { data, error } = await supabase
        .from('dignometro_dashboard')
        .select(`
          family_id,
          family_name,
          city,
          state,
          mentor_email,
          poverty_score,
          poverty_level,
          assessment_date,
          cpf
        `)
        .order('family_name');
      
      if (error) throw error;
      setAllFamilies(data);
      return data;
    },
    staleTime: 2 * 60 * 1000 // 2 minutos
  });
  
  // Busca com Fuse.js
  const searchResults = useMemo(() => {
    if (!query.trim() || !allFamilies.length) return [];
    
    const fuse = new Fuse(allFamilies, {
      keys: [
        { name: 'family_name', weight: 0.4 },
        { name: 'cpf', weight: 0.3 },
        { name: 'city', weight: 0.2 },
        { name: 'mentor_email', weight: 0.1 }
      ],
      threshold: 0.3,
      includeScore: true
    });
    
    return fuse.search(query).slice(0, 10).map(result => result.item);
  }, [query, allFamilies]);
  
  return { families: searchResults, isLoading };
};
