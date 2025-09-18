import { useState, useEffect } from 'react'
import type { SharePointGoal, SharePointGoalsData } from '@/app/api/sharepoint/goals/route'

// Interface para recomendações baseadas no dignômetro
export interface RecommendationData {
  family_id: string
  assessment_id: string | null
  total_recommendations: number
  critical_recommendations: number
  high_priority_recommendations: number
  recommendations_by_dimension: Record<string, SharePointGoal[]>
  raw_recommendations: SharePointGoal[]
  generated_from: 'sharepoint'
  generated_at: string
}

export function useSharePointGoals() {
  const [data, setData] = useState<SharePointGoalsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/sharepoint/goals')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar metas do SharePoint')
      }

      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar metas do SharePoint')
      console.error('Erro ao buscar metas do SharePoint:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchGoals
  }
}

// Hook principal para gerar recomendações baseadas no dignômetro
export function useSharePointRecommendations(familyId: string | null) {
  const [recommendationsData, setRecommendationsData] = useState<RecommendationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { data: goalsData, loading: goalsLoading } = useSharePointGoals()

  const generateRecommendations = async () => {
    if (!familyId || !goalsData || goalsLoading) {
      setRecommendationsData(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Buscar último dignômetro da família
      const response = await fetch(`/api/families/${familyId}/dignometer/latest`)
      
      if (!response.ok) {
        if (response.status === 404) {
          // Família não tem dignômetro
          setRecommendationsData({
            family_id: familyId,
            assessment_id: null,
            total_recommendations: 0,
            critical_recommendations: 0,
            high_priority_recommendations: 0,
            recommendations_by_dimension: {},
            raw_recommendations: [],
            generated_from: 'sharepoint',
            generated_at: new Date().toISOString()
          })
          return
        }
        throw new Error('Erro ao buscar dignômetro da família')
      }

      const { dignometer } = await response.json()
      
      // Gerar recomendações baseadas no dignômetro
      const recommendations = generateRecommendationsFromDignometer(
        dignometer,
        goalsData
      )

      setRecommendationsData({
        family_id: familyId,
        assessment_id: dignometer.id,
        ...recommendations,
        generated_from: 'sharepoint',
        generated_at: new Date().toISOString()
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar recomendações')
      console.error('Erro ao gerar recomendações:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generateRecommendations()
  }, [familyId, goalsData, goalsLoading])

  const acceptRecommendation = async (recommendationId: string) => {
    try {
      if (!recommendationsData) return

      const recommendation = recommendationsData.raw_recommendations.find(r => r.id === recommendationId)
      if (!recommendation) throw new Error('Recomendação não encontrada')

      // Criar meta real na tabela family_goals
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          family_id: familyId,
          assessment_id: recommendationsData.assessment_id,
          goal_title: recommendation.goal,
          goal_category: `Meta baseada na pergunta: ${recommendation.question}`,
          current_status: 'ATIVA',
          source: 'sharepoint_recommendation',
          dimension_id: recommendation.dimension
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao criar meta')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Erro ao aceitar recomendação:', error)
      throw error
    }
  }

  const rejectRecommendation = async (recommendationId: string) => {
    try {
      // Para SharePoint, podemos apenas remover da lista local
      // ou implementar um sistema de tracking de rejeições
      console.log(`Recomendação ${recommendationId} rejeitada`)
      return { success: true, message: 'Recomendação rejeitada' }
    } catch (error) {
      console.error('Erro ao rejeitar recomendação:', error)
      throw error
    }
  }

  return { 
    data: recommendationsData, 
    loading: loading || goalsLoading, 
    error, 
    refetch: generateRecommendations,
    acceptRecommendation,
    rejectRecommendation
  }
}

// Função para gerar recomendações baseadas no dignômetro
function generateRecommendationsFromDignometer(
  dignometer: any, 
  goalsData: SharePointGoalsData
) {
  const recommendations: SharePointGoal[] = []
  const recommendationsByDimension: Record<string, SharePointGoal[]> = {}

  // Analisar cada dimensão do dignômetro
  const answers = dignometer.answers || {}
  
  Object.entries(answers).forEach(([dimension, value]) => {
    // Se a resposta for false (vulnerabilidade), gerar recomendações
    if (value === false && goalsData.goals_by_dimension[dimension]) {
      const dimensionGoals = goalsData.goals_by_dimension[dimension]
      
      dimensionGoals.forEach(goal => {
        recommendations.push(goal)
      })
      
      recommendationsByDimension[dimension] = dimensionGoals
    }
  })

  // Calcular estatísticas
  const totalRecommendations = recommendations.length
  const criticalRecommendations = recommendations.filter(r => r.priority === 'critical').length
  const highPriorityRecommendations = recommendations.filter(r => r.priority === 'high').length

  return {
    total_recommendations: totalRecommendations,
    critical_recommendations: criticalRecommendations,
    high_priority_recommendations: highPriorityRecommendations,
    recommendations_by_dimension: recommendationsByDimension,
    raw_recommendations: recommendations
  }
}

// Função auxiliar para obter cor da prioridade
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'medium':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'low':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Função auxiliar para obter ícone da prioridade
export function getPriorityIcon(priority: string): string {
  switch (priority) {
    case 'critical':
      return '🚨'
    case 'high':
      return '⚠️'
    case 'medium':
      return '📋'
    case 'low':
      return '📝'
    default:
      return '📋'
  }
}

// Função auxiliar para obter nome da dimensão em português
export function getDimensionLabel(dimension: string): string {
  const labels: Record<string, string> = {
    'moradia': 'Moradia',
    'agua': 'Água',
    'saneamento': 'Saneamento',
    'educacao': 'Educação',
    'saude': 'Saúde',
    'alimentacao': 'Alimentação',
    'renda_diversificada': 'Renda Diversificada',
    'renda_estavel': 'Renda Estável',
    'poupanca': 'Poupança',
    'bens_conectividade': 'Bens e Conectividade'
  }
  return labels[dimension] || dimension
}

// Função auxiliar para obter ícone da dimensão
export function getDimensionIcon(dimension: string): string {
  const icons: Record<string, string> = {
    'moradia': '🏠',
    'agua': '💧',
    'saneamento': '🚿',
    'educacao': '📚',
    'saude': '🏥',
    'alimentacao': '🍽️',
    'renda_diversificada': '💼',
    'renda_estavel': '💰',
    'poupanca': '🏦',
    'bens_conectividade': '📱'
  }
  return icons[dimension] || '📋'
}
