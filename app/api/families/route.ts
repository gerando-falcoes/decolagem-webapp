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
