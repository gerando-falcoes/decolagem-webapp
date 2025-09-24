"use client";

import { useQuery } from '@tanstack/react-query';
import { supabaseBrowserClient } from '@/lib/supabase/browser';

export interface GoalsMatrixData {
  hasAssignments: boolean;
  matrix?: Record<string, Record<string, number>>;
  totalAssignments?: number;
  templatesByDimension?: Record<string, string[]>;
  totalTemplates?: number;
}

export const useGoalsMatrixData = () => {
  return useQuery({
    queryKey: ['goals-matrix'],
    queryFn: async (): Promise<GoalsMatrixData> => {
      const supabase = supabaseBrowserClient;
      
      // Query para metas por dimensão e status
      const { data, error } = await supabase
        .from('family_goal_assignments')
        .select(`
          dimension,
          current_status,
          goal_name,
          progress_percentage,
          goal_templates!inner(dimension)
        `);
      
      if (error) {
        // Fallback: se não há assignments, mostrar templates disponíveis
        const { data: templates, error: templatesError } = await supabase
          .from('goal_templates')
          .select('dimension, goal_name')
          .eq('is_active', true);
        
        if (templatesError) throw templatesError;
        
        const templatesByDimension = templates.reduce((acc, template) => {
          if (!acc[template.dimension]) {
            acc[template.dimension] = [];
          }
          acc[template.dimension].push(template.goal_name);
          return acc;
        }, {} as Record<string, string[]>);
        
        return {
          hasAssignments: false,
          templatesByDimension,
          totalTemplates: templates.length
        };
      }
      
      // Se há assignments, processar dados reais
      const matrix = data.reduce((acc, assignment) => {
        const dimension = assignment.dimension;
        const status = assignment.current_status;
        
        if (!acc[dimension]) {
          acc[dimension] = {};
        }
        
        if (!acc[dimension][status]) {
          acc[dimension][status] = 0;
        }
        
        acc[dimension][status]++;
        return acc;
      }, {} as Record<string, Record<string, number>>);
      
      return {
        hasAssignments: true,
        matrix,
        totalAssignments: data.length
      };
    },
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
};
