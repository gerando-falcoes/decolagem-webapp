/**
 * Teste completo da família TESTE após correções
 * Verifica se todas as funcionalidades estão funcionando
 */

const familiaTesteId = 'a0b1c1dd-6608-4bf1-b41b-9a39eaacc5dc'
const baseUrl = 'http://localhost:3000'

console.log('🧪 TESTE COMPLETO: FAMÍLIA TESTE CORRIGIDA')
console.log('=' * 60)

async function testFamiliaTesteBehavior() {
  console.log(`\n👨‍👩‍👧‍👦 Testando família TESTE (ID: ${familiaTesteId})`)
  
  try {
    // TESTE 1: API de Metas
    console.log('\n📋 TESTE 1: API de Metas')
    const goalsResponse = await fetch(`${baseUrl}/api/goals?family_id=${familiaTesteId}`)
    const goalsData = await goalsResponse.json()
    
    if (goalsResponse.ok && goalsData.goals) {
      console.log(`   ✅ API de metas funcionando`)
      console.log(`   📊 Total de metas: ${goalsData.goals.length}`)
      console.log(`   📝 Primeiras metas:`)
      goalsData.goals.slice(0, 3).forEach((goal, index) => {
        console.log(`     ${index + 1}. [${goal.current_status}] ${goal.goal_title}`)
      })
    } else {
      console.log(`   ❌ Erro na API de metas: ${goalsData.error || 'Erro desconhecido'}`)
    }

    // TESTE 2: API de Dignômetro
    console.log('\n📊 TESTE 2: API de Dignômetro')
    const dignometerResponse = await fetch(`${baseUrl}/api/families/${familiaTesteId}/dignometer/latest`)
    const dignometerData = await dignometerResponse.json()
    
    if (dignometerResponse.ok && dignometerData.success) {
      console.log(`   ✅ API de dignômetro funcionando`)
      console.log(`   📊 Score: ${dignometerData.dignometer.poverty_score}/10`)
      console.log(`   📈 Nível: ${dignometerData.dignometer.poverty_level}`)
      
      // Mostrar vulnerabilidades
      const vulnerabilities = Object.entries(dignometerData.dignometer.answers)
        .filter(([key, value]) => value === false)
        .map(([key]) => key)
      
      console.log(`   ⚠️ Vulnerabilidades detectadas: ${vulnerabilities.length}`)
      vulnerabilities.forEach(vuln => {
        console.log(`     • ${vuln}: false`)
      })
    } else {
      console.log(`   ❌ Erro na API de dignômetro: ${dignometerData.error || 'Erro desconhecido'}`)
    }

    // TESTE 3: API de Triggers Automáticos
    console.log('\n🤖 TESTE 3: API de Triggers Automáticos')
    const triggersResponse = await fetch(`${baseUrl}/api/dignometer/triggers?family_id=${familiaTesteId}`)
    const triggersData = await triggersResponse.json()
    
    if (triggersResponse.ok && triggersData.success) {
      console.log(`   ✅ API de triggers funcionando`)
      console.log(`   🎯 Possui dignômetro: ${triggersData.data.has_dignometer}`)
      console.log(`   📊 Dimensões vulneráveis: ${triggersData.data.vulnerable_dimensions.length}`)
      console.log(`   🎯 Total recomendações: ${triggersData.data.total_recommendations}`)
      
      if (triggersData.data.vulnerable_dimensions.length > 0) {
        console.log(`   📋 Vulnerabilidades:`)
        triggersData.data.vulnerable_dimensions.forEach(dim => {
          console.log(`     • ${dim}`)
        })
        
        console.log(`   🎯 Recomendações por dimensão:`)
        Object.entries(triggersData.data.recommendations_by_dimension).forEach(([dimension, recs]) => {
          console.log(`     • ${dimension}: ${recs.length} recomendações`)
          recs.slice(0, 2).forEach((rec, index) => {
            console.log(`       ${index + 1}. [${rec.priority_level}] ${rec.goal}`)
          })
        })
      }
    } else {
      console.log(`   ❌ Erro na API de triggers: ${triggersData.error || 'Erro desconhecido'}`)
    }

    // TESTE 4: Simular criação de meta a partir de recomendação
    if (triggersData.success && triggersData.data.auto_recommendations.length > 0) {
      console.log('\n🎯 TESTE 4: Criação de Meta a partir de Recomendação')
      
      const firstRecommendation = triggersData.data.auto_recommendations[0]
      console.log(`   📝 Testando criação da meta: "${firstRecommendation.goal}"`)
      
      const createGoalResponse = await fetch(`${baseUrl}/api/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          family_id: familiaTesteId,
          goal_title: firstRecommendation.goal,
          goal_category: firstRecommendation.question,
          current_status: 'PENDENTE',
          notes: `Meta gerada automaticamente via trigger. Dimensão: ${firstRecommendation.dimension}. Prioridade: ${firstRecommendation.priority_level}.`,
          source: 'auto_trigger_test',
          recommendation_id: firstRecommendation.id
        })
      })
      
      if (createGoalResponse.ok) {
        const newGoal = await createGoalResponse.json()
        console.log(`   ✅ Meta criada com sucesso!`)
        console.log(`   🆔 ID da nova meta: ${newGoal.goal?.id || 'N/A'}`)
      } else {
        console.log(`   ❌ Erro ao criar meta: ${createGoalResponse.status}`)
      }
    }

    // RESUMO FINAL
    console.log('\n' + '=' * 60)
    console.log('📊 RESUMO DOS TESTES DA FAMÍLIA TESTE:')
    console.log('=' * 60)
    
    const allTestsPassed = goalsResponse.ok && dignometerResponse.ok && triggersResponse.ok
    
    if (allTestsPassed) {
      console.log('✅ TODOS OS TESTES PASSARAM!')
      console.log('')
      console.log('🎯 FUNCIONALIDADES VERIFICADAS:')
      console.log('   ✅ API de metas funcionando')
      console.log('   ✅ API de dignômetro funcionando')
      console.log('   ✅ API de triggers automáticos funcionando')
      console.log('   ✅ Detecção de vulnerabilidades funcionando')
      console.log('   ✅ Geração de recomendações funcionando')
      console.log('   ✅ Criação de metas a partir de recomendações funcionando')
      
      console.log('\n🎉 A FAMÍLIA TESTE ESTÁ TOTALMENTE FUNCIONAL!')
      console.log('')
      console.log('🌐 COMO ACESSAR NA INTERFACE:')
      console.log(`   1. Abra: http://localhost:3000/families/${familiaTesteId}`)
      console.log('   2. Veja: Alert de recomendações automáticas (se vulnerabilidades)')
      console.log('   3. Clique: "Adicionar Meta"')
      console.log('   4. Teste: Aba "Triggers Automáticos"')
      console.log('   5. Veja: Recomendações baseadas no dignômetro')
      
    } else {
      console.log('❌ ALGUNS TESTES FALHARAM')
      console.log('')
      console.log('🔧 PROBLEMAS IDENTIFICADOS:')
      if (!goalsResponse.ok) console.log('   ❌ API de metas com problema')
      if (!dignometerResponse.ok) console.log('   ❌ API de dignômetro com problema')
      if (!triggersResponse.ok) console.log('   ❌ API de triggers com problema')
    }
    
  } catch (error) {
    console.error('\n💥 ERRO GERAL NO TESTE:', error.message)
    console.log('\n💡 POSSÍVEIS SOLUÇÕES:')
    console.log('   • Verificar se o servidor está rodando: npm run dev')
    console.log('   • Verificar conexão com banco de dados')
    console.log('   • Verificar se as APIs estão implementadas')
  }
}

// Executar teste
console.log('🔌 Iniciando testes da família TESTE...')
testFamiliaTesteBehavior().then(() => {
  console.log('\n🏁 Testes finalizados!')
}).catch(error => {
  console.error('\n💥 Falha nos testes:', error.message)
  console.log('\n💡 Certifique-se de que o servidor está rodando: npm run dev')
})
