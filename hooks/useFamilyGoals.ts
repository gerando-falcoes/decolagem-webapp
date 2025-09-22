import { useState, useEffect, useCallback } from 'react'
import { supabaseBrowserClient } from '@/lib/supabase/browser'

export interface FamilyGoal {
  id: string
  family_id: string
  assessment_id?: string
  goal_name: string // Atualizado para goal_name
  goal_description?: string // Nova propriedade
  dimension?: string // Nova propriedade  
  target_date?: string
  current_status: string
  progress_percentage: number
  priority_level?: string // Nova propriedade
  source?: string
  goal_template_id?: string // Nova propriedade
  notes?: string // Nova propriedade
  created_at: string
  updated_at: string
}

export interface FamilyGoalsResponse {
  family_id: string
  goals: FamilyGoal[] // Apenas metas ativas (não concluídas)
  allGoals: FamilyGoal[] // Todas as metas para estatísticas
  totalGoals: number
  activeGoals: number  // Metas em andamento
  completedGoals: number  // Metas finalizadas
}

export function useFamilyGoals(familyId: string | null) {
  const [data, setData] = useState<FamilyGoalsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFamilyGoals = useCallback(async () => {
    if (!familyId) {
      setData(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      
      // Usar nova API que trabalha com family_goal_assignments
      const response = await fetch(`/api/families/${familyId}/goal-assignments`)
      const apiData = await response.json()

      if (!response.ok) {
        throw new Error(apiData.error || 'Erro ao carregar metas')
      }

      const goals = apiData.goal_assignments || []
      const goalsData = goals || []
      
      // Calcular estatísticas conforme solicitado
      const totalGoals = goalsData.length
      
      // ATIVAS: Metas com status "Em progresso" 
      const activeGoals = goalsData.filter(g => 
        g.current_status === 'Em progresso'
      ).length
      
      // CONCLUÍDAS: Metas com progress_percentage = 100 OU status "Concluída"
      const completedGoals = goalsData.filter(g => 
        g.progress_percentage === 100 || g.current_status === 'Concluída'
      ).length

      // CANCELADAS: Metas com status "Cancelada"
      const canceledGoals = goalsData.filter(g => 
        g.current_status === 'Cancelada'
      ).length

      // Filtrar apenas metas não concluídas e não canceladas para exibição na lista
      const activeGoalsData = goalsData.filter(g => 
        g.progress_percentage !== 100 && 
        g.current_status !== 'Cancelada' && 
        g.current_status !== 'Concluída'
      )

      setData({
        family_id: familyId,
        goals: activeGoalsData, // Exibir apenas metas ativas
        allGoals: goalsData, // Manter todas as metas para estatísticas
        totalGoals,
        activeGoals,
        completedGoals,
        canceledGoals
      })
    } catch (err) {
      setError('Erro ao carregar metas da família')
      console.error('Erro ao buscar metas:', err)
    } finally {
      setLoading(false)
    }
  }, [familyId])

  useEffect(() => {
    fetchFamilyGoals()
  }, [fetchFamilyGoals])

  // Alternar status entre "Em progresso" e "Parada"
  const toggleGoalStatus = useCallback(async (goalId: string) => {
    try {
      const response = await fetch(`/api/families/${familyId}/goal-assignments/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle_status',
          goal_assignment_id: goalId
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao alterar status da meta')
      }

      const result = await response.json()
      console.log('✅ Status alterado:', result.message)

      // Recarregar dados para garantir sincronização
      await fetchFamilyGoals()
      return result
    } catch (error) {
      console.error('Erro ao alterar status da meta:', error)
      throw error
    }
  }, [fetchFamilyGoals, familyId])

  // Marcar meta como concluída (100%)
  const markGoalCompleted = useCallback(async (goalId: string) => {
    try {
      const response = await fetch(`/api/families/${familyId}/goal-assignments/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_completed',
          goal_assignment_id: goalId
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao marcar meta como concluída')
      }

      const result = await response.json()
      console.log('✅ Meta concluída:', result.message)

      // Recarregar dados para garantir sincronização
      await fetchFamilyGoals()
      return result
    } catch (error) {
      console.error('Erro ao marcar meta como concluída:', error)
      throw error
    }
  }, [fetchFamilyGoals, familyId])

  // Cancelar meta
  const cancelGoal = useCallback(async (goalId: string) => {
    try {
      const response = await fetch(`/api/families/${familyId}/goal-assignments/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
          goal_assignment_id: goalId
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao cancelar meta')
      }

      const result = await response.json()
      console.log('✅ Meta cancelada:', result.message)

      // Recarregar dados para garantir sincronização
      await fetchFamilyGoals()
      return result
    } catch (error) {
      console.error('Erro ao cancelar meta:', error)
      throw error
    }
  }, [fetchFamilyGoals, familyId])

  // Deletar meta
  const deleteGoal = useCallback(async (goalId: string) => {
    try {
      const response = await fetch(`/api/families/${familyId}/goal-assignments/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          goal_assignment_id: goalId
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar meta')
      }

      const result = await response.json()
      console.log('✅ Meta deletada:', result.message)

      // Recarregar dados para garantir sincronização
      await fetchFamilyGoals()
      return result
    } catch (error) {
      console.error('Erro ao deletar meta:', error)
      throw error
    }
  }, [fetchFamilyGoals, familyId])

  return { 
    data, 
    loading, 
    error, 
    refetch: () => fetchFamilyGoals(),
    toggleGoalStatus,
    markGoalCompleted,
    cancelGoal,
    deleteGoal
  }
}

// Função auxiliar para obter cor do status
export function getStatusColor(status: string): string {
  switch (status) {
    case 'Em progresso':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'Parada':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'Cancelada':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'Concluída':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Função auxiliar para obter cor do progresso
export function getProgressColor(progress: number): string {
  if (progress === 100) {
    return 'bg-green-100 text-green-800 border-green-200'
  } else if (progress >= 50) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  } else {
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Função auxiliar para obter ícone do status  
export function getStatusIcon(status: string): string {
  switch (status) {
    case 'Em progresso':
      return '🎯'
    case 'Parada':
      return '⏸️'
    case 'Cancelada':
      return '❌'
    case 'Concluída':
      return '✅'
    default:
      return '📋'
  }
}

// Função auxiliar para obter ícone do progresso
export function getProgressIcon(progress: number): string {
  if (progress === 100) {
    return '✅'
  } else if (progress >= 50) {
    return '🔄'
  } else {
    return '📋'
  }
}

// Função para obter o próximo status na transição
export function getNextStatus(currentStatus: string): string {
  switch (currentStatus) {
    case 'Em progresso':
      return 'Parada'
    case 'Parada':
      return 'Em progresso'
    default:
      return 'Em progresso'
  }
}

// Função para obter texto do botão de transição de status
export function getStatusToggleButtonText(currentStatus: string): string {
  switch (currentStatus) {
    case 'Em progresso':
      return 'Pausar Meta'
    case 'Parada':
      return 'Retomar Meta'
    default:
      return 'Alterar Status'
  }
}

// Função para obter texto do botão de conclusão
export function getCompletionButtonText(progress: number): string {
  if (progress === 100) {
    return 'Meta Concluída'
  } else {
    return 'Marcar como Concluída'
  }
}

// Função para obter a dimensão com base no campo dimension ou inferir de goal_name
export function getGoalDimension(goal: FamilyGoal): string {
  // Se tem dimensão definida, usar ela
  if (goal.dimension) return goal.dimension
  
  // Caso contrário, tentar inferir do nome da meta
  const goalName = (goal.goal_name || '').toLowerCase()
  
  if (goalName.includes('água') || goalName.includes('filtro') || goalName.includes('caixa d\'água')) return 'Água'
  if (goalName.includes('moradia') || goalName.includes('casa') || goalName.includes('endereço') || goalName.includes('cep')) return 'Moradia'
  if (goalName.includes('saneamento') || goalName.includes('banheiro') || goalName.includes('esgoto') || goalName.includes('vaso sanitário')) return 'Saneamento'
  if (goalName.includes('educação') || goalName.includes('escola') || goalName.includes('matrícula') || goalName.includes('estudo')) return 'Educação'
  if (goalName.includes('saúde') || goalName.includes('médico') || goalName.includes('remédio') || goalName.includes('sus')) return 'Saúde'
  if (goalName.includes('alimentação') || goalName.includes('comida') || goalName.includes('refeição') || goalName.includes('horta')) return 'Alimentação'
  if (goalName.includes('renda') || goalName.includes('emprego') || goalName.includes('trabalho') || goalName.includes('bico')) return 'Renda Estável'
  if (goalName.includes('poupança') || goalName.includes('economia') || goalName.includes('guardar') || goalName.includes('aplicativo')) return 'Poupança'
  if (goalName.includes('conectividade') || goalName.includes('internet') || goalName.includes('eletrodoméstico') || goalName.includes('geladeira')) return 'Bens e Conectividade'
  
  return 'Personalizada'
}

// Função auxiliar para formatear data
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR')
}
