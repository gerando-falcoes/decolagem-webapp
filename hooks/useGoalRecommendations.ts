import { useState, useEffect, useCallback } from 'react'

// Interface para recomendação de meta
export interface GoalRecommendation {
  id: string
  goal_template_id: string
  goal_name: string
  goal_description: string
  dimension: string
  priority_level: 'low' | 'medium' | 'high'
  order_priority: number
  source: string
  assessment_id: string
  family_id: string
}

// Interface para dados de recomendações
export interface GoalRecommendationsData {
  family_id: string
  has_assessment: boolean
  assessment_id?: string
  assessment_date?: string
  vulnerable_dimensions: string[]
  recommendations: GoalRecommendation[]
  total_recommendations: number
  recommendations_by_dimension: { [key: string]: GoalRecommendation[] }
  message?: string
}

// Interface para configurações de criação de meta
export interface CreateGoalSettings {
  target_date?: string
  priority_level?: 'low' | 'medium' | 'high'
  notes?: string
}

// Interface do retorno do hook
export interface UseGoalRecommendationsReturn {
  data: GoalRecommendationsData | null
  loading: boolean
  error: string | null
  
  // Funções para gerenciar recomendações
  refreshRecommendations: () => Promise<void>
  createGoalFromRecommendation: (recommendation: GoalRecommendation, settings?: CreateGoalSettings) => Promise<boolean>
  
  // Funções de utilidade
  getRecommendationsByDimension: (dimension: string) => GoalRecommendation[]
  getTotalByDimension: () => { [key: string]: number }
  hasVulnerabilities: () => boolean
}

/**
 * Hook para gerenciar recomendações de metas baseadas no dignometro
 * 
 * Este hook:
 * 1. Busca o último dignometro da família
 * 2. Identifica dimensões vulneráveis (respostas "false")
 * 3. Recomenda metas da tabela goal_templates para essas dimensões
 * 4. Permite criar metas em family_goal_assignments
 */
export function useGoalRecommendations(familyId: string | null): UseGoalRecommendationsReturn {
  const [data, setData] = useState<GoalRecommendationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Função para buscar recomendações
  const fetchRecommendations = useCallback(async () => {
    if (!familyId) {
      setData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Buscando recomendações de metas para família:', familyId)
      
      const response = await fetch(`/api/families/${familyId}/goal-recommendations`)
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Recomendações encontradas:', {
          total: result.data.total_recommendations,
          vulnerabilidades: result.data.vulnerable_dimensions.length,
          dimensoes: result.data.vulnerable_dimensions
        })
        
        setData(result.data)
      } else {
        throw new Error(result.error || 'Erro ao buscar recomendações')
      }
    } catch (err) {
      console.error('❌ Erro ao buscar recomendações:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      
      // Em caso de erro, definir dados padrão
      setData({
        family_id: familyId,
        has_assessment: false,
        vulnerable_dimensions: [],
        recommendations: [],
        total_recommendations: 0,
        recommendations_by_dimension: {},
        message: 'Erro ao carregar recomendações'
      })
    } finally {
      setLoading(false)
    }
  }, [familyId])

  // Função para refresh manual
  const refreshRecommendations = useCallback(async () => {
    await fetchRecommendations()
  }, [fetchRecommendations])

  // Função para criar meta a partir de recomendação
  const createGoalFromRecommendation = useCallback(async (
    recommendation: GoalRecommendation, 
    settings?: CreateGoalSettings
  ): Promise<boolean> => {
    if (!familyId) return false

    try {
      console.log('📝 Criando meta a partir de recomendação:', {
        id: recommendation.id,
        meta: recommendation.goal_name,
        dimensao: recommendation.dimension
      })

      const response = await fetch(`/api/families/${familyId}/goal-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal_template_id: recommendation.goal_template_id,
          goal_name: recommendation.goal_name,
          goal_description: recommendation.goal_description,
          dimension: recommendation.dimension,
          target_date: settings?.target_date,
          priority_level: settings?.priority_level || recommendation.priority_level,
          assessment_id: recommendation.assessment_id,
          notes: settings?.notes
        })
      })

      if (!response.ok) {
        throw new Error(`Erro ao criar meta: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Meta criada com sucesso:', result.goal_assignment.id)
        
        // Remover recomendação da lista local
        if (data) {
          const updatedRecommendations = data.recommendations.filter(
            rec => rec.id !== recommendation.id
          )
          
          const updatedData = {
            ...data,
            recommendations: updatedRecommendations,
            total_recommendations: updatedRecommendations.length,
            recommendations_by_dimension: updatedRecommendations.reduce((acc: any, rec: any) => {
              if (!acc[rec.dimension]) acc[rec.dimension] = []
              acc[rec.dimension].push(rec)
              return acc
            }, {})
          }
          
          setData(updatedData)
          console.log(`📊 Recomendações restantes: ${updatedRecommendations.length}`)
        }
        
        return true
      } else {
        throw new Error(result.error || 'Erro ao criar meta')
      }
    } catch (err) {
      console.error('❌ Erro ao criar meta a partir de recomendação:', err)
      return false
    }
  }, [familyId, data])

  // Função para obter recomendações de uma dimensão específica
  const getRecommendationsByDimension = useCallback((dimension: string): GoalRecommendation[] => {
    if (!data) return []
    return data.recommendations_by_dimension[dimension] || []
  }, [data])

  // Função para obter total de recomendações por dimensão
  const getTotalByDimension = useCallback((): { [key: string]: number } => {
    if (!data) return {}
    return Object.keys(data.recommendations_by_dimension).reduce((acc, dimension) => {
      acc[dimension] = data.recommendations_by_dimension[dimension].length
      return acc
    }, {} as { [key: string]: number })
  }, [data])

  // Função para verificar se há vulnerabilidades
  const hasVulnerabilities = useCallback((): boolean => {
    return data ? data.vulnerable_dimensions.length > 0 : false
  }, [data])

  // Effect para carregar dados iniciais
  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  return {
    data,
    loading,
    error,
    refreshRecommendations,
    createGoalFromRecommendation,
    getRecommendationsByDimension,
    getTotalByDimension,
    hasVulnerabilities
  }
}

// Funções auxiliares para trabalhar com recomendações

/**
 * Obter cor da dimensão para UI
 */
export function getDimensionColor(dimension: string): string {
  const colors: { [key: string]: string } = {
    'Moradia': 'bg-blue-100 text-blue-800',
    'Água': 'bg-cyan-100 text-cyan-800',
    'Saneamento': 'bg-green-100 text-green-800',
    'Educação': 'bg-purple-100 text-purple-800',
    'Saúde': 'bg-red-100 text-red-800',
    'Alimentação': 'bg-orange-100 text-orange-800',
    'Renda Diversificada': 'bg-yellow-100 text-yellow-800',
    'Renda Estável': 'bg-emerald-100 text-emerald-800',
    'Poupança': 'bg-indigo-100 text-indigo-800',
    'Bens e Conectividade': 'bg-pink-100 text-pink-800'
  }
  return colors[dimension] || 'bg-gray-100 text-gray-800'
}

/**
 * Obter ícone da dimensão para UI
 */
export function getDimensionIcon(dimension: string): string {
  const icons: { [key: string]: string } = {
    'Moradia': '🏠',
    'Água': '💧',
    'Saneamento': '🚿',
    'Educação': '📚',
    'Saúde': '🏥',
    'Alimentação': '🍽️',
    'Renda Diversificada': '💼',
    'Renda Estável': '💰',
    'Poupança': '🏦',
    'Bens e Conectividade': '📱'
  }
  return icons[dimension] || '📋'
}

/**
 * Obter cor da prioridade para UI
 */
export function getPriorityColor(priority: string): string {
  const colors: { [key: string]: string } = {
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800'
  }
  return colors[priority] || 'bg-gray-100 text-gray-800'
}

/**
 * Obter texto da prioridade em português
 */
export function getPriorityText(priority: string): string {
  const texts: { [key: string]: string } = {
    'low': 'Baixa',
    'medium': 'Média',
    'high': 'Alta'
  }
  return texts[priority] || 'Não definida'
}
