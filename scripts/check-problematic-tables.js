// Script para verificar tabelas com problemas de acesso
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

const problematicTables = [
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
  'family_goal_events'
]

async function checkProblematicTables() {
  console.log('🔍 Verificando tabelas com problemas de acesso...\n')
  
  for (const tableName of problematicTables) {
    console.log(`📊 Verificando: ${tableName}`)
    
    try {
      // Tentar diferentes abordagens
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`   ❌ Erro: ${error.message}`)
        console.log(`   📋 Código: ${error.code}`)
        
        // Tentar com select específico
        try {
          const { data: testData, error: testError } = await supabase
            .from(tableName)
            .select('id')
            .limit(1)
          
          if (!testError) {
            console.log(`   ✅ Acesso com select específico funcionou`)
          }
        } catch (e) {
          console.log(`   ❌ Mesmo com select específico falhou: ${e.message}`)
        }
      } else {
        console.log(`   ✅ Acesso funcionou!`)
        if (data && data.length > 0) {
          console.log(`   📋 Colunas: ${Object.keys(data[0]).join(', ')}`)
        }
      }
    } catch (err) {
      console.log(`   ❌ Erro geral: ${err.message}`)
    }
    
    console.log('')
  }
}

checkProblematicTables().catch(console.error)
