import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseServerClient
      .from('families')
      .select(`
        id,
        name,
        city,
        state,
        mentor_email,
        cpf,
        status_aprovacao
      `)
      .eq('status_aprovacao', 'aprovado')
      .order('name');

    if (error) {
      console.error('Erro ao buscar famílias:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
