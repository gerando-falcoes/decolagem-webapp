// Script para listar todas as tabelas usando diferentes métodos
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

// Lista de tabelas para testar baseada no que sabemos que existe
const knownTables = [
  'profiles',
  'families',
  'family_goals', 
  'dignometro_assessments'
]

// Lista de tabelas que podem existir com nomes diferentes
const possibleTables = [
  'family_members',
  'assessments',
  'goals',
  'followups',
  'alerts',
  'attachments',
  'audit_logs',
  'dignometro_dimensions',
  'dignometro_questions',
  'dignometro_responses',
  'goal_templates',
  'family_goal_events',
  'dignometro_assessments',
  'family_goals'
]

async function listAllTables() {
  console.log('🔍 Listando todas as tabelas acessíveis...\n')
  
  const accessibleTables = []
  const inaccessibleTables = []
  
  // Testar tabelas conhecidas
  console.log('📊 TESTANDO TABELAS CONHECIDAS:')
  console.log('===============================')
  
  for (const tableName of knownTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${tableName} - Erro: ${error.message}`)
        inaccessibleTables.push(tableName)
      } else {
        console.log(`✅ ${tableName} - OK`)
        accessibleTables.push(tableName)
        
        if (data && data.length > 0) {
          console.log(`   📋 Colunas: ${Object.keys(data[0]).length}`)
        }
      }
    } catch (err) {
      console.log(`❌ ${tableName} - Erro geral: ${err.message}`)
      inaccessibleTables.push(tableName)
    }
  }
  
  // Testar tabelas possíveis
  console.log('\n📊 TESTANDO TABELAS POSSÍVEIS:')
  console.log('===============================')
  
  for (const tableName of possibleTables) {
    if (knownTables.includes(tableName)) continue // Já testada
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`❌ ${tableName} - NÃO EXISTE`)
        } else {
          console.log(`⚠️  ${tableName} - Erro: ${error.message}`)
          // Mesmo com erro, pode existir
          accessibleTables.push(tableName)
        }
      } else {
        console.log(`✅ ${tableName} - OK`)
        accessibleTables.push(tableName)
        
        if (data && data.length > 0) {
          console.log(`   📋 Colunas: ${Object.keys(data[0]).length}`)
        }
      }
    } catch (err) {
      console.log(`❌ ${tableName} - Erro geral: ${err.message}`)
    }
  }
  
  // Resumo final
  console.log('\n📊 RESUMO FINAL:')
  console.log('================')
  console.log(`✅ Tabelas acessíveis: ${accessibleTables.length}`)
  console.log(`❌ Tabelas inacessíveis: ${inaccessibleTables.length}`)
  
  if (accessibleTables.length > 0) {
    console.log('\n✅ TABELAS FUNCIONAIS:')
    accessibleTables.forEach(table => console.log(`  - ${table}`))
  }
  
  if (inaccessibleTables.length > 0) {
    console.log('\n❌ TABELAS COM PROBLEMAS:')
    inaccessibleTables.forEach(table => console.log(`  - ${table}`))
  }
  
  // Verificar se há tabelas com nomes similares
  console.log('\n🔍 VERIFICANDO TABELAS COM NOMES SIMILARES:')
  console.log('============================================')
  
  const similarNames = [
    { original: 'assessments', possible: 'dignometro_assessments' },
    { original: 'goals', possible: 'family_goals' },
    { original: 'family_members', possible: 'family_members' }
  ]
  
  for (const { original, possible } of similarNames) {
    try {
      const { data, error } = await supabase
        .from(possible)
        .select('*')
        .limit(1)
      
      if (!error) {
        console.log(`✅ ${possible} (substitui ${original})`)
      }
    } catch (err) {
      console.log(`❌ ${possible} - ${err.message}`)
    }
  }
}

listAllTables().catch(console.error)
