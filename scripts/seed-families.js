const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const familiesData = [
  {
    name: 'Família Silva',
    phone: '(11) 99999-1111',
    whatsapp: '(11) 99999-1111',
    email: 'familia.silva@email.com',
    street: 'Rua das Flores, 123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    reference_point: 'Próximo ao posto de saúde',
    income_range: 'R$ 1.000 - R$ 2.000',
    family_size: 4,
    children_count: 2,
    status: 'ativa'
  },
  {
    name: 'Família Santos',
    phone: '(11) 99999-2222',
    whatsapp: '(11) 99999-2222',
    email: 'familia.santos@email.com',
    street: 'Av. Principal, 456',
    neighborhood: 'Vila Nova',
    city: 'São Paulo',
    state: 'SP',
    reference_point: 'Em frente à escola',
    income_range: 'R$ 500 - R$ 1.000',
    family_size: 3,
    children_count: 1,
    status: 'ativa'
  },
  {
    name: 'Família Oliveira',
    phone: '(11) 99999-3333',
    whatsapp: '(11) 99999-3333',
    email: 'familia.oliveira@email.com',
    street: 'Rua da Esperança, 789',
    neighborhood: 'Jardim Alegre',
    city: 'São Paulo',
    state: 'SP',
    reference_point: 'Próximo à igreja',
    income_range: 'R$ 2.000 - R$ 3.000',
    family_size: 5,
    children_count: 3,
    status: 'ativa'
  },
  {
    name: 'Família Costa',
    phone: '(11) 99999-4444',
    whatsapp: '(11) 99999-4444',
    email: 'familia.costa@email.com',
    street: 'Rua do Progresso, 321',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    reference_point: 'Próximo ao mercado',
    income_range: 'R$ 1.500 - R$ 2.500',
    family_size: 3,
    children_count: 1,
    status: 'ativa',
    mentor_email: 'mentor@example.com' // Esta família já tem mentor
  },
  {
    name: 'Família Rodrigues',
    phone: '(11) 99999-5555',
    whatsapp: '(11) 99999-5555', 
    email: 'familia.rodrigues@email.com',
    street: 'Rua Nova, 654',
    neighborhood: 'Vila Esperança',
    city: 'São Paulo',
    state: 'SP',
    reference_point: 'Próximo à praça',
    income_range: 'R$ 800 - R$ 1.500',
    family_size: 6,
    children_count: 4,
    status: 'ativa'
  }
]

async function seedFamilies() {
  console.log('🌱 Inserindo famílias de exemplo...\n')

  try {
    // Primeiro, verificar se já existem famílias
    const { count, error: countError } = await supabase
      .from('families')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Erro ao verificar famílias:', countError)
      return
    }

    console.log(`📊 Famílias existentes: ${count || 0}`)

    if (count > 0) {
      console.log('ℹ️  Já existem famílias na base. Deseja continuar? (y/n)')
      // Para simplicidade, vamos continuar automaticamente
      console.log('✅ Continuando com a inserção...')
    }

    // Inserir famílias uma por vez para melhor controle
    for (let i = 0; i < familiesData.length; i++) {
      const family = familiesData[i]
      console.log(`📝 Inserindo: ${family.name}`)

      const { data, error } = await supabase
        .from('families')
        .insert(family)
        .select()

      if (error) {
        console.error(`❌ Erro ao inserir ${family.name}:`, error.message)
      } else {
        console.log(`✅ ${family.name} inserida com sucesso`)
      }
    }

    // Verificar resultado final
    const { count: finalCount, error: finalCountError } = await supabase
      .from('families')
      .select('*', { count: 'exact', head: true })

    if (!finalCountError) {
      console.log(`\n🎉 Processo concluído! Total de famílias: ${finalCount}`)
    }

    // Mostrar algumas famílias para confirmação
    const { data: sampleFamilies, error: sampleError } = await supabase
      .from('families')
      .select('name, email, mentor_email')
      .limit(5)

    if (!sampleError && sampleFamilies) {
      console.log('\n📋 Famílias na base:')
      sampleFamilies.forEach((family, index) => {
        console.log(`   ${index + 1}. ${family.name} (${family.email})`)
        if (family.mentor_email) {
          console.log(`      Mentor: ${family.mentor_email}`)
        }
      })
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

seedFamilies()

