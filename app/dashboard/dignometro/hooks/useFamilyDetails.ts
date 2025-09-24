"use client";

import { useQuery } from '@tanstack/react-query';
import { supabaseBrowserClient } from '@/lib/supabase/browser';

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
      const supabase = supabaseBrowserClient;
      
      // Dados básicos da família
      const { data: family, error: familyError } = await supabase
        .from('dignometro_dashboard')
        .select('*')
        .eq('family_id', familyId)
        .single();
      
      if (familyError) throw familyError;
      
      // Histórico de assessments
      const { data: assessments, error: assessmentsError } = await supabase
        .from('dignometro_assessments')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });
      
      if (assessmentsError) throw assessmentsError;
      
      // Membros da família
      const { data: members, error: membersError } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyId);
      
      if (membersError) throw membersError;
      
      // Metas da família
      const { data: goals, error: goalsError } = await supabase
        .from('family_goal_assignments')
        .select(`
          *,
          goal_templates(goal_name, goal_description, dimension)
        `)
        .eq('family_id', familyId);
      
      if (goalsError) throw goalsError;
      
      return {
        family,
        assessments,
        members,
        goals,
        hasData: {
          family: !!family,
          assessments: assessments.length > 0,
          members: members.length > 0,
          goals: goals.length > 0
        }
      };
    },
    enabled: !!familyId,
    staleTime: 2 * 60 * 1000
  });
};
