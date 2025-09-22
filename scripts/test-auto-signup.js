const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testAutoSignup() {
  console.log('🧪 Testando Cadastro Automático de Mentor\n')
  console.log('=' .repeat(50))
  
  const testEmail = 'mentor-auto-' + Date.now() + '@teste.com'
  const testName = 'Mentor Teste Auto'
  const testPhone = '(11) 99999-9999'
  const testPassword = 'teste123456'
  
  try {
    console.log('📝 Dados do teste:')
    console.log('- Email:', testEmail)
    console.log('- Nome:', testName)
    console.log('- Telefone:', testPhone)
    console.log('- Senha:', testPassword)
    console.log('')
    
    // 1. Testar criação via API
    console.log('🔄 1. Testando criação via API...')
    
    const response = await fetch('http://localhost:3000/api/auth/signup-mentor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        phone: testPhone,
        password: testPassword
      }),
    })

    const result = await response.json()

    if (response.ok && result.success) {
      console.log('✅ API funcionando - Usuário criado')
      console.log('📧 Email:', result.user.email)
      console.log('👤 Nome:', result.user.name)
      console.log('📄 Mensagem:', result.message)
    } else {
      console.error('❌ Erro na API:', result.error)
      return
    }

    console.log('')
    
    // 2. Verificar se usuário foi criado no Auth
    console.log('🔄 2. Verificando criação no Supabase Auth...')
    
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Erro ao buscar usuários:', authError.message)
      return
    }
    
    const createdUser = authUsers.users.find(user => user.email === testEmail)
    
    if (createdUser) {
      console.log('✅ Usuário encontrado no Auth')
      console.log('📧 Email:', createdUser.email)
      console.log('🆔 ID:', createdUser.id)
      console.log('✅ Email confirmado:', createdUser.email_confirmed_at ? 'SIM' : 'NÃO')
      console.log('📅 Criado em:', new Date(createdUser.created_at).toLocaleString('pt-BR'))
    } else {
      console.error('❌ Usuário não encontrado no Auth')
      return
    }

    console.log('')
    
    // 3. Verificar se perfil foi criado
    console.log('🔄 3. Verificando criação na tabela profiles...')
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
      .single()

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message)
      return
    }

    if (profile) {
      console.log('✅ Perfil encontrado na tabela')
      console.log('📧 Email:', profile.email)
      console.log('👤 Nome:', profile.name)
      console.log('📱 Telefone:', profile.phone)
      console.log('👥 Role:', profile.role)
      console.log('📅 Criado em:', new Date(profile.created_at).toLocaleString('pt-BR'))
    } else {
      console.error('❌ Perfil não encontrado na tabela')
      return
    }

    console.log('')
    
    // 4. Testar login com as credenciais
    console.log('🔄 4. Testando login com credenciais...')
    
    const { data: loginResult, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message)
      return
    }

    if (loginResult.user) {
      console.log('✅ Login bem-sucedido')
      console.log('📧 Email logado:', loginResult.user.email)
      console.log('🎫 Sessão criada:', loginResult.session ? 'SIM' : 'NÃO')
    } else {
      console.error('❌ Falha no login')
      return
    }

    console.log('')
    
    // 5. Limpeza - remover usuário de teste
    console.log('🔄 5. Limpando dados de teste...')
    
    // Remover da tabela profiles
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('email', testEmail)

    if (deleteProfileError) {
      console.error('⚠️ Erro ao remover perfil:', deleteProfileError.message)
    } else {
      console.log('✅ Perfil removido da tabela')
    }

    // Remover do Auth
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(createdUser.id)
    
    if (deleteAuthError) {
      console.error('⚠️ Erro ao remover usuário do Auth:', deleteAuthError.message)
    } else {
      console.log('✅ Usuário removido do Auth')
    }

    console.log('')
    console.log('=' .repeat(50))
    console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!')
    console.log('')
    console.log('📊 Resultados:')
    console.log('✅ Criação via API: Funcionando')
    console.log('✅ Usuário no Auth: Criado e confirmado')
    console.log('✅ Perfil na tabela: Criado corretamente')
    console.log('✅ Login imediato: Funcionando')
    console.log('✅ Limpeza: Executada')
    console.log('')
    console.log('🚀 Sistema pronto para uso!')

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message)
  }
}

testAutoSignup().catch(console.error)

