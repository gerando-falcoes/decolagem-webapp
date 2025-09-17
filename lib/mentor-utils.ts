import { useState, useEffect } from 'react'
import { useAuth } from './auth'

/**
 * Verifica se um email pertence a um mentor
 * @param email - Email a ser verificado
 * @returns Promise<boolean> - true se for mentor, false caso contrário
 */
export async function isMentorEmail(email: string | null | undefined): Promise<boolean> {
  if (!email) return false

  try {
    console.log(`🔍 Verificando mentor via API para: ${email}`)
    
    // Usar a API para verificar mentor (bypassa RLS)
    const response = await fetch('/api/auth/check-mentor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })

    if (!response.ok) {
      console.error('❌ Erro na API de verificação de mentor:', response.status)
      return false
    }

    const result = await response.json()
    console.log(`✅ Resultado da verificação de mentor:`, result)

    return result.isMentor || false
  } catch (error) {
    console.error('❌ Erro ao verificar se email é mentor:', error)
    return false
  }
}

/**
 * Hook personalizado para verificar se o usuário atual é mentor
 */
export function useIsMentor() {
  const [isMentor, setIsMentor] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function checkMentorStatus() {
      if (!user?.email) {
        setIsMentor(false)
        setLoading(false)
        return
      }

      try {
        const mentorStatus = await isMentorEmail(user.email)
        setIsMentor(mentorStatus)
      } catch (error) {
        console.error('Erro ao verificar status de mentor:', error)
        setIsMentor(false)
      } finally {
        setLoading(false)
      }
    }

    checkMentorStatus()
  }, [user?.email])

  return { isMentor, loading }
}

