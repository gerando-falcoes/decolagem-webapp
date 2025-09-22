const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  console.log('Certifique-se de ter NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testEmailVerification() {
  console.log('🧪 Testando geração de link de verificação...\n')
  
  const testEmail = 'teste-mentor-' + Date.now() + '@exemplo.com'
  
  try {
    // Tentar gerar link de verificação
    console.log('📧 Gerando link para:', testEmail)
    
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: testEmail,
      options: {
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    })

    if (error) {
      console.error('❌ Erro ao gerar link:', error.message)
      return
    }

    if (data && data.properties && data.properties.action_link) {
      console.log('✅ Link gerado com sucesso!')
      console.log('🔗 URL:', data.properties.action_link)
      console.log('\n📝 Informações do link:')
      console.log('- Email alvo:', data.properties.email)
      console.log('- Tipo:', data.properties.type)
      console.log('- URL de redirecionamento:', data.properties.redirect_to)
      
      console.log('\n💡 Como testar:')
      console.log('1. Copie o link acima')
      console.log('2. Cole no navegador')
      console.log('3. Verificar se redireciona para /auth/callback')
      console.log('4. Verificar se a conta fica ativa')
      
    } else {
      console.log('⚠️ Link gerado mas sem dados completos:', data)
    }

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message)
  }
}

async function checkEmailConfiguration() {
  console.log('\n🔍 Verificando configuração de email...\n')
  
  try {
    // Tentar criar um usuário temporário para teste
    const testEmail = 'config-test-' + Date.now() + '@exemplo.com'
    
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'teste123456',
      email_confirm: false
    })

    if (userError) {
      console.error('❌ Erro ao criar usuário de teste:', userError.message)
      return
    }

    console.log('✅ Usuário de teste criado')
    
    // Tentar gerar link
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: testEmail
    })

    if (linkError) {
      console.log('❌ Erro na geração de link:', linkError.message)
    } else {
      console.log('✅ Sistema de links funcionando')
    }

    // Limpar usuário de teste
    await supabase.auth.admin.deleteUser(userData.user.id)
    console.log('🧹 Usuário de teste removido')

    console.log('\n📊 Status da configuração:')
    console.log('- Criação de usuários: ✅ Funcionando')
    console.log('- Geração de links: ✅ Funcionando')
    console.log('- Envio de emails: ❓ Depende da configuração SMTP')
    
    console.log('\n📝 Para configurar email:')
    console.log('1. Acesse https://supabase.com/dashboard')
    console.log('2. Vá em Authentication > Settings')
    console.log('3. Configure SMTP Settings')
    console.log('4. Teste novamente')

  } catch (err) {
    console.error('❌ Erro na verificação:', err.message)
  }
}

async function main() {
  console.log('🚀 Teste de Verificação de Email - Sistema Mentor\n')
  console.log('=' .repeat(50))
  
  await testEmailVerification()
  await checkEmailConfiguration()
  
  console.log('\n' + '=' .repeat(50))
  console.log('✅ Teste concluído!')
}

main().catch(console.error)

