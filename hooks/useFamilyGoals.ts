import { useState, useEffect } from 'react'
import { supabaseBrowserClient } from '@/lib/supabase/browser'

export interface FamilyGoal {
  id: string
  family_id: string
  assessment_id?: string
  goal_title: string
  goal_category: string | null
  target_date?: string
  current_status: string
  progress_percentage: number
  source?: string
  dimension_id?: string
  created_at: string
  updated_at: string
}

export interface FamilyGoalsResponse {
  family_id: string
  goals: FamilyGoal[]
  totalGoals: number
  activeGoals: number  // Metas em andamento
  completedGoals: number  // Metas finalizadas
  suggestedGoals: number  // Metas personalizadas/customizadas
}

// Função para classificar se é meta sugerida (personalizada)
export function isSuggestedGoal(goal: FamilyGoal): boolean {
  return goal.source === 'manual' || 
         goal.goal_category?.includes('personalizada') ||
         goal.goal_category?.includes('mentor') ||
         !goal.assessment_id
}

export function useFamilyGoals(familyId: string | null) {
  const [data, setData] = useState<FamilyGoalsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!familyId) {
      setData(null)
      setLoading(false)
      return
    }

    async function fetchFamilyGoals() {
      try {
        setLoading(true)
        setError(null)
        
        // Usar API route para contornar RLS
        const response = await fetch(`/api/goals?family_id=${familyId}`)
        const apiData = await response.json()

        if (!response.ok) {
          throw new Error(apiData.error || 'Erro ao carregar metas')
        }

        const goals = apiData.goals || []
        const goalsData = goals || []
        
        // Calcular estatísticas conforme solicitado
        const totalGoals = goalsData.length
        
        // ATIVAS: Metas que ainda estão sendo realizadas (PENDENTE, ATIVA, EM_ANDAMENTO)
        const activeGoals = goalsData.filter(g => 
          ['PENDENTE', 'ATIVA', 'EM_ANDAMENTO'].includes(g.current_status?.toUpperCase())
        ).length
        
        // CONCLUÍDAS: Metas finalizadas 
        const completedGoals = goalsData.filter(g => 
          ['CONCLUIDO', 'CONCLUIDA', 'FINALIZADA'].includes(g.current_status?.toUpperCase())
        ).length
        
        // SUGERIDAS: Metas que não são padrão (criadas com descrição personalizada)
        const suggestedGoals = goalsData.filter(g => isSuggestedGoal(g)).length

        setData({
          family_id: familyId,
          goals: goalsData,
          totalGoals,
          activeGoals,
          completedGoals,
          suggestedGoals
        })
      } catch (err) {
        setError('Erro ao carregar metas da família')
        console.error('Erro ao buscar metas:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFamilyGoals()
  }, [familyId])

  const updateGoalStatus = async (goalId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal_id: goalId,
          current_status: newStatus
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status da meta')
      }

      // Recarregar dados para garantir sincronização
      fetchFamilyGoals()
    } catch (error) {
      console.error('Erro ao atualizar meta:', error)
      throw error
    }
  }

  return { 
    data, 
    loading, 
    error, 
    refetch: () => fetchFamilyGoals(),
    updateGoalStatus
  }
}

// Função auxiliar para obter cor do status
export function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'PENDENTE':
    case 'ATIVA':
    case 'EM_ANDAMENTO':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'CONCLUIDO':
    case 'CONCLUIDA':
    case 'FINALIZADA':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'SUGERIDA':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'PAUSADA':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'CANCELADA':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Função auxiliar para obter ícone do status  
export function getStatusIcon(status: string): string {
  switch (status.toUpperCase()) {
    case 'PENDENTE':
    case 'ATIVA':
    case 'EM_ANDAMENTO':
      return '🎯'
    case 'CONCLUIDO':
    case 'CONCLUIDA':
    case 'FINALIZADA':
      return '✅'
    case 'SUGERIDA':
      return '💡'
    case 'PAUSADA':
      return '⏸️'
    case 'CANCELADA':
      return '❌'
    default:
      return '📋'
  }
}

// Função para obter o próximo status na transição
export function getNextStatus(currentStatus: string): string {
  switch (currentStatus.toUpperCase()) {
    case 'PENDENTE':
    case 'ATIVA':
    case 'EM_ANDAMENTO':
    case 'SUGERIDA':
      return 'CONCLUIDO'
    case 'CONCLUIDO':
    case 'CONCLUIDA':
    case 'FINALIZADA':
      return 'ATIVA'
    default:
      return 'ATIVA'
  }
}

// Função para obter texto do botão de transição
export function getTransitionButtonText(currentStatus: string): string {
  switch (currentStatus.toUpperCase()) {
    case 'PENDENTE':
    case 'ATIVA':
    case 'EM_ANDAMENTO':
    case 'SUGERIDA':
      return 'Marcar como Concluída'
    case 'CONCLUIDO':
    case 'CONCLUIDA':
    case 'FINALIZADA':
      return 'Marcar como Ativa'
    default:
      return 'Alterar Status'
  }
}

// Função para obter a dimensão com base no goal_category ou assessment
export function getGoalDimension(goal: FamilyGoal): string {
  if (!goal.goal_category) return 'Geral'
  
  const category = goal.goal_category.toLowerCase()
  
  if (category.includes('água') || category.includes('filtro')) return 'Água'
  if (category.includes('moradia') || category.includes('casa')) return 'Moradia'
  if (category.includes('saneamento') || category.includes('banheiro')) return 'Saneamento'
  if (category.includes('educação') || category.includes('escola')) return 'Educação'
  if (category.includes('saúde') || category.includes('médico')) return 'Saúde'
  if (category.includes('alimentação') || category.includes('comida')) return 'Alimentação'
  if (category.includes('renda') || category.includes('emprego')) return 'Renda'
  if (category.includes('poupança') || category.includes('economia')) return 'Poupança'
  if (category.includes('conectividade') || category.includes('internet')) return 'Conectividade'
  
  return 'Personalizada'
}

// Função auxiliar para formatear data
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR')
}
