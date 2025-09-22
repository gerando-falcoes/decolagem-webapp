import { NextRequest, NextResponse } from 'next/server'
import { supabaseServerClient } from '@/lib/supabase/server'

// API para ações específicas nas metas: alterar status, marcar como concluída, deletar
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const familyId = params.id
    const body = await request.json()
    
    const { 
      action, 
      goal_assignment_id,
    } = body

    console.log('🎯 Executando ação na meta:', { familyId, action, goal_assignment_id })

    if (!goal_assignment_id) {
      return NextResponse.json({ 
        error: 'goal_assignment_id é obrigatório' 
      }, { status: 400 })
    }

    // Verificar se a meta existe e pertence à família
    const { data: existingGoal, error: checkError } = await supabaseServerClient
      .from('family_goal_assignments')
      .select('id, current_status, progress_percentage, goal_name')
      .eq('id', goal_assignment_id)
      .eq('family_id', familyId)
      .single()

    if (checkError || !existingGoal) {
      return NextResponse.json({ 
        error: 'Meta não encontrada ou não pertence a esta família' 
      }, { status: 404 })
    }

    switch (action) {
      case 'toggle_status':
        return await toggleStatus(existingGoal, goal_assignment_id, familyId)
      
      case 'mark_completed':
        return await markCompleted(existingGoal, goal_assignment_id, familyId)
      
      case 'cancel':
        return await cancelMeta(existingGoal, goal_assignment_id, familyId)
      
      case 'delete':
        return await deleteMeta(existingGoal, goal_assignment_id, familyId)
      
      default:
        return NextResponse.json({ 
          error: 'Ação não reconhecida. Use: toggle_status, mark_completed, cancel, delete' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Erro ao executar ação na meta:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

// Alternar status entre "Em progresso" e "Parada"
async function toggleStatus(existingGoal: any, goalAssignmentId: string, familyId: string) {
  const newStatus = existingGoal.current_status === 'Em progresso' ? 'Parada' : 'Em progresso'
  
  console.log(`🔄 Alternando status: ${existingGoal.current_status} → ${newStatus}`)

  const updateData: any = {
    current_status: newStatus,
    updated_at: new Date().toISOString()
  }

  // Atualizar datas conforme o novo status
  if (newStatus === 'Em progresso') {
    updateData.started_date = new Date().toISOString()
  }

  const { data: updatedGoal, error } = await supabaseServerClient
    .from('family_goal_assignments')
    .update(updateData)
    .eq('id', goalAssignmentId)
    .eq('family_id', familyId)
    .select()
    .single()

  if (error) {
    console.error('❌ Erro ao alterar status:', error)
    throw error
  }

  console.log(`✅ Status alterado para: ${newStatus}`)

  return NextResponse.json({
    success: true,
    goal_assignment: updatedGoal,
    message: `Meta "${existingGoal.goal_name}" agora está ${newStatus.toLowerCase()}`
  })
}

// Marcar como concluída (progress_percentage = 100)
async function markCompleted(existingGoal: any, goalAssignmentId: string, familyId: string) {
  console.log('✅ Marcando meta como concluída (100%)')

  const updateData = {
    current_status: 'Concluída',
    progress_percentage: 100,
    completed_date: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data: updatedGoal, error } = await supabaseServerClient
    .from('family_goal_assignments')
    .update(updateData)
    .eq('id', goalAssignmentId)
    .eq('family_id', familyId)
    .select()
    .single()

  if (error) {
    console.error('❌ Erro ao marcar como concluída:', error)
    throw error
  }

  console.log('✅ Meta marcada como concluída')

  return NextResponse.json({
    success: true,
    goal_assignment: updatedGoal,
    message: `Meta "${existingGoal.goal_name}" foi marcada como concluída! 🎉`
  })
}

// Cancelar meta
async function cancelMeta(existingGoal: any, goalAssignmentId: string, familyId: string) {
  console.log('❌ Cancelando meta:', existingGoal.goal_name)

  const updateData = {
    current_status: 'Cancelada',
    updated_at: new Date().toISOString()
  }

  const { data: updatedGoal, error } = await supabaseServerClient
    .from('family_goal_assignments')
    .update(updateData)
    .eq('id', goalAssignmentId)
    .eq('family_id', familyId)
    .select()
    .single()

  if (error) {
    console.error('❌ Erro ao cancelar meta:', error)
    throw error
  }

  console.log('✅ Meta cancelada com sucesso')

  return NextResponse.json({
    success: true,
    goal_assignment: updatedGoal,
    message: `Meta "${existingGoal.goal_name}" foi cancelada`
  })
}

// Deletar meta
async function deleteMeta(existingGoal: any, goalAssignmentId: string, familyId: string) {
  console.log('🗑️ Deletando meta:', existingGoal.goal_name)

  const { error } = await supabaseServerClient
    .from('family_goal_assignments')
    .delete()
    .eq('id', goalAssignmentId)
    .eq('family_id', familyId)

  if (error) {
    console.error('❌ Erro ao deletar meta:', error)
    throw error
  }

  console.log('✅ Meta deletada com sucesso')

  return NextResponse.json({
    success: true,
    message: `Meta "${existingGoal.goal_name}" foi removida com sucesso`
  })
}
