import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const familyId = params.id;

    // Dados básicos da família
    const { data: family, error: familyError } = await supabaseServerClient
      .from('dignometro_dashboard')
      .select('*')
      .eq('family_id', familyId)
      .single();

    if (familyError) {
      console.error('Erro ao buscar família:', familyError);
      return NextResponse.json({ error: familyError.message }, { status: 500 });
    }

    // Histórico de assessments
    const { data: assessments, error: assessmentsError } = await supabaseServerClient
      .from('dignometro_assessments')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (assessmentsError) {
      console.error('Erro ao buscar assessments:', assessmentsError);
    }

    // Membros da família
    const { data: members, error: membersError } = await supabaseServerClient
      .from('family_members')
      .select('nome, idade, relacao_familia, is_responsavel')
      .eq('family_id', familyId);

    if (membersError) {
      console.error('Erro ao buscar membros:', membersError);
    }

    // Metas da família
    const { data: goals, error: goalsError } = await supabaseServerClient
      .from('family_goal_assignments')
      .select(`
        *,
        goal_templates(goal_name, goal_description, dimension)
      `)
      .eq('family_id', familyId);

    if (goalsError) {
      console.error('Erro ao buscar metas:', goalsError);
    }

    const result = {
      family,
      assessments: assessments || [],
      members: members || [],
      goals: goals || [],
      hasData: {
        family: !!family,
        assessments: (assessments || []).length > 0,
        members: (members || []).length > 0,
        goals: (goals || []).length > 0
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
