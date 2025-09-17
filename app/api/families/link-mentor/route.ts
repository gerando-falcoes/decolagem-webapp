import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { familyId, mentorEmail, action } = await request.json()

    if (!familyId) {
      return NextResponse.json({ error: 'ID da família é obrigatório' }, { status: 400 })
    }

    if (action !== 'link' && action !== 'unlink') {
      return NextResponse.json({ error: 'Ação deve ser "link" ou "unlink"' }, { status: 400 })
    }

    if (action === 'link' && !mentorEmail) {
      return NextResponse.json({ error: 'Email do mentor é obrigatório para vincular' }, { status: 400 })
    }

    console.log(`🔗 API: ${action === 'link' ? 'Vinculando' : 'Desvinculando'} mentor...`)

    // Atualizar família no banco
    const updateData = {
      mentor_email: action === 'link' ? mentorEmail : null,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('families')
      .update(updateData)
      .eq('id', familyId)
      .select('id, name, mentor_email')
      .single()

    if (error) {
      console.error('❌ Erro ao atualizar família:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Família atualizada com sucesso:', data)

    return NextResponse.json({
      success: true,
      family: data,
      message: action === 'link' 
        ? `Mentor ${mentorEmail} vinculado à família ${data.name}` 
        : `Mentor removido da família ${data.name}`
    })

  } catch (error) {
    console.error('❌ Erro geral na API de vinculação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
