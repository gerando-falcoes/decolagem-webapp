import { NextRequest, NextResponse } from 'next/server'
import { supabaseServerClient } from '@/lib/supabase/server'

// API para buscar recomendações de metas baseadas no último dignometro da família
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const familyId = params.id
    
    if (!familyId) {
      return NextResponse.json({ 
        error: 'ID da família é obrigatório' 
      }, { status: 400 })
    }

    console.log('🔍 Buscando recomendações de metas para família:', familyId)

    // 1. Buscar o último dignometro da família
    const { data: lastAssessment, error: assessmentError } = await supabaseServerClient
      .from('dignometro_assessments')
      .select('id, answers, assessment_date, created_at')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (assessmentError) {
      if (assessmentError.code === 'PGRST116') {
        return NextResponse.json({
          success: true,
          data: {
            family_id: familyId,
            has_assessment: false,
            recommendations: [],
            message: 'Família ainda não possui dignometro respondido'
          }
        })
      }
      throw assessmentError
    }

    if (!lastAssessment || !lastAssessment.answers) {
      return NextResponse.json({
        success: true,
        data: {
          family_id: familyId,
          has_assessment: false,
          recommendations: [],
          message: 'Dignometro não possui respostas válidas'
        }
      })
    }

    console.log('📊 Dignometro encontrado:', {
      id: lastAssessment.id,
      date: lastAssessment.assessment_date,
      respostas: Object.keys(lastAssessment.answers).length
    })

    // 2. Mapear dimensões do dignometro para dimensões da goal_templates
    const dimensionMapping: { [key: string]: string } = {
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

    // 3. Identificar dimensões vulneráveis (respostas false)
    const vulnerableDimensions: string[] = []
    const answers = lastAssessment.answers as { [key: string]: boolean }
    
    Object.entries(answers).forEach(([key, value]) => {
      if (value === false) {
        const mappedDimension = dimensionMapping[key]
        if (mappedDimension) {
          vulnerableDimensions.push(mappedDimension)
        } else {
          console.warn(`⚠️ Dimensão não mapeada: ${key}`)
        }
      }
    })

    console.log('🚨 Dimensões vulneráveis:', vulnerableDimensions)

    if (vulnerableDimensions.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          family_id: familyId,
          has_assessment: true,
          assessment_id: lastAssessment.id,
          assessment_date: lastAssessment.assessment_date,
          recommendations: [],
          message: 'Família não possui vulnerabilidades detectadas no último dignometro'
        }
      })
    }

    // 4. Buscar metas recomendadas para cada dimensão vulnerável
    let allRecommendations: any[] = []

    // Primeiro, buscar metas já atribuídas à família para filtrar
    const { data: existingAssignments, error: assignmentsError } = await supabaseServerClient
      .from('family_goal_assignments')
      .select('family_goal_id')
      .eq('family_id', familyId)

    if (assignmentsError) {
      console.error('❌ Erro ao buscar assignments existentes:', assignmentsError)
    }

    const assignedTemplateIds = new Set(
      existingAssignments?.map(assignment => assignment.family_goal_id) || []
    )

    console.log(`🔍 Metas já atribuídas à família: ${assignedTemplateIds.size}`)

    for (const dimension of vulnerableDimensions) {
      const { data: goalTemplates, error: templatesError } = await supabaseServerClient
        .from('goal_templates')
        .select('id, goal_name, goal_description, dimension, order_priority')
        .eq('dimension', dimension)
        .eq('is_active', true)
        .order('order_priority', { ascending: true })
        .limit(5) // Buscar mais para compensar as já atribuídas

      if (templatesError) {
        console.error(`❌ Erro ao buscar metas para dimensão ${dimension}:`, templatesError)
        continue
      }

      if (goalTemplates && goalTemplates.length > 0) {
        // Filtrar metas já atribuídas e limitar a 3
        const availableTemplates = goalTemplates
          .filter(template => !assignedTemplateIds.has(template.id))
          .slice(0, 3)

        // Calcular prioridade baseada no número de vulnerabilidades
        const getPriorityLevel = (vulnerableCount: number): 'low' | 'medium' | 'high' => {
          if (vulnerableCount <= 2) return 'low'
          if (vulnerableCount <= 5) return 'medium'
          return 'high'
        }

        const dimensionRecommendations = availableTemplates.map(template => ({
          id: `rec_${familyId}_${template.id}_${Date.now()}`,
          goal_template_id: template.id,
          goal_name: template.goal_name,
          goal_description: template.goal_description,
          dimension: template.dimension,
          priority_level: getPriorityLevel(vulnerableDimensions.length),
          order_priority: template.order_priority,
          source: 'dignometer_recommendation',
          assessment_id: lastAssessment.id,
          family_id: familyId
        }))
        
        allRecommendations.push(...dimensionRecommendations)
        console.log(`✅ ${dimensionRecommendations.length} metas novas encontradas para ${dimension} (${goalTemplates.length - availableTemplates.length} já atribuídas)`)
      }
    }

    // 5. Ordenar recomendações por prioridade de ordem
    allRecommendations.sort((a, b) => a.order_priority - b.order_priority)

    console.log(`🎯 Total de recomendações geradas: ${allRecommendations.length}`)

    return NextResponse.json({
      success: true,
      data: {
        family_id: familyId,
        has_assessment: true,
        assessment_id: lastAssessment.id,
        assessment_date: lastAssessment.assessment_date,
        vulnerable_dimensions: vulnerableDimensions,
        recommendations: allRecommendations,
        total_recommendations: allRecommendations.length,
        recommendations_by_dimension: allRecommendations.reduce((acc: any, rec: any) => {
          if (!acc[rec.dimension]) acc[rec.dimension] = []
          acc[rec.dimension].push(rec)
          return acc
        }, {})
      }
    })

  } catch (error) {
    console.error('❌ Erro ao buscar recomendações de metas:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

// API para criar meta a partir de recomendação
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const familyId = params.id
    const body = await request.json()
    
    const { 
      goal_template_id,
      goal_name,
      goal_description,
      dimension,
      target_date,
      priority_level = 'medium',
      assessment_id,
      notes 
    } = body

    console.log('📝 Criando meta a partir de recomendação:', {
      familyId,
      goal_template_id,
      goal_name,
      dimension
    })

    // Validações
    if (!goal_template_id || !goal_name) {
      return NextResponse.json({ 
        error: 'goal_template_id e goal_name são obrigatórios' 
      }, { status: 400 })
    }

    // Verificar se a família existe
    const { data: family, error: familyError } = await supabaseServerClient
      .from('families')
      .select('id, name')
      .eq('id', familyId)
      .single()

    if (familyError || !family) {
      return NextResponse.json({ 
        error: 'Família não encontrada' 
      }, { status: 404 })
    }

    // Criar a meta em family_goal_assignments
    const insertData = {
      family_id: familyId,
      family_goal_id: goal_template_id, // ID da meta na tabela goal_templates
      assessment_id,
      goal_name,
      goal_description,
      dimension: dimension || 'Personalizada',
      target_date,
      priority_level,
      current_status: 'Em progresso',
      progress_percentage: 0,
      source: 'dignometer_recommendation',
      notes: notes || `Meta recomendada automaticamente baseada no dignometro`
    }
    
    const { data: newGoalAssignment, error: assignmentError } = await supabaseServerClient
      .from('family_goal_assignments')
      .insert(insertData)
      .select()
      .single()

    if (assignmentError) {
      console.error('❌ Erro ao criar meta assignment:', assignmentError)
      throw assignmentError
    }
    
    console.log('✅ Meta assignment criada:', newGoalAssignment.id)

    return NextResponse.json({
      success: true,
      goal_assignment: newGoalAssignment,
      message: `Meta "${goal_name}" atribuída com sucesso para ${family.name}`
    })

  } catch (error) {
    console.error('❌ Erro ao criar meta a partir de recomendação:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
