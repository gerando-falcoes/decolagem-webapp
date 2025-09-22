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
      email,
      cpf,
      password,
      income,
      familySize,
      cep,
      state,
      city,
      street,
      neighborhood,
      reference,
      mentorEmail,
      familyMembers
    } = body

    // Validações básicas
    if (!name || !phone || !cpf || !password) {
      return NextResponse.json(
        { error: 'Nome, telefone, CPF e senha são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Validação do CPF
    const cpfNumbers = cpf.replace(/\D/g, '')
    if (cpfNumbers.length !== 11) {
      return NextResponse.json(
        { error: 'CPF deve conter 11 dígitos' },
        { status: 400 }
      )
    }

    // 1. Criar perfil na tabela profiles para a família
    console.log('👤 API: Criando perfil da família na tabela profiles...')
    
    // Gerar um UUID para o perfil da família
    const familyProfileId = crypto.randomUUID()
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: familyProfileId,
        name: name,
        role: 'familia',
        phone: phone,
        email: email || null,
        cpf: cpf,
        senha: password,
        status_aprovacao: 'pendente',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ API: Erro ao criar perfil da família:', profileError)
      return NextResponse.json(
        { error: 'Erro ao criar perfil da família: ' + profileError.message },
        { status: 500 }
      )
    }

    console.log('✅ API: Perfil da família criado com sucesso:', profileData.id)


    // 2. Depois, criar a família na tabela families
    console.log('👨‍👩‍👧‍👦 API: Inserindo família na tabela families...')
    const { data: familyData, error: familyError } = await supabase
      .from('families')
      .insert({
        name,
        phone,
        email: email || null,
        cpf,
        // cep: cep || null, // Campo CEP será adicionado quando a migração for aplicada
        street,
        neighborhood,
        city,
        state,
        reference_point: reference,
        income_range: income,
        family_size: familySize ? parseInt(familySize) : null,
        mentor_email: mentorEmail,
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

    // 3. Inserir membros da família se fornecidos
    if (familyMembers && Array.isArray(familyMembers) && familyMembers.length > 0) {
      console.log('👥 API: Inserindo membros da família...')
      
      const validMembers = familyMembers.filter(member => member.name && member.name.trim() !== '')
      
      if (validMembers.length > 0) {
        const membersToInsert = validMembers.map(member => ({
          family_id: familyData.id,
          nome: member.name,
          idade: member.age ? parseInt(member.age) : null,
          cpf: member.cpf || null,
          relacao_familia: member.relation || null,
          esta_empregado: member.isEmployed || false,
          is_responsavel: member.isResponsible || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))

        const { data: membersData, error: membersError } = await supabase
          .from('family_members')
          .insert(membersToInsert)
          .select()

        if (membersError) {
          console.error('❌ API: Erro ao inserir membros da família:', membersError)
          // Não falhar a operação toda por causa dos membros, apenas logar o erro
        } else {
          console.log('✅ API: Membros da família inseridos com sucesso:', membersData?.length)
        }
      }
    }

    return NextResponse.json({
      success: true,
      family: familyData,
      profile: profileData,
      message: 'Família cadastrada com sucesso!'
    })

  } catch (error) {
    console.error('❌ API: Erro geral ao criar família:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}