import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    console.log('📝 API: Aprovando famílias...')

    const body = await request.json()
    const { familyIds, mentorId, mentorName } = body

    // Validações básicas
    if (!familyIds || !Array.isArray(familyIds) || familyIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs das famílias são obrigatórios' },
        { status: 400 }
      )
    }

    if (!mentorId || !mentorName) {
      return NextResponse.json(
        { error: 'ID e nome do mentor são obrigatórios' },
        { status: 400 }
      )
    }

    console.log(`🔍 API: Aprovando ${familyIds.length} família(s) pelo mentor: ${mentorName}`)

    // Buscar os profiles das famílias para validar se existem e estão pendentes
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, status_aprovacao')
      .in('id', familyIds)
      .eq('role', 'familia')

    if (profilesError) {
      console.error('❌ API: Erro ao buscar profiles das famílias:', profilesError)
      return NextResponse.json({ error: profilesError.message }, { status: 500 })
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma família encontrada com os IDs fornecidos' },
        { status: 404 }
      )
    }

    console.log(`✅ API: ${profiles.length} família(s) encontrada(s) para aprovação`)

    // Verificar se todas as famílias estão com status 'pendente'
    const familiasNaoPendentes = profiles.filter(p => p.status_aprovacao !== 'pendente')
    if (familiasNaoPendentes.length > 0) {
      console.log(`⚠️ API: ${familiasNaoPendentes.length} família(s) não estão pendentes:`, 
        familiasNaoPendentes.map(f => `${f.name} (${f.status_aprovacao})`))
    }

    // Aprovar as famílias - atualizar o status, aprovado_por e data_aprovacao
    const now = new Date().toISOString()
    
    const { data: updatedProfiles, error: updateError } = await supabase
      .from('profiles')
      .update({
        status_aprovacao: 'aprovado',
        aprovado_por: mentorId,
        data_aprovacao: now,
        updated_at: now
      })
      .in('id', familyIds)
      .eq('role', 'familia')
      .select('id, name, status_aprovacao, data_aprovacao')

    if (updateError) {
      console.error('❌ API: Erro ao atualizar profiles das famílias:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    if (!updatedProfiles || updatedProfiles.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma família foi atualizada' },
        { status: 400 }
      )
    }

    console.log(`✅ API: ${updatedProfiles.length} família(s) aprovada(s) com sucesso`)
    console.log('📊 API: Famílias aprovadas:', updatedProfiles.map(f => f.name))

    return NextResponse.json({
      success: true,
      approvedFamilies: updatedProfiles,
      message: `${updatedProfiles.length} família(s) aprovada(s) com sucesso por ${mentorName}!`,
      approvedBy: mentorName,
      approvalDate: now
    })

  } catch (error) {
    console.error('❌ API: Erro geral ao aprovar famílias:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function GET() {
  try {
    console.log('🔍 API: Buscando famílias pendentes de aprovação...')

    // Buscar famílias com status 'pendente' na tabela profiles
    const { data: pendingFamilies, error: pendingError } = await supabase
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
      .eq('status_aprovacao', 'pendente')
      .order('created_at', { ascending: false })

    if (pendingError) {
      console.error('❌ API: Erro ao buscar famílias pendentes:', pendingError)
      return NextResponse.json({ error: pendingError.message }, { status: 500 })
    }

    console.log(`✅ API: ${pendingFamilies?.length || 0} família(s) pendente(s) encontrada(s)`)

    return NextResponse.json({
      success: true,
      pendingFamilies: pendingFamilies || [],
      count: pendingFamilies?.length || 0
    })

  } catch (error) {
    console.error('❌ API: Erro geral ao buscar famílias pendentes:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
