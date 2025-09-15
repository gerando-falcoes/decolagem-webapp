// Script para verificar tabelas reais usando SQL direto
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRealTables() {
  console.log('🔍 Verificando tabelas reais no banco...\n')
  
  try {
    // Usar RPC para executar SQL direto
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `
    })
    
    if (error) {
      console.log('❌ Erro ao executar SQL:', error.message)
      return
    }
    
    console.log('📋 TABELAS REAIS NO BANCO:')
    console.log('==========================')
    
    if (data && data.length > 0) {
      data.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name}`)
      })
      
      console.log(`\n📊 Total: ${data.length} tabelas encontradas`)
      
      // Verificar se as tabelas esperadas existem
      const existingTables = data.map(row => row.table_name)
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
      
      console.log('\n🔍 COMPARAÇÃO COM TABELAS ESPERADAS:')
      console.log('====================================')
      
      expectedTables.forEach(expectedTable => {
        if (existingTables.includes(expectedTable)) {
          console.log(`✅ ${expectedTable} - EXISTE`)
        } else {
          console.log(`❌ ${expectedTable} - NÃO EXISTE`)
        }
      })
      
      // Mostrar tabelas extras
      const extraTables = existingTables.filter(table => !expectedTables.includes(table))
      if (extraTables.length > 0) {
        console.log('\n➕ TABELAS EXTRAS ENCONTRADAS:')
        extraTables.forEach(table => console.log(`  - ${table}`))
      }
      
    } else {
      console.log('❌ Nenhuma tabela encontrada')
    }
    
  } catch (err) {
    console.log('❌ Erro geral:', err.message)
  }
}

checkRealTables().catch(console.error)
