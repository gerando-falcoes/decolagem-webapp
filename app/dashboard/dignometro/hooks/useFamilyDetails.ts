"use client";

import { useQuery } from '@tanstack/react-query';

export interface FamilyDetails {
  family: any;
  assessments: any[];
  members: any[];
  goals: any[];
  hasData: {
    family: boolean;
    assessments: boolean;
    members: boolean;
    goals: boolean;
  };
}

export const useFamilyDetails = (familyId: string) => {
  return useQuery({
    queryKey: ['family-details', familyId],
    queryFn: async (): Promise<FamilyDetails> => {
      // Usar API route para acessar dados com service role
      const response = await fetch(`/api/families/${familyId}/details`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar detalhes da família: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    },
    enabled: !!familyId,
    staleTime: 2 * 60 * 1000
  });
};
