"use client";

import { useQuery } from '@tanstack/react-query';
import { supabaseBrowserClient } from '@/lib/supabase/browser';

export interface FamilyTableData {
  family_id: string;
  family_name: string;
  city: string;
  state: string;
  mentor_email: string | null;
  status_aprovacao: string;
  family_size: number;
  children_count: number;
  income_range: string;
  poverty_score: number | null;
  poverty_level: string | null;
  assessment_date: string | null;
  days_since_assessment: number | null;
  positive_answers: number;
}

export const useFamiliesTableData = () => {
  return useQuery({
    queryKey: ['families-table'],
    queryFn: async (): Promise<FamilyTableData[]> => {
      const supabase = supabaseBrowserClient;
      const { data, error } = await supabase
        .from('dignometro_dashboard')
        .select('*')
        .order('assessment_created_at', { ascending: false, nullsFirst: false });
      
      if (error) throw error;
      
      return data.map(family => ({
        family_id: family.family_id,
        family_name: family.family_name,
        city: family.city,
        state: family.state,
        mentor_email: family.mentor_email,
        status_aprovacao: family.status_aprovacao,
        family_size: family.family_size,
        children_count: family.children_count,
        income_range: family.income_range,
        poverty_score: family.poverty_score,
        poverty_level: family.poverty_level,
        assessment_date: family.assessment_date,
        days_since_assessment: family.days_since_assessment,
        positive_answers: family.positive_answers
      }));
    },
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
};
