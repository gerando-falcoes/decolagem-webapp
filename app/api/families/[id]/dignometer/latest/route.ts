import { NextRequest, NextResponse } from 'next/server'
import { supabaseServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const familyId = params.id

  if (!familyId) {
    return NextResponse.json({ error: 'Family ID é obrigatório' }, { status: 400 })
  }

  try {
    // Buscar último dignômetro da família
    const { data: dignometer, error } = await supabaseServerClient
      .from('dignometro_assessments')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum dignômetro encontrado
        return NextResponse.json({ 
          error: 'Família não possui avaliações do dignômetro',
          code: 'NO_ASSESSMENT'
        }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      dignometer,
      family_id: familyId
    })
  } catch (error) {
    console.error('Erro ao buscar dignômetro da família:', error)
    return NextResponse.json({ 
      error: 'Erro ao buscar dignômetro da família' 
    }, { status: 500 })
  }
}
