import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Buscando famílias disponíveis...')

    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')

    if (!userEmail) {
      return NextResponse.json({ error: 'Email do usuário é obrigatório' }, { status: 400 })
    }

    // Buscar famílias que ainda não têm mentor ou têm o mentor atual
    const { data, error } = await supabase
      .from('families')
      .select('id, name, phone, whatsapp, email, city, state, mentor_email')
      .or(`mentor_email.is.null,mentor_email.eq.${userEmail}`)
      .order('name')

    if (error) {
      console.error('❌ Erro ao buscar famílias:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const families = data.map(family => ({
      ...family,
      has_mentor: family.mentor_email !== null
    }))

    console.log(`✅ API: ${families.length} famílias encontradas`)

    return NextResponse.json({ families })

  } catch (error) {
    console.error('❌ Erro geral na API:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

