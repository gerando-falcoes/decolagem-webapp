import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface SignupRequest {
  name: string
  email: string
  phone: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }

    const { name, email, phone, password }: SignupRequest = await request.json()

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome, email, telefone e senha' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate phone format (Brazilian)
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Formato de telefone inválido. Use: (11) 99999-9999' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Initialize Supabase client with service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta' },
        { status: 500, headers: corsHeaders }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Check if email already exists in profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409, headers: corsHeaders }
      )
    }

    // Create user in Supabase Auth with auto-confirmation
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: name,
        phone: phone,
        role: 'mentor'
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Erro ao criar usuário: ' + authError.message },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!authUser.user) {
      return NextResponse.json(
        { error: 'Falha ao criar usuário' },
        { status: 500, headers: corsHeaders }
      )
    }

    // Insert into profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        name: name,
        email: email,
        phone: phone,
        role: 'mentor',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      
      // Delete the auth user if profile creation failed
      await supabase.auth.admin.deleteUser(authUser.user.id)
      
      return NextResponse.json(
        { error: 'Erro ao criar perfil: ' + profileError.message },
        { status: 500, headers: corsHeaders }
      )
    }

    console.log('✅ Mentor cadastrado com sucesso:', email)

    return NextResponse.json(
      {
        success: true,
        message: 'Mentor cadastrado com sucesso! Agora você pode fazer login.',
        user: {
          id: authUser.user.id,
          email: email,
          name: name
        }
      },
      {
        status: 201,
        headers: corsHeaders
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new Response('ok', {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  })
}
