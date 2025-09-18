import { NextRequest, NextResponse } from 'next/server'
import { supabaseServerClient } from '@/lib/supabase/server'

// API para detectar mudanças no dignômetro e gerar recomendações automáticas
export async function POST(request: NextRequest) {
  try {
    const { family_id, answers } = await request.json()
    
    if (!family_id || !answers) {
      return NextResponse.json({ 
        error: 'family_id e answers são obrigatórios' 
      }, { status: 400 })
    }

    const supabase = supabaseServerClient
    
    // 1. Verificar se dignômetro existe
    const { data: existingDignometer, error: fetchError } = await supabase
      .from('dignometro_assessments')
      .select('id, answers, created_at')
      .eq('family_id', family_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Erro ao buscar dignômetro:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // 2. Comparar respostas (se houver dignômetro anterior)
    let isNewVulnerability = false
    let changedDimensions: string[] = []
    
    if (existingDignometer) {
      const oldAnswers = existingDignometer.answers || {}
      
      Object.keys(answers).forEach(dimension => {
        const oldValue = oldAnswers[dimension]
        const newValue = answers[dimension]
        
        // Nova vulnerabilidade: antes true/undefined, agora false
        if ((oldValue === true || oldValue === undefined) && newValue === false) {
          isNewVulnerability = true
          changedDimensions.push(dimension)
        }
      })
    } else {
      // Primeiro dignômetro - todas as dimensões false são vulnerabilidades
      Object.keys(answers).forEach(dimension => {
        if (answers[dimension] === false) {
          isNewVulnerability = true
          changedDimensions.push(dimension)
        }
      })
    }

    // 3. Gerar recomendações automáticas se houver vulnerabilidades
    let autoRecommendations: any[] = []
    
    if (isNewVulnerability && changedDimensions.length > 0) {
      // Usar metas pré-definidas (fallback caso SharePoint não funcione)
      const fallbackGoals = {
        agua: [
          { goal: 'Garantir água potável', priority_level: 'critical', question: 'A família tem acesso à água potável?' },
          { goal: 'Fazer limpeza da caixa d\'água', priority_level: 'medium', question: 'A caixa d\'água é limpa regularmente?' },
          { goal: 'Resolver problemas de abastecimento', priority_level: 'high', question: 'Há interrupções no abastecimento?' }
        ],
        saneamento: [
          { goal: 'Instalar vaso sanitário', priority_level: 'high', question: 'A moradia possui vaso sanitário?' },
          { goal: 'Conectar à rede de esgoto', priority_level: 'critical', question: 'Está ligada à rede de esgoto?' },
          { goal: 'Reduzir compartilhamento do banheiro', priority_level: 'medium', question: 'Quantas famílias compartilham o banheiro?' }
        ],
        saude: [
          { goal: 'Cadastrar no posto de saúde', priority_level: 'high', question: 'Todos estão cadastrados no posto?' },
          { goal: 'Organizar documentos de saúde', priority_level: 'medium', question: 'Documentos estão organizados?' },
          { goal: 'Montar farmácia caseira', priority_level: 'low', question: 'Possui farmácia caseira básica?' }
        ]
      }
      
      // Gerar recomendações para cada dimensão vulnerável
      changedDimensions.forEach(dimension => {
        const dimensionGoals = fallbackGoals[dimension as keyof typeof fallbackGoals] || []
        dimensionGoals.forEach(goalTemplate => {
          autoRecommendations.push({
            id: `auto_${family_id}_${dimension}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            dimension: dimension,
            goal: goalTemplate.goal,
            question: goalTemplate.question,
            priority_level: goalTemplate.priority_level,
            generated_at: new Date().toISOString(),
            trigger_source: 'dignometer_change',
            family_id: family_id,
            auto_generated: true,
            status: 'pending_selection'
          })
        })
      })
    }

    // 4. Salvar recomendações no cache (localStorage será usado no frontend)
    // Por enquanto, retornar as recomendações para o frontend gerenciar

    const result = {
      success: true,
      data: {
        family_id,
        has_new_vulnerabilities: isNewVulnerability,
        changed_dimensions: changedDimensions,
        auto_recommendations: autoRecommendations,
        total_recommendations: autoRecommendations.length,
        recommendations_by_dimension: autoRecommendations.reduce((acc: any, rec: any) => {
          (acc[rec.dimension] = acc[rec.dimension] || []).push(rec)
          return acc
        }, {}),
        trigger_info: {
          timestamp: new Date().toISOString(),
          trigger_type: existingDignometer ? 'dignometer_update' : 'dignometer_create',
          previous_dignometer_id: existingDignometer?.id || null
        }
      }
    }

    console.log('🎯 Trigger dignômetro executado:', {
      family_id,
      vulnerabilities: isNewVulnerability,
      dimensions: changedDimensions,
      recommendations: autoRecommendations.length
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Erro no trigger do dignômetro:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

// API para buscar recomendações automáticas de uma família
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const family_id = searchParams.get('family_id')
    
    if (!family_id) {
      return NextResponse.json({ 
        error: 'family_id é obrigatório' 
      }, { status: 400 })
    }

    // Buscar último dignômetro da família
    const dignometerResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/families/${family_id}/dignometer/latest`)
    
    if (!dignometerResponse.ok) {
      return NextResponse.json({
        success: true,
        data: {
          family_id,
          has_dignometer: false,
          auto_recommendations: [],
          message: 'Família não possui dignômetro'
        }
      })
    }

    const dignometerResponse_data = await dignometerResponse.json()
    
    // Verificar se há dignômetro e extrair respostas
    if (!dignometerResponse_data.success || !dignometerResponse_data.dignometer) {
      return NextResponse.json({
        success: true,
        data: {
          family_id,
          has_dignometer: false,
          auto_recommendations: [],
          message: 'Família não possui dignômetro'
        }
      })
    }
    
    const dignometerData = dignometerResponse_data.dignometer.answers
    
    // Usar metas pré-definidas (fallback)
    const fallbackGoals = {
      agua: [
        { goal: 'Garantir água potável', priority_level: 'critical', question: 'A família tem acesso à água potável?' },
        { goal: 'Fazer limpeza da caixa d\'água', priority_level: 'medium', question: 'A caixa d\'água é limpa regularmente?' },
        { goal: 'Resolver problemas de abastecimento', priority_level: 'high', question: 'Há interrupções no abastecimento?' }
      ],
      saneamento: [
        { goal: 'Instalar vaso sanitário', priority_level: 'high', question: 'A moradia possui vaso sanitário?' },
        { goal: 'Conectar à rede de esgoto', priority_level: 'critical', question: 'Está ligada à rede de esgoto?' },
        { goal: 'Reduzir compartilhamento do banheiro', priority_level: 'medium', question: 'Quantas famílias compartilham o banheiro?' }
      ],
      saude: [
        { goal: 'Cadastrar no posto de saúde', priority_level: 'high', question: 'Todos estão cadastrados no posto?' },
        { goal: 'Organizar documentos de saúde', priority_level: 'medium', question: 'Documentos estão organizados?' },
        { goal: 'Montar farmácia caseira', priority_level: 'low', question: 'Possui farmácia caseira básica?' }
      ]
    }

    // Gerar recomendações para dimensões vulneráveis (false)
    const vulnerableDimensions = Object.keys(dignometerData).filter(
      dimension => dignometerData[dimension] === false
    )

    const autoRecommendations: any[] = []
    vulnerableDimensions.forEach(dimension => {
      const dimensionGoals = fallbackGoals[dimension as keyof typeof fallbackGoals] || []
      dimensionGoals.forEach(goalTemplate => {
        autoRecommendations.push({
          id: `auto_${family_id}_${dimension}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dimension: dimension,
          goal: goalTemplate.goal,
          question: goalTemplate.question,
          priority_level: goalTemplate.priority_level,
          generated_at: new Date().toISOString(),
          trigger_source: 'dignometer_current',
          family_id: family_id,
          auto_generated: true,
          status: 'pending_selection'
        })
      })
    })

    return NextResponse.json({
      success: true,
      data: {
        family_id,
        has_dignometer: true,
        vulnerable_dimensions: vulnerableDimensions,
        auto_recommendations: autoRecommendations,
        total_recommendations: autoRecommendations.length,
        recommendations_by_dimension: autoRecommendations.reduce((acc: any, rec: any) => {
          (acc[rec.dimension] = acc[rec.dimension] || []).push(rec)
          return acc
        }, {}),
        dignometer_answers: dignometerData
      }
    })

  } catch (error) {
    console.error('Erro ao buscar recomendações automáticas:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
