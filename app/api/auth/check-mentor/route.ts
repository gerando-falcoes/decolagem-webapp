import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    console.log(`🔍 Verificando se ${email} é mentor...`)

    // Verificar se o email existe na tabela profiles com role de mentor
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, name')
      .eq('email', email)
      .single()

    if (error) {
      console.log(`📧 Email ${email} não encontrado na tabela profiles:`, error.message)
      return NextResponse.json({ 
        isMentor: false, 
        reason: 'Email não encontrado no sistema' 
      })
    }

    // Verificar se o role é mentor
    const isMentor = data.role?.toLowerCase().includes('mentor') || 
                     data.role?.toLowerCase() === 'admin'
    
    console.log(`✅ Verificação completa para ${email}:`, {
      found: !!data,
      name: data.name,
      role: data.role,
      isMentor
    })

    return NextResponse.json({
      isMentor,
      mentor: data, // Mantém compatibilidade com o modal
      profile: data,
      reason: isMentor ? 'Usuário é mentor' : `Role '${data.role}' não é mentor`
    })

  } catch (error) {
    console.error('❌ Erro ao verificar mentor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

