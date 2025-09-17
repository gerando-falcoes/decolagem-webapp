import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    console.log('🔍 API: Buscando todas as famílias da view vw_families_overview...')

    // Buscar dados da view vw_families_overview que contém as informações corretas
    const { data: familiesData, error: familiesError } = await supabase
      .from('vw_families_overview')
      .select('family_id, FAMILIA, DIGNOMETRO, STATUS, MENTOR')
      .order('FAMILIA')

    if (familiesError) {
      console.error('❌ API: Erro ao buscar famílias da view:', familiesError)
      return NextResponse.json({ error: familiesError.message }, { status: 500 })
    }

    console.log('✅ API: Dados das famílias encontrados na view:', familiesData?.length)
    
    // Os dados já vêm no formato correto da view, apenas garantir que campos nulos sejam tratados
    const formattedFamilies = familiesData?.map(family => ({
      family_id: family.family_id,
      FAMILIA: family.FAMILIA || 'Nome não informado',
      MENTOR: family.MENTOR || '--',
      STATUS: family.STATUS || null, // Manter null para ser tratado pelo componente como "Não Avaliado"
      DIGNOMETRO: family.DIGNOMETRO
    })) || []

    console.log(`📊 API: Retornando ${formattedFamilies.length} famílias da view vw_families_overview`)

    return NextResponse.json({ families: formattedFamilies })

  } catch (error) {
    console.error('❌ API: Erro geral:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log('📝 API: Criando nova família...')

    const body = await request.json()
    const {
      name,
      phone,
      whatsapp,
      email,
      password,
      income,
      familySize,
      mentor,
      state,
      city,
      street,
      neighborhood,
      reference
    } = body

    // Validações básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // 1. Primeiro, criar o usuário usando a edge function
    console.log('👤 API: Criando usuário na edge function...')
    const createUserResponse = await fetch(
      'https://iawcvuzhrkayzpdyhbii.supabase.co/functions/v1/create-user',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ email, password })
      }
    )

    if (!createUserResponse.ok) {
      const errorData = await createUserResponse.json()
      console.error('❌ API: Erro ao criar usuário:', errorData)
      return NextResponse.json(
        { error: errorData.error || 'Erro ao criar usuário' },
        { status: 400 }
      )
    }

    const userData = await createUserResponse.json()
    console.log('✅ API: Usuário criado com sucesso:', userData.user?.id)

    // 2. Depois, criar a família na tabela families
    console.log('👨‍👩‍👧‍👦 API: Inserindo família na tabela families...')
    const { data: familyData, error: familyError } = await supabase
      .from('families')
      .insert({
        name,
        phone,
        whatsapp,
        email,
        street,
        neighborhood,
        city,
        state,
        reference_point: reference,
        income_range: income,
        family_size: familySize ? parseInt(familySize) : null,
        mentor_email: mentor,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (familyError) {
      console.error('❌ API: Erro ao inserir família:', familyError)
      // Se a família falhou, idealmente deveria reverter o usuário criado
      // Mas por enquanto apenas retorna o erro
      return NextResponse.json({ error: familyError.message }, { status: 500 })
    }

    console.log('✅ API: Família criada com sucesso:', familyData.id)

    return NextResponse.json({
      success: true,
      family: familyData,
      user: userData.user,
      message: 'Família cadastrada com sucesso!'
    })

  } catch (error) {
    console.error('❌ API: Erro geral ao criar família:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}