/**
 * TESTE FINAL: Verificar se as recomendações automáticas estão funcionando
 * 
 * Problema reportado: "Erro ao carregar triggers"
 * Solução aplicada: Removido conflito com useSharePointRecommendations
 */

console.log('🧪 TESTE FINAL: Recomendações Automáticas')
console.log('=' * 60)

const familyId = 'a0b1c1dd-6608-4bf1-b41b-9a39eaacc5dc' // Família TESTE

async function testRecommendationsAPI() {
  console.log('\n🔍 1. TESTANDO API /api/dignometer/triggers')
  console.log('   Familie ID:', familyId)
  
  try {
    const response = await fetch(`http://localhost:3000/api/dignometer/triggers?family_id=${familyId}`)
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }
    
    const result = await response.json()
    
    console.log('   ✅ API funcionando!')
    console.log('   📊 Dados retornados:')
    console.log(`      • Possui dignômetro: ${result.data.has_dignometer}`)
    console.log(`      • Dimensões vulneráveis: ${result.data.vulnerable_dimensions.length}`)
    console.log(`      • Total de recomendações: ${result.data.total_recommendations}`)
    
    if (result.data.vulnerable_dimensions.length > 0) {
      console.log('   🎯 Dimensões vulneráveis encontradas:')
      result.data.vulnerable_dimensions.forEach(dim => {
        console.log(`      • ${dim}`)
      })
    }
    
    if (result.data.total_recommendations > 0) {
      console.log('\n   🎯 Recomendações geradas:')
      result.data.auto_recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`      ${index + 1}. ${rec.goal}`)
        console.log(`         Dimensão: ${rec.dimension}`)
        console.log(`         Prioridade: ${rec.priority_level}`)
        console.log(`         Status: ${rec.status}`)
        console.log('')
      })
    }
    
    return result
    
  } catch (error) {
    console.log('   ❌ Erro na API:', error.message)
    return null
  }
}

async function testDignometerData() {
  console.log('\n🔍 2. VERIFICANDO DADOS DO DIGNÔMETRO')
  
  try {
    const response = await fetch(`http://localhost:3000/api/families/${familyId}/dignometer/latest`)
    
    if (!response.ok) {
      console.log('   ❌ Família não possui dignômetro')
      return null
    }
    
    const result = await response.json()
    
    console.log('   ✅ Dignômetro encontrado!')
    console.log('   📊 Respostas:')
    
    const answers = result.dignometer.answers
    Object.keys(answers).forEach(dimension => {
      const value = answers[dimension]
      const status = value ? '✅ OK' : '❌ VULNERÁVEL'
      console.log(`      • ${dimension}: ${value} ${status}`)
    })
    
    const vulnerableDimensions = Object.keys(answers).filter(dim => answers[dim] === false)
    console.log(`\n   🎯 ${vulnerableDimensions.length} dimensão(ões) vulnerável(eis)`)
    
    return result
    
  } catch (error) {
    console.log('   ❌ Erro ao buscar dignômetro:', error.message)
    return null
  }
}

async function runFullTest() {
  console.log('🚀 Iniciando teste completo...\n')
  
  // Teste 1: Verificar dados do dignômetro
  const dignometerData = await testDignometerData()
  
  // Teste 2: Verificar API de recomendações
  const recommendationsData = await testRecommendationsAPI()
  
  console.log('\n📋 RESUMO DO TESTE:')
  console.log('=' * 60)
  
  if (dignometerData && recommendationsData) {
    console.log('✅ SUCESSO - Sistema funcionando completamente!')
    console.log('')
    console.log('🎯 STATUS:')
    console.log(`   • Dignômetro: ✅ Encontrado`)
    console.log(`   • API Triggers: ✅ Funcionando`)
    console.log(`   • Recomendações: ✅ ${recommendationsData.data.total_recommendations} geradas`)
    console.log(`   • Dimensões vulneráveis: ✅ ${recommendationsData.data.vulnerable_dimensions.length}`)
    
    console.log('\n🔧 CORREÇÃO APLICADA:')
    console.log('   • Removido conflito com useSharePointRecommendations')
    console.log('   • Modal usando apenas useDignometerTriggers')
    console.log('   • Helper functions movidas para o componente')
    
    console.log('\n🌐 TESTE NO BROWSER:')
    console.log('   1. Acesse: http://localhost:3000/families/a0b1c1dd-6608-4bf1-b41b-9a39eaacc5dc')
    console.log('   2. Clique: "Adicionar Meta"')
    console.log('   3. Verifique: Aba "Recomendações Automáticas" funcionando')
    console.log('   4. Esperado: 3 recomendações para dimensão "água"')
    
  } else {
    console.log('❌ FALHA - Sistema com problemas')
    
    if (!dignometerData) {
      console.log('   • Dignômetro: ❌ Não encontrado')
    }
    
    if (!recommendationsData) {
      console.log('   • API Triggers: ❌ Não funcionando')
    }
  }
  
  console.log('\n🎉 TESTE FINALIZADO!')
}

// Executar teste se for chamado diretamente
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch')
  runFullTest().catch(console.error)
} else {
  // Browser environment
  runFullTest().catch(console.error)
}
