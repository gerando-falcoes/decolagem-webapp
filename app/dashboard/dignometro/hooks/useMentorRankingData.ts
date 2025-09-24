"use client";

import { useQuery } from '@tanstack/react-query';
import { supabaseBrowserClient } from '@/lib/supabase/browser';

export interface MentorRankingData {
  mentor_email: string;
  families_count: number;
  assessments_count: number;
  total_score: number;
  avg_score: number;
  high_performance_count: number;
  critical_count: number;
  success_rate: number;
}

export const useMentorRankingData = () => {
  return useQuery({
    queryKey: ['mentor-ranking'],
    queryFn: async (): Promise<MentorRankingData[]> => {
      const supabase = supabaseBrowserClient;
      const { data, error } = await supabase
        .from('dignometro_dashboard')
        .select('mentor_email, poverty_score, poverty_level, family_id')
        .not('mentor_email', 'is', null);
      
      if (error) throw error;
      
      // Aggregate por mentor
      const mentorStats = data.reduce((acc, family) => {
        const mentor = family.mentor_email;
        if (!acc[mentor]) {
          acc[mentor] = {
            mentor_email: mentor,
            families_count: 0,
            assessments_count: 0,
            total_score: 0,
            high_performance_count: 0,
            critical_count: 0
          };
        }
        
        acc[mentor].families_count++;
        
        if (family.poverty_score) {
          acc[mentor].assessments_count++;
          acc[mentor].total_score += parseFloat(family.poverty_score);
        }
        
        if (['quebra de ciclo da pobreza', 'prosperidade em desenvolvimento'].includes(family.poverty_level)) {
          acc[mentor].high_performance_count++;
        }
        
        if (['pobreza extrema', 'pobreza'].includes(family.poverty_level)) {
          acc[mentor].critical_count++;
        }
        
        return acc;
      }, {} as Record<string, any>);
      
      return Object.values(mentorStats).map(mentor => ({
        ...mentor,
        avg_score: mentor.assessments_count > 0 ? mentor.total_score / mentor.assessments_count : 0,
        success_rate: mentor.assessments_count > 0 ? (mentor.high_performance_count / mentor.assessments_count) * 100 : 0
      })).sort((a, b) => b.avg_score - a.avg_score);
    },
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
};
