import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    console.log('🔍 API: Buscando todas as famílias para a tabela...')

    // Buscar todas as famílias diretamente (sem filtros como a API disponíveis)
    const { data: familiesData, error: familiesError } = await supabase
      .from('families')
      .select('id, name, phone, whatsapp, email, city, state, mentor_email, status, created_at')
      .order('name')

    if (familiesError) {
      console.error('❌ API: Erro ao buscar famílias:', familiesError)
      return NextResponse.json({ error: familiesError.message }, { status: 500 })
    }

    console.log('✅ API: Dados das famílias encontrados:', familiesData?.length)
    
    // Mapear para o formato esperado da tabela
    const formattedFamilies = familiesData?.map(family => {
      // Extrair nome do mentor (parte antes do @) se existir
      let mentorDisplay = '--'
      if (family.mentor_email && family.mentor_email.trim() !== '') {
        const mentorName = family.mentor_email.split('@')[0]
        mentorDisplay = mentorName.charAt(0).toUpperCase() + mentorName.slice(1)
      }
      
      return {
        family_id: family.id,
        FAMILIA: family.name || 'Nome não informado',
        MENTOR: mentorDisplay,
        STATUS: family.status || 'Não Avaliado',
        DIGNOMETRO: null
      }
    }) || []

    console.log(`📊 API: Retornando ${formattedFamilies.length} famílias formatadas`)

    return NextResponse.json({ families: formattedFamilies })

  } catch (error) {
    console.error('❌ API: Erro geral:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
