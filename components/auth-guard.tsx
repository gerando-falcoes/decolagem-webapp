'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Se não estiver carregando, não houver usuário e a rota não for a de login (raiz),
    // redireciona para a página de login.
    if (!loading && !user && pathname !== '/') {
      router.push('/')
    }
    // Se o usuário estiver logado e tentar acessar a página de login (raiz), 
    // redireciona para o dashboard.
    if (!loading && user && pathname === '/') {
      router.push('/dashboard')
    }
  }, [user, loading, router, pathname])

  // Durante o carregamento, exibe uma tela de loading para evitar piscar de conteúdo
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se o usuário não estiver logado e estiver na página de login (raiz), permite a renderização.
  if (!user && pathname === '/') {
    return <>{children}</>
  }

  // Se o usuário estiver logado e não estiver na página de login (raiz), permite a renderização.
  if (user && pathname !== '/') {
    return <>{children}</>
  }

  return null
}
