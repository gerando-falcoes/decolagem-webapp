import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    console.log('🗑️ API: Iniciando exclusão de família...')

    const body = await request.json()
    const { familyId, cpf, confirmText } = body

    // Validações básicas
    if (!familyId || !cpf) {
      return NextResponse.json(
        { error: 'ID da família e CPF são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o texto de confirmação está correto
    if (confirmText !== 'DELETAR') {
      return NextResponse.json(
        { error: 'Texto de confirmação incorreto. Digite "DELETAR" para confirmar.' },
        { status: 400 }
      )
    }

    console.log(`🔍 API: Verificando família para exclusão - ID: ${familyId}, CPF: ${cpf}`)

    // 1. Verificar se a família existe na tabela profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, cpf, role')
      .eq('id', familyId)
      .eq('cpf', cpf)
      .eq('role', 'familia')
      .single()

    if (profileError || !profile) {
      console.error('❌ API: Família não encontrada:', profileError?.message)
      return NextResponse.json(
        { error: 'Família não encontrada ou dados inválidos' },
        { status: 404 }
      )
    }

    console.log(`✅ API: Família encontrada: ${profile.name}`)

    // 2. Buscar família na tabela families para obter o family_id
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('id, name')
      .eq('cpf', cpf)
      .single()

    if (familyError || !family) {
      console.error('❌ API: Família não encontrada na tabela families:', familyError?.message)
      return NextResponse.json(
        { error: 'Família não encontrada na tabela families' },
        { status: 404 }
      )
    }

    console.log(`✅ API: Família encontrada na tabela families: ${family.name}`)

    // 3. Deletar em cascata - começar pelas tabelas dependentes
    console.log('🗑️ API: Iniciando exclusão em cascata...')

    // 3.1. Deletar family_members
    const { error: membersError } = await supabase
      .from('family_members')
      .delete()
      .eq('family_id', family.id)

    if (membersError) {
      console.error('❌ API: Erro ao deletar membros da família:', membersError.message)
    } else {
      console.log('✅ API: Membros da família deletados')
    }

    // 3.2. Deletar assessments (dignometro_assessments)
    const { error: assessmentsError } = await supabase
      .from('dignometro_assessments')
      .delete()
      .eq('family_id', family.id)

    if (assessmentsError) {
      console.error('❌ API: Erro ao deletar avaliações:', assessmentsError.message)
    } else {
      console.log('✅ API: Avaliações deletadas')
    }

    // 3.3. Deletar goals
    const { error: goalsError } = await supabase
      .from('goals')
      .delete()
      .eq('family_id', family.id)

    if (goalsError) {
      console.error('❌ API: Erro ao deletar metas:', goalsError.message)
    } else {
      console.log('✅ API: Metas deletadas')
    }

    // 3.4. Deletar family_goals
    const { error: familyGoalsError } = await supabase
      .from('family_goals')
      .delete()
      .eq('family_id', family.id)

    if (familyGoalsError) {
      console.error('❌ API: Erro ao deletar metas da família:', familyGoalsError.message)
    } else {
      console.log('✅ API: Metas da família deletadas')
    }

    // 3.5. Deletar followups
    const { error: followupsError } = await supabase
      .from('followups')
      .delete()
      .eq('family_id', family.id)

    if (followupsError) {
      console.error('❌ API: Erro ao deletar acompanhamentos:', followupsError.message)
    } else {
      console.log('✅ API: Acompanhamentos deletados')
    }

    // 3.6. Deletar alerts
    const { error: alertsError } = await supabase
      .from('alerts')
      .delete()
      .eq('family_id', family.id)

    if (alertsError) {
      console.error('❌ API: Erro ao deletar alertas:', alertsError.message)
    } else {
      console.log('✅ API: Alertas deletados')
    }

    // 3.7. Deletar attachments
    const { error: attachmentsError } = await supabase
      .from('attachments')
      .delete()
      .eq('family_id', family.id)

    if (attachmentsError) {
      console.error('❌ API: Erro ao deletar anexos:', attachmentsError.message)
    } else {
      console.log('✅ API: Anexos deletados')
    }

    // 4. Deletar a família da tabela families
    const { error: familyDeleteError } = await supabase
      .from('families')
      .delete()
      .eq('id', family.id)

    if (familyDeleteError) {
      console.error('❌ API: Erro ao deletar família:', familyDeleteError.message)
      return NextResponse.json({ error: familyDeleteError.message }, { status: 500 })
    }

    console.log('✅ API: Família deletada da tabela families')

    // 5. Por último, deletar o perfil da tabela profiles
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', familyId)

    if (profileDeleteError) {
      console.error('❌ API: Erro ao deletar perfil:', profileDeleteError.message)
      return NextResponse.json({ error: profileDeleteError.message }, { status: 500 })
    }

    console.log('✅ API: Perfil deletado da tabela profiles')

    console.log(`🎉 API: Família "${profile.name}" deletada com sucesso!`)

    return NextResponse.json({
      success: true,
      message: `Família "${profile.name}" foi deletada permanentemente do sistema.`,
      deletedFamily: {
        name: profile.name,
        cpf: profile.cpf,
        familyId: family.id
      }
    })

  } catch (error) {
    console.error('❌ API: Erro geral ao deletar família:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function GET() {
  try {
    console.log('🔍 API: Buscando famílias para exclusão...')

    // Buscar famílias da tabela profiles com role 'familia'
    const { data: families, error: familiesError } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        email,
        phone,
        cpf,
        status_aprovacao,
        created_at,
        updated_at
      `)
      .eq('role', 'familia')
      .order('name')

    if (familiesError) {
      console.error('❌ API: Erro ao buscar famílias:', familiesError)
      return NextResponse.json({ error: familiesError.message }, { status: 500 })
    }

    console.log(`✅ API: ${families?.length || 0} família(s) encontrada(s) para exclusão`)

    return NextResponse.json({
      success: true,
      families: families || [],
      count: families?.length || 0
    })

  } catch (error) {
    console.error('❌ API: Erro geral ao buscar famílias para exclusão:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
