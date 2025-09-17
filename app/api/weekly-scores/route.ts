import { NextRequest, NextResponse } from 'next/server'
import { supabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Calcula o número da semana do ano
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

/**
 * GET /api/weekly-scores
 * Busca dados históricos de pontuação semanal do dignômetro
 * 
 * Query params:
 * - limit: número máximo de semanas (default: 12)
 * - year: ano específico (opcional)
 * - weeks: número de semanas a partir da atual (opcional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '12')
    const year = searchParams.get('year')
    const weeks = searchParams.get('weeks')

    console.log('🔍 Buscando dados semanais da tabela weekly_dignometro_scores:', { limit, year, weeks })

    // Inicializar cliente Supabase
    const supabase = supabaseServerClient

    // Buscar dados diretamente da tabela weekly_dignometro_scores
    let query = supabase
      .from('weekly_dignometro_scores')
      .select(`
        id,
        week_start_date,
        week_end_date,
        year,
        week_number,
        average_score,
        total_assessments,
        created_at,
        updated_at
      `)
      .order('week_start_date', { ascending: false })

    // Filtrar por ano se especificado
    if (year) {
      query = query.eq('year', parseInt(year))
    }

    // Aplicar limite
    if (weeks) {
      // Se especificado número de semanas, calcular a partir da data atual
      const currentDate = new Date()
      const weeksAgo = new Date()
      weeksAgo.setDate(currentDate.getDate() - (parseInt(weeks) * 7))
      
      query = query.gte('week_start_date', weeksAgo.toISOString().split('T')[0])
    } else {
      // Usar limite padrão
      query = query.limit(limit)
    }

    // Executar query
    const { data: weeklyScores, error } = await query

    if (error) {
      console.error('❌ Erro ao buscar dados semanais:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar dados semanais', details: error.message },
        { status: 500 }
      )
    }

    console.log(`📊 Encontrados ${weeklyScores?.length || 0} registros semanais da tabela weekly_dignometro_scores`)

    // Formatar dados para o gráfico
    const chartData = weeklyScores?.map(score => ({
      id: score.id,
      week: `Sem ${score.week_number}/${score.year}`,
      weekNumber: score.week_number,
      year: score.year,
      startDate: score.week_start_date,
      endDate: score.week_end_date,
      score: score.average_score || 0,
      assessments: score.total_assessments || 0,
      label: `${score.week_start_date} - ${score.week_end_date}`,
      formattedDate: formatWeekRange(score.week_start_date, score.week_end_date)
    })) || []

    // Reverter ordem para mostrar cronologicamente (mais antiga primeiro)
    chartData.reverse()

    // Estatísticas adicionais
    const stats = calculateStats(chartData)

    return NextResponse.json({
      success: true,
      data: chartData,
      stats,
      meta: {
        total_records: chartData.length,
        date_range: chartData.length > 0 ? {
          from: chartData[0]?.startDate,
          to: chartData[chartData.length - 1]?.startDate
        } : null,
        filters_applied: { limit, year, weeks }
      }
    })

  } catch (error) {
    console.error('❌ Erro interno no endpoint weekly-scores:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/weekly-scores/calculate
 * Força recálculo da pontuação semanal via Edge Function
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { date } = body

    console.log('🔄 Forçando recálculo semanal para:', date || 'semana atual')

    // Obter URL e chave do Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Configuração do Supabase não encontrada')
    }

    // Chamar Edge Function
    const functionUrl = `${supabaseUrl}/functions/v1/calculate-weekly-scores${date ? `?date=${date}` : ''}`
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Erro na execução da Edge Function')
    }

    console.log('✅ Recálculo concluído:', result)

    return NextResponse.json({
      success: true,
      message: 'Pontuação semanal recalculada com sucesso',
      result
    })

  } catch (error) {
    console.error('❌ Erro ao forçar recálculo:', error)
    return NextResponse.json(
      { error: 'Erro ao recalcular pontuação semanal', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

/**
 * Formata range de datas da semana para exibição
 */
function formatWeekRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const startFormatted = start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const endFormatted = end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  
  return `${startFormatted} - ${endFormatted}`
}

/**
 * Calcula estatísticas dos dados semanais
 */
function calculateStats(data: any[]) {
  if (data.length === 0) {
    return {
      average: 0,
      highest: 0,
      lowest: 0,
      trend: 'stable',
      total_assessments: 0
    }
  }

  const scores = data.map(d => d.score).filter(s => s > 0)
  const assessments = data.map(d => d.assessments)
  
  const average = scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)) : 0
  const highest = Math.max(...scores, 0)
  const lowest = Math.min(...scores.filter(s => s > 0), 0) || 0
  const totalAssessments = assessments.reduce((a, b) => a + b, 0)

  // Calcular tendência (últimas 4 semanas vs 4 anteriores)
  let trend = 'stable'
  if (data.length >= 8) {
    const recent = data.slice(-4).map(d => d.score).filter(s => s > 0)
    const previous = data.slice(-8, -4).map(d => d.score).filter(s => s > 0)
    
    if (recent.length > 0 && previous.length > 0) {
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
      const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length
      const change = ((recentAvg - previousAvg) / previousAvg) * 100
      
      if (change > 5) trend = 'up'
      else if (change < -5) trend = 'down'
    }
  }

  return {
    average,
    highest,
    lowest,
    trend,
    total_assessments: totalAssessments,
    weeks_with_data: scores.length
  }
}
