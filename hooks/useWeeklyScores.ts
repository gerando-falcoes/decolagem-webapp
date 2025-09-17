import { useState, useEffect, useCallback } from 'react'

export interface WeeklyScoreData {
  id: string
  week: string
  weekNumber: number
  year: number
  startDate: string
  endDate: string
  score: number
  assessments: number
  label: string
  formattedDate: string
}

export interface WeeklyScoreStats {
  average: number
  highest: number
  lowest: number
  trend: 'up' | 'down' | 'stable'
  total_assessments: number
  weeks_with_data: number
}

export interface WeeklyScoresResponse {
  success: boolean
  data: WeeklyScoreData[]
  stats: WeeklyScoreStats
  meta: {
    total_records: number
    date_range: {
      from: string
      to: string
    } | null
    filters_applied: {
      limit?: number
      year?: string
      weeks?: string
    }
  }
}

export interface UseWeeklyScoresOptions {
  limit?: number
  year?: string
  weeks?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useWeeklyScores(options: UseWeeklyScoresOptions = {}) {
  const {
    limit = 12,
    year,
    weeks,
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000 // 5 minutos
  } = options

  const [data, setData] = useState<WeeklyScoreData[]>([])
  const [stats, setStats] = useState<WeeklyScoreStats | null>(null)
  const [meta, setMeta] = useState<WeeklyScoresResponse['meta'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  // Função para buscar dados
  const fetchWeeklyScores = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      setError(null)

      console.log('🔍 Buscando dados semanais:', { limit, year, weeks })

      // Construir URL com parâmetros
      const params = new URLSearchParams()
      if (limit) params.set('limit', limit.toString())
      if (year) params.set('year', year)
      if (weeks) params.set('weeks', weeks)

      const response = await fetch(`/api/weekly-scores?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Cache busting
        cache: 'no-cache'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro na resposta' }))
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`)
      }

      const result: WeeklyScoresResponse = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido')
      }

      console.log('📊 Dados semanais carregados:', result.data.length, 'registros')

      setData(result.data)
      setStats(result.stats)
      setMeta(result.meta)
      setLastFetch(new Date())

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados semanais'
      console.error('❌ Erro ao buscar dados semanais:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [limit, year, weeks])

  // Função para forçar recálculo
  const triggerRecalculation = useCallback(async (date?: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Forçando recálculo para:', date || 'semana atual')

      const response = await fetch('/api/weekly-scores/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao recalcular dados')
      }

      console.log('✅ Recálculo concluído, atualizando dados...')

      // Aguardar um pouco e depois buscar dados atualizados
      setTimeout(() => {
        fetchWeeklyScores(false)
      }, 1000)

      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao recalcular dados'
      console.error('❌ Erro no recálculo:', errorMessage)
      setError(errorMessage)
      throw err
    }
  }, [fetchWeeklyScores])

  // Função para refresh manual
  const refresh = useCallback(() => {
    return fetchWeeklyScores(true)
  }, [fetchWeeklyScores])

  // Effect para busca inicial
  useEffect(() => {
    fetchWeeklyScores(true)
  }, [fetchWeeklyScores])

  // Effect para auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh dos dados semanais')
      fetchWeeklyScores(false)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchWeeklyScores])

  // Dados derivados
  const hasData = data.length > 0
  const isStale = lastFetch ? Date.now() - lastFetch.getTime() > refreshInterval : true

  return {
    // Dados
    data,
    stats,
    meta,
    
    // Estados
    loading,
    error,
    hasData,
    isStale,
    lastFetch,
    
    // Ações
    refresh,
    triggerRecalculation,
    refetch: fetchWeeklyScores
  }
}
