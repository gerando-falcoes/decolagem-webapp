// Script simples para verificar tabelas existentes
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Lista de tabelas que esperamos encontrar baseado no schema do outro projeto
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

async function checkTables() {
  console.log('🔍 Verificando tabelas existentes no banco...\n')
  
  const existingTables = []
  const missingTables = []
  
  for (const tableName of expectedTables) {
    try {
      // Tentar fazer uma consulta simples na tabela
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Tabela não existe
          missingTables.push(tableName)
          console.log(`❌ ${tableName} - NÃO EXISTE`)
        } else {
          // Tabela existe mas pode ter erro de permissão
          existingTables.push(tableName)
          console.log(`✅ ${tableName} - EXISTE (erro: ${error.message})`)
        }
      } else {
        existingTables.push(tableName)
        console.log(`✅ ${tableName} - EXISTE`)
      }
    } catch (err) {
      missingTables.push(tableName)
      console.log(`❌ ${tableName} - ERRO: ${err.message}`)
    }
  }
  
  console.log('\n📊 RESUMO:')
  console.log('==========')
  console.log(`✅ Tabelas existentes: ${existingTables.length}`)
  console.log(`❌ Tabelas faltando: ${missingTables.length}`)
  
  if (existingTables.length > 0) {
    console.log('\n✅ Tabelas encontradas:')
    existingTables.forEach(table => console.log(`  - ${table}`))
  }
  
  if (missingTables.length > 0) {
    console.log('\n❌ Tabelas que precisam ser criadas:')
    missingTables.forEach(table => console.log(`  - ${table}`))
  }
  
  // Verificar se há outras tabelas não listadas
  console.log('\n🔍 Verificando outras tabelas...')
  const otherTables = ['auth.users', 'storage.objects']
  
  for (const tableName of otherTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (!error) {
        console.log(`✅ ${tableName} - EXISTE`)
      }
    } catch (err) {
      console.log(`❌ ${tableName} - ERRO: ${err.message}`)
    }
  }
}

checkTables().catch(console.error)
