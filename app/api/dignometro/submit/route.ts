import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DiagnosticoService } from '@/lib/diagnostico'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    console.log('📊 API: Submetendo diagnóstico Dignômetro...')

    const body = await request.json()
    const { familyId, responses, userEmail } = body

    // Validações básicas
    if (!familyId || !responses || !userEmail) {
      console.error('❌ API: Dados obrigatórios ausentes')
      return NextResponse.json(
        { error: 'familyId, responses e userEmail são obrigatórios' },
        { status: 400 }
      )
    }

    if (typeof responses !== 'object' || Object.keys(responses).length === 0) {
      console.error('❌ API: Respostas inválidas')
      return NextResponse.json(
        { error: 'Respostas devem ser um objeto não vazio' },
        { status: 400 }
      )
    }

    // Calcular score (respostas_sim / total_perguntas) * 10
    const totalQuestions = Object.keys(responses).length
    const positiveResponses = Object.values(responses).filter(Boolean).length
    const score = (positiveResponses / totalQuestions) * 10

    console.log(`📈 API: Score calculado: ${score} (${positiveResponses}/${totalQuestions})`)

    // Determinar nível de pobreza
    const povertyLevel = DiagnosticoService.getPovertyLevel(score)

    console.log(`📊 API: Nível de pobreza: ${povertyLevel}`)

    // Criar dimension_scores (cada dimensão vale 1 se true, 0 se false)
    const dimensionScores = Object.entries(responses).reduce((acc, [key, value]) => {
      acc[key] = value ? 1 : 0
      return acc
    }, {} as Record<string, number>)

    // Inserir na tabela dignometro_assessments
    const assessmentData = {
      family_id: familyId,
      answers: responses,
      poverty_score: score,
      poverty_level: povertyLevel,
      dimension_scores: dimensionScores,
      assessment_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      created_at: new Date().toISOString()
    }

    console.log('💾 API: Inserindo dados no Supabase...', assessmentData)

    const { data: assessment, error: insertError } = await supabase
      .from('dignometro_assessments')
      .insert(assessmentData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ API: Erro ao inserir no Supabase:', insertError)
      return NextResponse.json(
        { error: `Erro ao salvar avaliação: ${insertError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ API: Diagnóstico salvo com sucesso:', assessment.id)

    return NextResponse.json({
      success: true,
      assessment,
      score,
      povertyLevel,
      message: 'Diagnóstico Dignômetro salvo com sucesso!'
    })

  } catch (error) {
    console.error('❌ API: Erro geral ao submeter diagnóstico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const familyId = searchParams.get('familyId')

    if (!familyId) {
      return NextResponse.json(
        { error: 'familyId é obrigatório' },
        { status: 400 }
      )
    }

    console.log(`🔍 API: Buscando histórico de avaliações para família ${familyId}`)

    const { data: assessments, error } = await supabase
      .from('dignometro_assessments')
      .select('*')
      .eq('family_id', familyId)
      .order('assessment_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ API: Erro ao buscar histórico:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log(`📊 API: Encontradas ${assessments?.length || 0} avaliações`)

    return NextResponse.json({
      success: true,
      assessments: assessments || []
    })

  } catch (error) {
    console.error('❌ API: Erro geral ao buscar histórico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
