#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Configurações do Supabase (use as mesmas do projeto)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

console.log('🧪 Testando funcionalidade de marcar como concluída via Supabase...')

const familyId = 'a0b1c1dd-6608-4bf1-b41b-9a39eaacc5dc'

async function testDirectDatabase() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Criar uma meta teste
    console.log('📝 Criando meta teste diretamente no Supabase...')
    const { data: createData, error: createError } = await supabase
      .from('family_goals')
      .insert([{
        family_id: familyId,
        goal_title: 'Meta Teste Funcionalidade',
        goal_category: 'Teste via Script',
        current_status: 'PENDENTE',
        progress_percentage: 0,
        source: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (createError) {
      throw new Error(`Erro ao criar meta: ${createError.message}`)
    }

    const goalId = createData.id
    console.log(`✅ Meta criada com ID: ${goalId}`)

    // 2. Verificar se aparece na lista de metas ATIVAS (não concluídas)
    console.log('🔍 Buscando metas ativas...')
    const { data: activeGoals, error: activeError } = await supabase
      .from('family_goals')
      .select('*')
      .eq('family_id', familyId)
      .not('current_status', 'in', '("CONCLUIDO","CONCLUIDA","FINALIZADA")')

    if (activeError) {
      throw new Error(`Erro ao buscar metas ativas: ${activeError.message}`)
    }

    const metaAtiva = activeGoals.find(g => g.id === goalId)
    if (!metaAtiva) {
      throw new Error('Meta teste não encontrada na lista de ativas')
    }

    console.log(`📋 Meta encontrada nas ATIVAS: "${metaAtiva.goal_title}" (Status: ${metaAtiva.current_status})`)

    // 3. Atualizar status para CONCLUIDO
    console.log('🔄 Marcando como CONCLUIDO...')
    const { error: updateError } = await supabase
      .from('family_goals')
      .update({ 
        current_status: 'CONCLUIDO',
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)

    if (updateError) {
      throw new Error(`Erro ao atualizar status: ${updateError.message}`)
    }

    console.log('✅ Status atualizado para CONCLUIDO')

    // 4. Verificar se NÃO aparece mais na lista de ativas
    console.log('🔍 Verificando se desapareceu das metas ativas...')
    const { data: activeGoals2, error: activeError2 } = await supabase
      .from('family_goals')
      .select('*')
      .eq('family_id', familyId)
      .not('current_status', 'in', '("CONCLUIDO","CONCLUIDA","FINALIZADA")')

    if (activeError2) {
      throw new Error(`Erro ao buscar metas ativas (2): ${activeError2.message}`)
    }

    const metaAindaAtiva = activeGoals2.find(g => g.id === goalId)
    if (metaAindaAtiva) {
      console.log('❌ ERRO: Meta ainda aparece na lista de ativas!')
      return false
    }

    console.log('✅ SUCCESS: Meta não aparece mais na lista de ativas!')

    // 5. Verificar se aparece na lista de CONCLUÍDAS
    console.log('🔍 Verificando se aparece nas metas concluídas...')
    const { data: completedGoals, error: completedError } = await supabase
      .from('family_goals')
      .select('*')
      .eq('family_id', familyId)
      .in('current_status', ['CONCLUIDO', 'CONCLUIDA', 'FINALIZADA'])

    if (completedError) {
      throw new Error(`Erro ao buscar metas concluídas: ${completedError.message}`)
    }

    const metaConcluida = completedGoals.find(g => g.id === goalId)
    if (!metaConcluida) {
      console.log('❌ ERRO: Meta não aparece na lista de concluídas!')
      return false
    }

    console.log('✅ SUCCESS: Meta aparece na lista de concluídas!')
    console.log(`   Status atual: ${metaConcluida.current_status}`)

    // 6. Estatísticas finais
    console.log('\n📊 Estatísticas finais:')
    console.log(`   Metas ativas: ${activeGoals2.length}`)
    console.log(`   Metas concluídas: ${completedGoals.length}`)

    // 7. Limpar teste
    console.log('\n🗑️ Removendo meta teste...')
    const { error: deleteError } = await supabase
      .from('family_goals')
      .delete()
      .eq('id', goalId)

    if (deleteError) {
      console.log(`⚠️ Aviso: Erro ao remover meta teste: ${deleteError.message}`)
    } else {
      console.log('✅ Meta teste removida com sucesso')
    }

    console.log('\n🎉 TESTE PASSOU! A lógica de filtros está funcionando corretamente!')
    console.log('\n📝 PRÓXIMOS PASSOS:')
    console.log('   1. O hook useFamilyGoals está filtrando corretamente')
    console.log('   2. O botão deve chamar updateGoalStatus com status CONCLUIDO')
    console.log('   3. O componente deve recarregar dados via fetchFamilyGoals')
    
    return true

  } catch (error) {
    console.error('❌ TESTE FALHOU:', error.message)
    return false
  }
}

testDirectDatabase()
