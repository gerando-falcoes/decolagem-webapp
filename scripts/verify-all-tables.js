// Script para verificar todas as tabelas do Supabase
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Lista de tabelas esperadas baseada no types.ts
const expectedTables = [
  'profiles',
  'families', 
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
  'family_goals',
  'family_goal_events'
]

async function verifyAllTables() {
  console.log('🔍 Verificando todas as tabelas do Supabase...\n')
  
  const results = {
    existing: [],
    missing: [],
    errors: [],
    structures: {}
  }
  
  for (const tableName of expectedTables) {
    try {
      console.log(`📊 Verificando tabela: ${tableName}`)
      
      // Tentar fazer uma consulta simples na tabela
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Tabela não existe
          results.missing.push(tableName)
          console.log(`   ❌ NÃO EXISTE`)
        } else {
          // Tabela existe mas pode ter erro de permissão ou estrutura
          results.existing.push(tableName)
          console.log(`   ✅ EXISTE (erro: ${error.message})`)
          
          // Tentar obter estrutura mesmo com erro
          try {
            const { data: structureData } = await supabase
              .from(tableName)
              .select('*')
              .limit(1)
            
            if (structureData && structureData.length > 0) {
              results.structures[tableName] = Object.keys(structureData[0])
            }
          } catch (e) {
            console.log(`   ⚠️  Não foi possível obter estrutura: ${e.message}`)
          }
        }
      } else {
        results.existing.push(tableName)
        console.log(`   ✅ EXISTE`)
        
        // Obter estrutura da tabela
        if (data && data.length > 0) {
          results.structures[tableName] = Object.keys(data[0])
          console.log(`   📋 Colunas: ${Object.keys(data[0]).length}`)
        } else {
          console.log(`   📋 Tabela vazia`)
        }
      }
    } catch (err) {
      results.errors.push({ table: tableName, error: err.message })
      console.log(`   ❌ ERRO: ${err.message}`)
    }
  }
  
  // Verificar tabelas adicionais que podem existir
  console.log('\n🔍 Verificando tabelas adicionais...')
  const additionalTables = ['dignometro_assessments', 'auth.users', 'storage.objects']
  
  for (const tableName of additionalTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (!error) {
        results.existing.push(tableName)
        console.log(`   ✅ ${tableName} - EXISTE`)
        
        if (data && data.length > 0) {
          results.structures[tableName] = Object.keys(data[0])
        }
      }
    } catch (err) {
      console.log(`   ❌ ${tableName} - ERRO: ${err.message}`)
    }
  }
  
  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL:')
  console.log('==================')
  console.log(`✅ Tabelas existentes: ${results.existing.length}`)
  console.log(`❌ Tabelas faltando: ${results.missing.length}`)
  console.log(`⚠️  Erros encontrados: ${results.errors.length}`)
  
  if (results.existing.length > 0) {
    console.log('\n✅ TABELAS ENCONTRADAS:')
    results.existing.forEach(table => {
      const colCount = results.structures[table] ? results.structures[table].length : '?'
      console.log(`  - ${table} (${colCount} colunas)`)
    })
  }
  
  if (results.missing.length > 0) {
    console.log('\n❌ TABELAS FALTANDO:')
    results.missing.forEach(table => console.log(`  - ${table}`))
  }
  
  if (results.errors.length > 0) {
    console.log('\n⚠️  ERROS ENCONTRADOS:')
    results.errors.forEach(err => console.log(`  - ${err.table}: ${err.error}`))
  }
  
  // Mostrar estruturas detalhadas
  console.log('\n📋 ESTRUTURAS DAS TABELAS:')
  console.log('==========================')
  Object.entries(results.structures).forEach(([table, columns]) => {
    console.log(`\n${table}:`)
    columns.forEach(col => console.log(`  - ${col}`))
  })
  
  return results
}

verifyAllTables().catch(console.error)
