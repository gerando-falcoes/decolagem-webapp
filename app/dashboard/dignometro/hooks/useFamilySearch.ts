"use client";

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Fuse from 'fuse.js';

interface FamilySearchResult {
  id: string;
  name: string;
  city: string;
  state: string;
  mentor_email: string | null;
  cpf: string | null;
  status_aprovacao: string;
}

export const useFamilySearch = (query: string) => {
  const [allFamilies, setAllFamilies] = useState<FamilySearchResult[]>([]);
  
  // Carregar todas as famílias uma vez
  const { isLoading } = useQuery({
    queryKey: ['all-families-for-search'],
    queryFn: async (): Promise<FamilySearchResult[]> => {
      // Usar API route para acessar dados com service role
      const response = await fetch('/api/families/search');
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar famílias: ${response.status}`);
      }
      
      const data = await response.json();
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
        { name: 'name', weight: 0.4 },
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
