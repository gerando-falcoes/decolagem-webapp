import { useState, useEffect, useCallback, useRef } from 'react'

// Interface para recomendações automáticas
interface AutoRecommendation {
  id: string
  dimension: string
  question: string
  goal: string
  priority_level: 'critical' | 'high' | 'medium' | 'low'
  generated_at: string
  trigger_source: 'dignometer_change' | 'dignometer_current'
  family_id: string
  auto_generated: boolean
  status: 'pending_selection' | 'selected' | 'rejected'
}

interface DignometerTriggersData {
  family_id: string
  has_dignometer: boolean
  has_new_vulnerabilities?: boolean
  vulnerable_dimensions: string[]
  auto_recommendations: AutoRecommendation[]
  total_recommendations: number
  recommendations_by_dimension: { [key: string]: AutoRecommendation[] }
  dignometer_answers?: { [key: string]: boolean }
  trigger_info?: {
    timestamp: string
    trigger_type: 'dignometer_create' | 'dignometer_update'
    previous_dignometer_id?: string | null
  }
}

interface UseDignometerTriggersReturn {
  data: DignometerTriggersData | null
  loading: boolean
  error: string | null
  
  // Funções para gerenciar recomendações
  refreshRecommendations: () => Promise<void>
  selectRecommendation: (recommendationId: string) => Promise<boolean>
  rejectRecommendation: (recommendationId: string) => Promise<boolean>
  getSelectedRecommendations: () => AutoRecommendation[]
  clearSelectedRecommendations: () => void
  
  // Função para criar meta real a partir de recomendação
  createGoalFromRecommendation: (recommendation: AutoRecommendation, settings?: {target_date: string, priority: string}) => Promise<boolean>
  
  // Função para limpar cache e forçar refresh
  clearCacheAndRefresh: () => void
  
  // Trigger manual para detectar mudanças
  triggerDignometerCheck: (answers: { [key: string]: boolean }) => Promise<void>
}

const CACHE_KEY_PREFIX = 'dignometer_auto_recommendations_'
const CACHE_EXPIRY_HOURS = 24

// Hook para gerenciar triggers automáticos do dignômetro
export function useDignometerTriggers(familyId: string | null): UseDignometerTriggersReturn {
  const [data, setData] = useState<DignometerTriggersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastFetchRef = useRef<string | null>(null)

  // Cache helpers
  const getCacheKey = useCallback(() => {
    return familyId ? `${CACHE_KEY_PREFIX}${familyId}` : null
  }, [familyId])

  const getCachedData = useCallback((): DignometerTriggersData | null => {
    if (typeof window === 'undefined') return null
    
    const cacheKey = getCacheKey()
    if (!cacheKey) return null

    try {
      const cached = localStorage.getItem(cacheKey)
      if (!cached) return null

      const parsed = JSON.parse(cached)
      const now = new Date().getTime()
      const cacheTime = new Date(parsed.cached_at).getTime()
      const expiryTime = CACHE_EXPIRY_HOURS * 60 * 60 * 1000

      if (now - cacheTime > expiryTime) {
        localStorage.removeItem(cacheKey)
        return null
      }

      return parsed.data
    } catch (err) {
      console.error('Erro ao ler cache de recomendações:', err)
      return null
    }
  }, [getCacheKey])

  const setCachedData = useCallback((newData: DignometerTriggersData) => {
    if (typeof window === 'undefined') return
    
    const cacheKey = getCacheKey()
    if (!cacheKey) return

    try {
      const cacheEntry = {
        data: newData,
        cached_at: new Date().toISOString()
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry))
    } catch (err) {
      console.error('Erro ao salvar cache de recomendações:', err)
    }
  }, [getCacheKey])

  // Função para buscar recomendações automáticas
  const fetchAutoRecommendations = useCallback(async () => {
    if (!familyId) {
      setData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Buscando recomendações automáticas para família:', familyId)
      
      const response = await fetch(`/api/dignometer/triggers?family_id=${familyId}`)
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Recomendações automáticas encontradas:', {
          total: result.data.total_recommendations,
          dimensions: result.data.vulnerable_dimensions
        })
        
        setData(result.data)
        setCachedData(result.data)
      } else {
        throw new Error(result.error || 'Erro ao buscar recomendações')
      }
    } catch (err) {
      console.error('❌ Erro ao buscar recomendações automáticas:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      
      // Tentar usar dados do cache em caso de erro
      const cachedData = getCachedData()
      if (cachedData) {
        setData(cachedData)
        setError('Usando dados em cache (offline)')
      }
    } finally {
      setLoading(false)
    }
  }, [familyId, setCachedData, getCachedData])

  // Função para refresh manual
  const refreshRecommendations = useCallback(async () => {
    await fetchAutoRecommendations()
  }, [fetchAutoRecommendations])

  // Função para selecionar uma recomendação
  const selectRecommendation = useCallback(async (recommendationId: string): Promise<boolean> => {
    if (!data) return false

    try {
      const updatedRecommendations = data.auto_recommendations.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, status: 'selected' as const }
          : rec
      )

      const updatedData = {
        ...data,
        auto_recommendations: updatedRecommendations
      }

      setData(updatedData)
      setCachedData(updatedData)
      
      console.log('✅ Recomendação selecionada:', recommendationId)
      return true
    } catch (err) {
      console.error('❌ Erro ao selecionar recomendação:', err)
      return false
    }
  }, [data, setCachedData])

  // Função para rejeitar uma recomendação
  const rejectRecommendation = useCallback(async (recommendationId: string): Promise<boolean> => {
    if (!data) return false

    try {
      const updatedRecommendations = data.auto_recommendations.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, status: 'rejected' as const }
          : rec
      )

      const updatedData = {
        ...data,
        auto_recommendations: updatedRecommendations
      }

      setData(updatedData)
      setCachedData(updatedData)
      
      console.log('❌ Recomendação rejeitada:', recommendationId)
      return true
    } catch (err) {
      console.error('❌ Erro ao rejeitar recomendação:', err)
      return false
    }
  }, [data, setCachedData])

  // Função para obter recomendações selecionadas
  const getSelectedRecommendations = useCallback((): AutoRecommendation[] => {
    if (!data) return []
    return data.auto_recommendations.filter(rec => rec.status === 'selected')
  }, [data])

  // Função para limpar seleções
  const clearSelectedRecommendations = useCallback(() => {
    if (!data) return

    const updatedRecommendations = data.auto_recommendations.map(rec => ({
      ...rec,
      status: 'pending_selection' as const
    }))

    const updatedData = {
      ...data,
      auto_recommendations: updatedRecommendations
    }

    setData(updatedData)
    setCachedData(updatedData)
  }, [data, setCachedData])

  // Função para limpar cache e forçar refresh
  const clearCacheAndRefresh = useCallback(() => {
    if (typeof window !== 'undefined') {
      const cacheKey = getCacheKey()
      if (cacheKey) {
        localStorage.removeItem(cacheKey)
        console.log('🗑️ Cache limpo para forçar refresh')
      }
    }
    // Recarregar dados do servidor
    fetchAutoRecommendations()
  }, [getCacheKey, fetchAutoRecommendations])

  // Função para criar meta real a partir de recomendação
  const createGoalFromRecommendation = useCallback(async (recommendation: AutoRecommendation, settings?: {target_date: string, priority: string}): Promise<boolean> => {
    if (!familyId) return false

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          family_id: familyId,
          goal_title: recommendation.goal_name,
          goal_category: `Meta gerada automaticamente - ${recommendation.dimension}`,
          target_date: settings?.target_date,
          current_status: 'PENDENTE',
          notes: `Meta gerada automaticamente a partir do dignômetro. Dimensão: ${recommendation.dimension}. Prioridade definida pelo mentor: ${settings?.priority || 'não definida'}.`,
          source: 'auto_recommendation',
          recommendation_id: recommendation.id,
          priority: settings?.priority
        })
      })

      if (!response.ok) {
        throw new Error(`Erro ao criar meta: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Meta criada a partir de recomendação:', recommendation.id)
        console.log('🔍 Debug - Dados antes da remoção:', {
          total_antes: data?.total_recommendations,
          recomendacoes_antes: data?.auto_recommendations?.length,
          id_a_remover: recommendation.id
        })
        
        // Remover recomendação da lista ao criar meta
        const updatedRecommendations = data?.auto_recommendations.filter(rec => {
          const shouldKeep = rec.id !== recommendation.id
          if (!shouldKeep) {
            console.log('🗑️ Removendo recomendação da lista:', rec.id, rec.goal_name)
          }
          return shouldKeep
        }) || []

        console.log('🔍 Debug - Após remoção:', {
          total_antes: data?.auto_recommendations?.length,
          total_depois: updatedRecommendations.length,
          recomendacao_removida: !updatedRecommendations.find(r => r.id === recommendation.id),
          ids_restantes: updatedRecommendations.map(r => r.id)
        })

        if (data) {
          const updatedData = {
            ...data,
            auto_recommendations: updatedRecommendations,
            total_recommendations: updatedRecommendations.length, // Total de recomendações restantes
            critical_recommendations: updatedRecommendations.filter(rec => rec.priority_level === 'critical').length,
            selected_recommendations: updatedRecommendations.filter(rec => rec.status === 'selected').length
          }

          console.log('💾 Atualizando estado e cache...')
          setData(updatedData)
          setCachedData(updatedData)
          
          console.log(`📊 Recomendações restantes: ${updatedRecommendations.length} (removida: ${recommendation.goal_name})`)
        } else {
          console.log('❌ ERRO: data é null, não foi possível atualizar estado!')
        }
        
        return true
      } else {
        throw new Error(result.error || 'Erro ao criar meta')
      }
    } catch (err) {
      console.error('❌ Erro ao criar meta a partir de recomendação:', err)
      return false
    }
  }, [familyId, data, setCachedData])

  // Função para trigger manual de mudanças no dignômetro
  const triggerDignometerCheck = useCallback(async (answers: { [key: string]: boolean }) => {
    if (!familyId) return

    try {
      console.log('🎯 Executando trigger manual do dignômetro:', { familyId, answers })
      
      const response = await fetch('/api/dignometer/triggers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          family_id: familyId,
          answers: answers
        })
      })

      if (!response.ok) {
        throw new Error(`Erro no trigger: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data.has_new_vulnerabilities) {
        console.log('🎯 Novas vulnerabilidades detectadas, atualizando recomendações...')
        
        // Mesclar novas recomendações com as existentes (evitar duplicatas)
        const existingIds = data?.auto_recommendations.map(rec => rec.id) || []
        const newRecommendations = result.data.auto_recommendations.filter((rec: AutoRecommendation) => 
          !existingIds.includes(rec.id)
        )

        const allRecommendations = [
          ...(data?.auto_recommendations || []),
          ...newRecommendations
        ]

        const updatedData = {
          ...result.data,
          auto_recommendations: allRecommendations,
          total_recommendations: allRecommendations.length
        }

        setData(updatedData)
        setCachedData(updatedData)
      }
    } catch (err) {
      console.error('❌ Erro no trigger manual do dignômetro:', err)
    }
  }, [familyId, data, setCachedData])

  // Effect para carregar dados iniciais
  useEffect(() => {
    if (!familyId) {
      setData(null)
      setLoading(false)
      return
    }

    // Evitar fetch duplicado
    if (lastFetchRef.current === familyId) return
    lastFetchRef.current = familyId

    // Tentar cache primeiro
    const cachedData = getCachedData()
    if (cachedData) {
      setData(cachedData)
      setLoading(false)
      setError(null)
      return
    }

    // Carregar dados do servidor
    fetchAutoRecommendations()
  }, [familyId, getCachedData, fetchAutoRecommendations])

  return {
    data,
    loading,
    error,
    refreshRecommendations,
    selectRecommendation,
    rejectRecommendation,
    getSelectedRecommendations,
    clearSelectedRecommendations,
    createGoalFromRecommendation,
    clearCacheAndRefresh,
    triggerDignometerCheck
  }
}
