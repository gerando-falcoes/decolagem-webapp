import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WeeklyScoreData {
  week_start_date: string
  week_end_date: string
  year: number
  week_number: number
  average_score: number
  total_assessments: number
}

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
 * Obtém início e fim da semana (segunda a domingo)
 */
function getWeekDates(date: Date = new Date()): { start: Date, end: Date } {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Ajustar para segunda-feira
  
  const startOfWeek = new Date(d.setDate(diff))
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  return { start: startOfWeek, end: endOfWeek }
}

/**
 * Formata data para string YYYY-MM-DD
 */
function formatDateForDB(date: Date): string {
  return date.toISOString().split('T')[0]
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔄 Iniciando cálculo de pontuação semanal...')

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Determinar qual semana calcular (padrão: semana atual)
    const { searchParams } = new URL(req.url)
    const targetDate = searchParams.get('date') ? new Date(searchParams.get('date')!) : new Date()
    
    const { start: weekStart, end: weekEnd } = getWeekDates(targetDate)
    const year = weekStart.getFullYear()
    const weekNumber = getWeekNumber(weekStart)

    console.log(`📅 Calculando semana ${weekNumber}/${year}: ${formatDateForDB(weekStart)} a ${formatDateForDB(weekEnd)}`)

    // Buscar avaliações da semana
    const { data: assessments, error: assessmentsError } = await supabase
      .from('dignometro_assessments')
      .select('poverty_score, assessment_date')
      .gte('assessment_date', formatDateForDB(weekStart))
      .lte('assessment_date', formatDateForDB(weekEnd))
      .not('poverty_score', 'is', null)

    if (assessmentsError) {
      console.error('❌ Erro ao buscar avaliações:', assessmentsError)
      throw assessmentsError
    }

    console.log(`📊 Encontradas ${assessments?.length || 0} avaliações na semana`)

    if (!assessments || assessments.length === 0) {
      console.log('⚠️ Nenhuma avaliação encontrada para esta semana')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhuma avaliação encontrada para esta semana',
          week_data: {
            week_start_date: formatDateForDB(weekStart),
            week_end_date: formatDateForDB(weekEnd),
            year,
            week_number: weekNumber,
            total_assessments: 0
          }
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Calcular pontuação média
    const totalScore = assessments.reduce((sum, assessment) => sum + Number(assessment.poverty_score), 0)
    const averageScore = Number((totalScore / assessments.length).toFixed(2))

    console.log(`📈 Pontuação média calculada: ${averageScore} (baseada em ${assessments.length} avaliações)`)

    // Preparar dados para inserção/atualização
    const weeklyData: WeeklyScoreData = {
      week_start_date: formatDateForDB(weekStart),
      week_end_date: formatDateForDB(weekEnd),
      year,
      week_number: weekNumber,
      average_score: averageScore,
      total_assessments: assessments.length
    }

    // Inserir/atualizar registro semanal
    const { data: upsertData, error: upsertError } = await supabase
      .from('weekly_dignometro_scores')
      .upsert(
        {
          ...weeklyData,
          updated_at: new Date().toISOString()
        },
        { 
          onConflict: 'year,week_number',
          ignoreDuplicates: false
        }
      )
      .select()

    if (upsertError) {
      console.error('❌ Erro ao salvar dados semanais:', upsertError)
      throw upsertError
    }

    console.log('✅ Dados semanais salvos com sucesso:', upsertData)

    // Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: `Pontuação semanal calculada e salva com sucesso`,
        week_data: weeklyData,
        saved_record: upsertData?.[0] || null
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Erro na Edge Function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
