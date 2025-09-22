import { NextRequest, NextResponse } from 'next/server'
import { supabaseServerClient } from '@/lib/supabase/server'

// API para buscar goal assignments de uma família
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

    console.log('🔍 Buscando goal assignments para família:', familyId)

    // Buscar todas as atribuições de metas da família
    const { data: goalAssignments, error } = await supabaseServerClient
      .from('family_goal_assignments')
      .select(`
        id,
        family_id,
        goal_template_id,
        assessment_id,
        goal_name,
        goal_description,
        dimension,
        target_date,
        current_status,
        priority_level,
        progress_percentage,
        source,
        notes,
        created_at,
        updated_at,
        assigned_date,
        started_date,
        completed_date
      `)
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar goal assignments:', error)
      throw error
    }

    console.log(`✅ ${goalAssignments?.length || 0} goal assignments encontradas`)

    return NextResponse.json({
      success: true,
      family_id: familyId,
      goal_assignments: goalAssignments || [],
      total: goalAssignments?.length || 0
    })

  } catch (error) {
    console.error('❌ Erro ao buscar goal assignments:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

// API para criar uma nova goal assignment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const familyId = params.id
    const body = await request.json()
    
    console.log('📝 Criando nova goal assignment:', { familyId, body })
    
    const { 
      goal_template_id,
      assessment_id,
      goal_name,
      goal_description,
      dimension = 'Personalizada',
      target_date,
      priority_level = 'medium',
      notes,
      source = 'manual'
    } = body

    // Validações
    if (!goal_name) {
      return NextResponse.json({ 
        error: 'goal_name é obrigatório' 
      }, { status: 400 })
    }

    console.log('📝 Dados recebidos:', { goal_template_id, goal_name, source, dimension })

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

    // Definir family_goal_id baseado no tipo de meta
    let family_goal_id;
    
    if (goal_template_id) {
      // Meta de recomendação: usar ID do template
      family_goal_id = goal_template_id;
      console.log('🎯 Meta de recomendação: usando template ID', goal_template_id);
    } else {
      // Meta manual: gerar novo UUID
      const { data: uuidResult } = await supabaseServerClient.rpc('gen_random_uuid');
      family_goal_id = uuidResult || crypto.randomUUID();
      console.log('✍️ Meta manual: gerando novo ID', family_goal_id);
    }

    // Criar a goal assignment
    const insertData = {
      family_id: familyId,
      family_goal_id,
      goal_template_id: goal_template_id || null,
      assessment_id,
      goal_name,
      goal_description,
      dimension,
      target_date,
      priority_level,
      current_status: 'Em progresso',
      progress_percentage: 0,
      source,
      notes
    }
    
    const { data: newAssignment, error: assignmentError } = await supabaseServerClient
      .from('family_goal_assignments')
      .insert(insertData)
      .select()
      .single()

    if (assignmentError) {
      console.error('❌ Erro ao criar goal assignment:', assignmentError)
      throw assignmentError
    }
    
    console.log('✅ Goal assignment criada:', newAssignment.id)

    return NextResponse.json({
      success: true,
      goal_assignment: newAssignment,
      message: `Meta "${goal_name}" atribuída com sucesso para ${family.name}`
    })

  } catch (error) {
    console.error('❌ Erro ao criar goal assignment:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

// API para atualizar uma goal assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const familyId = params.id
    const body = await request.json()
    
    console.log('📝 Atualizando goal assignment:', { familyId, body })
    
    const { 
      goal_assignment_id,
      goal_name,
      goal_description,
      dimension,
      target_date,
      current_status,
      priority_level,
      progress_percentage,
      notes
    } = body

    if (!goal_assignment_id) {
      return NextResponse.json({ 
        error: 'goal_assignment_id é obrigatório' 
      }, { status: 400 })
    }

    // Preparar dados para atualização
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (goal_name !== undefined) updateData.goal_name = goal_name
    if (goal_description !== undefined) updateData.goal_description = goal_description
    if (dimension !== undefined) updateData.dimension = dimension
    if (target_date !== undefined) updateData.target_date = target_date
    if (current_status !== undefined) {
      updateData.current_status = current_status
      
      // Atualizar datas conforme o status
      if (current_status === 'Em progresso' && !updateData.started_date) {
        updateData.started_date = new Date().toISOString()
      } else if (current_status === 'Parada' && !updateData.completed_date) {
        updateData.completed_date = new Date().toISOString()
      }
    }
    if (priority_level !== undefined) updateData.priority_level = priority_level
    if (progress_percentage !== undefined) updateData.progress_percentage = progress_percentage
    if (notes !== undefined) updateData.notes = notes

    const { data: updatedAssignment, error } = await supabaseServerClient
      .from('family_goal_assignments')
      .update(updateData)
      .eq('id', goal_assignment_id)
      .eq('family_id', familyId) // Segurança adicional
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao atualizar goal assignment:', error)
      throw error
    }

    console.log('✅ Goal assignment atualizada:', updatedAssignment.id)

    return NextResponse.json({
      success: true,
      goal_assignment: updatedAssignment,
      message: 'Meta atualizada com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar goal assignment:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

// API para deletar uma goal assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const familyId = params.id
    const { searchParams } = new URL(request.url)
    const goalAssignmentId = searchParams.get('goal_assignment_id')

    if (!goalAssignmentId) {
      return NextResponse.json({ 
        error: 'goal_assignment_id é obrigatório' 
      }, { status: 400 })
    }

    console.log('🗑️ Deletando goal assignment:', { familyId, goalAssignmentId })

    const { error } = await supabaseServerClient
      .from('family_goal_assignments')
      .delete()
      .eq('id', goalAssignmentId)
      .eq('family_id', familyId) // Segurança adicional

    if (error) {
      console.error('❌ Erro ao deletar goal assignment:', error)
      throw error
    }

    console.log('✅ Goal assignment deletada com sucesso')

    return NextResponse.json({
      success: true,
      message: 'Meta removida com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro ao deletar goal assignment:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
