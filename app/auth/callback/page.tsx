'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const accessToken = urlParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token')
        const type = urlParams.get('type')
        const error = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')

        if (error) {
          setStatus('error')
          setMessage(errorDescription || 'Erro na verificação do email')
          return
        }

        if (type === 'signup' && accessToken && refreshToken) {
          // Initialize Supabase client
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          
          const supabase = createClient(supabaseUrl, supabaseAnonKey)

          // Set the session
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (sessionError) {
            setStatus('error')
            setMessage('Erro ao processar verificação: ' + sessionError.message)
            return
          }

          if (data.user) {
            // Update the user's email_confirmed status if needed
            setStatus('success')
            setMessage('Email verificado com sucesso! Redirecionando...')
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
              router.push('/?verified=true')
            }, 3000)
          } else {
            setStatus('error')
            setMessage('Não foi possível verificar o email')
          }
        } else {
          setStatus('error')
          setMessage('Link de verificação inválido ou expirado')
        }
      } catch (error) {
        console.error('Callback error:', error)
        setStatus('error')
        setMessage('Erro inesperado durante a verificação')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md text-center"
      >
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-16 w-16 text-blue-600 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-800">
              Verificando email...
            </h2>
            <p className="text-gray-600">
              Aguarde enquanto processamos sua verificação
            </p>
          </div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              Email Verificado!
            </h2>
            <p className="text-gray-600">{message}</p>
            <div className="pt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-green-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Redirecionando para o login...
              </p>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              Erro na Verificação
            </h2>
            <p className="text-gray-600">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
            >
              Voltar ao Login
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

