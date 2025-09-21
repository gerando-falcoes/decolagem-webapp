import { NextRequest, NextResponse } from 'next/server'
import { supabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const familyId = searchParams.get('family_id')
  
  if (!familyId) {
    return NextResponse.json({ error: 'family_id é obrigatório' }, { status: 400 })
  }

  try {
    const { data: goals, error } = await supabaseServerClient
      .from('family_goals')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      family_id: familyId,
      goals: goals || []
    })
  } catch (error) {
    console.error('Erro ao buscar metas da família:', error)
    return NextResponse.json({ error: 'Erro ao buscar metas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      family_id, 
      goal_title, 
      goal_category, 
      target_date,
      created_by,
      source = 'manual',
      assessment_id = null
    } = body

    // Validações
    if (!family_id || !goal_title) {
      return NextResponse.json({ 
        error: 'family_id e goal_title são obrigatórios' 
      }, { status: 400 })
    }

    // Verificar se a família existe
    const { data: family, error: familyError } = await supabaseServerClient
      .from('families')
      .select('id, name')
      .eq('id', family_id)
      .single()

    if (familyError || !family) {
      return NextResponse.json({ 
        error: 'Família não encontrada' 
      }, { status: 404 })
    }

    // Criar a meta
    const { data: newGoal, error: goalError } = await supabaseServerClient
      .from('family_goals')
      .insert({
        family_id,
        assessment_id,
        goal_title,
        goal_category: goal_category || 'Meta personalizada criada pelo mentor',
        target_date,
        current_status: 'PENDENTE',
        progress_percentage: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (goalError) throw goalError

    return NextResponse.json({
      success: true,
      goal: newGoal,
      message: `Meta "${goal_title}" criada com sucesso para ${family.name}`
    })
  } catch (error) {
    console.error('Erro ao criar meta:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor ao criar meta' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      goal_id,
      goal_title,
      goal_category,
      target_date,
      current_status,
      progress_percentage
    } = body

    if (!goal_id) {
      return NextResponse.json({ 
        error: 'goal_id é obrigatório' 
      }, { status: 400 })
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (goal_title !== undefined) updateData.goal_title = goal_title
    if (goal_category !== undefined) updateData.goal_category = goal_category
    if (target_date !== undefined) updateData.target_date = target_date
    if (current_status !== undefined) updateData.current_status = current_status
    if (progress_percentage !== undefined) updateData.progress_percentage = progress_percentage

    const { data: updatedGoal, error } = await supabaseServerClient
      .from('family_goals')
      .update(updateData)
      .eq('id', goal_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      goal: updatedGoal,
      message: 'Meta atualizada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar meta:', error)
    return NextResponse.json({ 
      error: 'Erro ao atualizar meta' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const goalId = searchParams.get('goal_id')

    if (!goalId) {
      return NextResponse.json({ 
        error: 'goal_id é obrigatório' 
      }, { status: 400 })
    }

    const { error } = await supabaseServerClient
      .from('family_goals')
      .delete()
      .eq('id', goalId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Meta removida com sucesso'
    })
  } catch (error) {
    console.error('Erro ao remover meta:', error)
    return NextResponse.json({ 
      error: 'Erro ao remover meta' 
    }, { status: 500 })
  }
}
