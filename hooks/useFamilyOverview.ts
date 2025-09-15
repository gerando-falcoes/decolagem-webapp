import { useState, useEffect } from 'react'
import { supabaseBrowserClient } from '@/lib/supabase/browser'

// Types baseados na view family_overview
export interface FamilyOverview {
  // Informações básicas da família
  family_id: string
  family_name: string
  phone: string | null
  whatsapp: string | null
  email: string | null
  family_size: number | null
  children_count: number | null
  family_status: string | null
  income_range: string | null
  
  // Endereço
  full_address: string | null
  reference_point: string | null
  
  // Informações do mentor
  mentor_email: string | null
  mentor_name: string | null
  mentor_phone: string | null
  mentor_role: string | null
  
  // Avaliação mais recente
  latest_assessment_id: string | null
  current_poverty_score: number | null
  current_poverty_level: string | null
  current_dimension_scores: any | null
  latest_assessment_date: string | null
  
  // Histórico de avaliações
  total_assessments: number
  first_assessment_date: string | null
  last_assessment_date: string | null
  
  // Resumo das metas
  total_goals: number
  active_goals: number
  completed_goals: number
  suggested_goals: number
  avg_goal_progress: number
  
  // Status e classificações
  assessment_status: 'Avaliado' | 'Não Avaliado'
  dignity_classification: 'Dignidade' | 'Vulnerabilidade' | 'Pobreza' | 'Não Classificado'
  
  // Timestamps
  family_created_at: string
  family_updated_at: string | null
  
  // Indicadores calculados
  has_active_mentor: boolean
  has_active_goals: boolean
  days_since_last_assessment: number | null
  overall_progress_score: number | null
}

// Hook para buscar todas as famílias
export function useFamilyOverview() {
  const [families, setFamilies] = useState<FamilyOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFamilies() {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabaseBrowserClient
          .from('family_overview')
          .select('*')
          .order('family_name')

        if (error) {
          setError(error.message)
          return
        }

        setFamilies(data || [])
      } catch (err) {
        setError('Erro ao carregar famílias')
        console.error('Erro ao buscar famílias:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFamilies()
  }, [])

  return { families, loading, error, refetch: () => fetchFamilies() }
}

// Hook para buscar uma família específica
export function useFamilyById(familyId: string | null) {
  const [family, setFamily] = useState<FamilyOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!familyId) {
      setFamily(null)
      setLoading(false)
      return
    }

    async function fetchFamily() {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabaseBrowserClient
          .from('family_overview')
          .select('*')
          .eq('family_id', familyId)
          .single()

        if (error) {
          setError(error.message)
          return
        }

        setFamily(data)
      } catch (err) {
        setError('Erro ao carregar família')
        console.error('Erro ao buscar família:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFamily()
  }, [familyId])

  return { family, loading, error, refetch: () => fetchFamily() }
}

// Hook para buscar estatísticas do dashboard
export function useFamilyStatistics() {
  const [stats, setStats] = useState<{
    total_families: number
    families_assessed: number
    families_with_mentor: number
    families_with_active_goals: number
    avg_poverty_score: number | null
    families_in_dignity: number
    families_in_poverty: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)

        // Query para estatísticas agregadas
        const { data, error } = await supabaseBrowserClient
          .rpc('get_family_statistics')
          .single()

        if (error) {
          // Se a função RPC não existir, fazer a query manualmente
          const { data: families, error: familiesError } = await supabaseBrowserClient
            .from('family_overview')
            .select('*')

          if (familiesError) {
            setError(familiesError.message)
            return
          }

          // Calcular estatísticas manualmente
          const stats = {
            total_families: families.length,
            families_assessed: families.filter(f => f.assessment_status === 'Avaliado').length,
            families_with_mentor: families.filter(f => f.has_active_mentor).length,
            families_with_active_goals: families.filter(f => f.has_active_goals).length,
            avg_poverty_score: families.length > 0 
              ? families.reduce((sum, f) => sum + (f.current_poverty_score || 0), 0) / families.length 
              : null,
            families_in_dignity: families.filter(f => f.dignity_classification === 'Dignidade').length,
            families_in_poverty: families.filter(f => f.dignity_classification === 'Pobreza').length,
          }

          setStats(stats)
        } else {
          setStats(data)
        }
      } catch (err) {
        setError('Erro ao carregar estatísticas')
        console.error('Erro ao buscar estatísticas:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error, refetch: () => fetchStats() }
}

// Hook para buscar famílias que precisam de atenção
export function useFamiliesNeedingAttention() {
  const [families, setFamilies] = useState<FamilyOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFamilies() {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabaseBrowserClient
          .from('family_overview')
          .select('*')
          .or(`assessment_status.eq.Não Avaliado,has_active_mentor.eq.false,days_since_last_assessment.gt.90`)
          .order('days_since_last_assessment', { ascending: false, nullsLast: true })

        if (error) {
          setError(error.message)
          return
        }

        setFamilies(data || [])
      } catch (err) {
        setError('Erro ao carregar famílias que precisam de atenção')
        console.error('Erro:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFamilies()
  }, [])

  return { families, loading, error, refetch: () => fetchFamilies() }
}

// Função auxiliar para formattar endereço
export function formatAddress(family: FamilyOverview): string {
  const parts = [
    family.full_address,
    family.reference_point
  ].filter(Boolean)
  
  return parts.join(' - ') || 'Endereço não informado'
}

// Função auxiliar para obter cor baseada na classificação
export function getClassificationColor(classification: string): string {
  switch (classification) {
    case 'Dignidade':
      return 'text-green-600 bg-green-100'
    case 'Vulnerabilidade':
      return 'text-yellow-600 bg-yellow-100'
    case 'Pobreza':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

// Função auxiliar para obter ícone baseado no status
export function getStatusIcon(status: string): string {
  switch (status) {
    case 'Avaliado':
      return '✅'
    case 'Não Avaliado':
      return '⏳'
    default:
      return '❓'
  }
}
