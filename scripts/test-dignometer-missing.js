/**
 * TESTE: Verificar por que recomendações não aparecem para família TESTE
 * 
 * PROBLEMA ENCONTRADO: Família TESTE não possui dignômetro!
 * SOLUÇÃO: Criar sessão do dignômetro com vulnerabilidades
 */

console.log('🔍 INVESTIGAÇÃO: Família TESTE sem recomendações')
console.log('=' * 60)

const familyId = 'a0b1c1dd-6608-4bf1-b41b-9a39eaacc5dc'

async function checkDignometerExists() {
  console.log('\n1. VERIFICANDO DIGNÔMETRO DA FAMÍLIA TESTE')
  console.log('   Family ID:', familyId)
  
  try {
    const response = await fetch(`http://localhost:3000/api/families/${familyId}/dignometer/latest`)
    
    if (response.status === 404) {
      console.log('   ❌ PROBLEMA ENCONTRADO!')
      console.log('   🚫 Família TESTE não possui dignômetro')
      console.log('   💡 Sem dignômetro = Sem vulnerabilidades = Sem recomendações')
      return false
    }
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('   ✅ Dignômetro encontrado!')
    console.log('   📊 Respostas:', JSON.stringify(result.dignometer.answers, null, 2))
    return true
    
  } catch (error) {
    console.log('   ❌ Erro ao verificar dignômetro:', error.message)
    return false
  }
}

async function testRecommendationsAPI() {
  console.log('\n2. TESTANDO API DE RECOMENDAÇÕES')
  
  try {
    const response = await fetch(`http://localhost:3000/api/dignometer/triggers?family_id=${familyId}`)
    
    if (!response.ok) {
      console.log('   ❌ API retornou erro:', response.status)
      return null
    }
    
    const result = await response.json()
    
    console.log('   📊 Resultado da API:')
    console.log(`      • has_dignometer: ${result.data.has_dignometer}`)
    console.log(`      • vulnerable_dimensions: ${result.data.vulnerable_dimensions?.length || 0}`)
    console.log(`      • total_recommendations: ${result.data.total_recommendations}`)
    
    if (!result.data.has_dignometer) {
      console.log('   🚫 Família não possui dignômetro - nenhuma recomendação gerada')
    }
    
    return result
    
  } catch (error) {
    console.log('   ❌ Erro na API:', error.message)
    return null
  }
}

async function simulateAfterDignometerCreation() {
  console.log('\n3. SIMULAÇÃO: APÓS CRIAR DIGNÔMETRO')
  console.log('   (Com as vulnerabilidades que serão inseridas)')
  
  // Simular dignômetro com vulnerabilidades
  const mockDignometerAnswers = {
    moradia: true,
    agua: false,           // VULNERÁVEL
    saneamento: false,     // VULNERÁVEL  
    educacao: true,
    saude: false,          // VULNERÁVEL
    alimentacao: true,
    renda_diversificada: true,
    renda_estavel: true,
    poupanca: true,
    bens_conectividade: true
  }
  
  console.log('   📊 Respostas que serão inseridas:')
  Object.keys(mockDignometerAnswers).forEach(dimension => {
    const value = mockDignometerAnswers[dimension]
    const status = value ? '✅ OK' : '❌ VULNERÁVEL'
    console.log(`      • ${dimension}: ${value} ${status}`)
  })
  
  const vulnerableDimensions = Object.keys(mockDignometerAnswers).filter(
    dim => mockDignometerAnswers[dim] === false
  )
  
  console.log(`\n   🎯 ${vulnerableDimensions.length} dimensões vulneráveis:`)
  vulnerableDimensions.forEach(dim => console.log(`      • ${dim}`))
  
  console.log(`\n   🎯 Recomendações esperadas: ${vulnerableDimensions.length * 3} (3 por dimensão vulnerável)`)
  console.log('      • 3 para água')
  console.log('      • 3 para saneamento') 
  console.log('      • 3 para saúde')
}

async function runDiagnostic() {
  console.log('🚀 Iniciando diagnóstico...\n')
  
  // Verificar se dignômetro existe
  const hasDigno = await checkDignometerExists()
  
  // Testar API de recomendações
  const apiResult = await testRecommendationsAPI()
  
  // Simular resultado após criação
  await simulateAfterDignometerCreation()
  
  console.log('\n📋 DIAGNÓSTICO COMPLETO:')
  console.log('=' * 60)
  
  if (!hasDigno) {
    console.log('❌ PROBLEMA CONFIRMADO!')
    console.log('')
    console.log('🔍 CAUSA RAIZ:')
    console.log('   • Família TESTE não possui sessão do dignômetro')
    console.log('   • Sem dignômetro = Sem dados de vulnerabilidade')
    console.log('   • Sem vulnerabilidades = Sem recomendações automáticas')
    
    console.log('\n✅ SOLUÇÃO:')
    console.log('   1. Executar: scripts/sql/create_dignometer_teste_family.sql')
    console.log('   2. Abrir Supabase Dashboard → SQL Editor')
    console.log('   3. Colar e executar o script SQL')
    console.log('   4. Recarregar a página da família TESTE')
    
    console.log('\n🎯 RESULTADO ESPERADO:')
    console.log('   • Dignômetro criado com 3 vulnerabilidades')
    console.log('   • 9 recomendações automáticas geradas')
    console.log('   • Aba "Recomendações Automáticas" funcionando')
    
  } else {
    console.log('✅ Dignômetro existe, investigando outro problema...')
  }
  
  console.log('\n🎉 DIAGNÓSTICO FINALIZADO!')
}

// Executar diagnóstico se for chamado diretamente
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch')
  runDiagnostic().catch(console.error)
} else {
  // Browser environment
  runDiagnostic().catch(console.error)
}
