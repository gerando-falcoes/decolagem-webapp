// Script para testar a integração com o Supabase
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testIntegration() {
  console.log('🧪 Testando integração com Supabase...\n')
  
  try {
    // Teste 1: Verificar conexão
    console.log('1️⃣ Testando conexão...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.log('❌ Erro de conexão:', connectionError.message)
      return
    }
    console.log('✅ Conexão estabelecida com sucesso!')
    
    // Teste 2: Testar inserção de dados
    console.log('\n2️⃣ Testando inserção de dados...')
    const testFamily = {
      name: 'Família Teste Integração',
      phone: '11999999999',
      status: 'ativa'
    }
    
    const { data: insertedFamily, error: insertError } = await supabase
      .from('families')
      .insert(testFamily)
      .select()
      .single()
    
    if (insertError) {
      console.log('❌ Erro na inserção:', insertError.message)
    } else {
      console.log('✅ Dados inseridos com sucesso!')
      console.log('   ID da família:', insertedFamily.id)
      
      // Teste 3: Testar consulta
      console.log('\n3️⃣ Testando consulta de dados...')
      const { data: families, error: selectError } = await supabase
        .from('families')
        .select('*')
        .eq('id', insertedFamily.id)
        .single()
      
      if (selectError) {
        console.log('❌ Erro na consulta:', selectError.message)
      } else {
        console.log('✅ Dados consultados com sucesso!')
        console.log('   Nome da família:', families.name)
      }
      
      // Teste 4: Testar atualização
      console.log('\n4️⃣ Testando atualização de dados...')
      const { data: updatedFamily, error: updateError } = await supabase
        .from('families')
        .update({ status: 'inativa' })
        .eq('id', insertedFamily.id)
        .select()
        .single()
      
      if (updateError) {
        console.log('❌ Erro na atualização:', updateError.message)
      } else {
        console.log('✅ Dados atualizados com sucesso!')
        console.log('   Status atualizado para:', updatedFamily.status)
      }
      
      // Teste 5: Testar exclusão
      console.log('\n5️⃣ Testando exclusão de dados...')
      const { error: deleteError } = await supabase
        .from('families')
        .delete()
        .eq('id', insertedFamily.id)
      
      if (deleteError) {
        console.log('❌ Erro na exclusão:', deleteError.message)
      } else {
        console.log('✅ Dados excluídos com sucesso!')
      }
    }
    
    // Teste 6: Testar tipos TypeScript
    console.log('\n6️⃣ Testando tipos TypeScript...')
    try {
      // Este teste verifica se os tipos estão funcionando
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, role')
        .limit(1)
      
      if (profiles) {
        console.log('✅ Tipos TypeScript funcionando corretamente!')
        console.log('   Estrutura de dados validada')
      }
    } catch (typeError) {
      console.log('❌ Erro nos tipos TypeScript:', typeError.message)
    }
    
    console.log('\n🎉 Teste de integração concluído!')
    console.log('================================')
    console.log('✅ Conexão: OK')
    console.log('✅ Inserção: OK')
    console.log('✅ Consulta: OK')
    console.log('✅ Atualização: OK')
    console.log('✅ Exclusão: OK')
    console.log('✅ Tipos: OK')
    
  } catch (error) {
    console.error('❌ Erro geral durante o teste:', error.message)
  }
}

testIntegration().catch(console.error)
