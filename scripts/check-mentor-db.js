require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkMentorInDatabase() {
  try {
    console.log('🔍 Verificando mentor no banco de dados...')
    
    const mentorEmail = 'mentor.teste@gmail.com'
    
    // 1. Verificar se existe na tabela profiles
    console.log('\n📋 1. Verificando tabela profiles...')
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', mentorEmail)
    
    if (profileError) {
      console.error('❌ Erro ao consultar profiles:', profileError.message)
    } else {
      console.log('✅ Dados encontrados na tabela profiles:', profileData)
    }
    
    // 2. Verificar se existe na autenticação
    console.log('\n🔐 2. Verificando usuário na autenticação...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Erro ao listar usuários:', authError.message)
    } else {
      const mentorUser = authUsers.users.find(user => user.email === mentorEmail)
      console.log('👤 Usuário na autenticação:', mentorUser ? {
        id: mentorUser.id,
        email: mentorUser.email,
        created_at: mentorUser.created_at
      } : 'Não encontrado')
    }
    
    // 3. Testar a API diretamente
    console.log('\n🌐 3. Testando API de verificação...')
    try {
      const response = await fetch('http://localhost:3001/api/auth/check-mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: mentorEmail })
      })
      
      const apiResult = await response.json()
      console.log('📡 Resultado da API:', apiResult)
    } catch (fetchError) {
      console.error('❌ Erro ao chamar API:', fetchError.message)
    }
    
    // 4. Verificar estrutura da tabela profiles
    console.log('\n🏗️ 4. Verificando estrutura da tabela profiles...')
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('email, role, name')
      .limit(5)
    
    if (allError) {
      console.error('❌ Erro ao buscar profiles:', allError.message)
    } else {
      console.log('📊 Primeiros 5 profiles na tabela:', allProfiles)
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkMentorInDatabase()

