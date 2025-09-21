'use client'

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, UserPlus } from "lucide-react"
import { AuthService } from "@/lib/auth" // Importando o AuthService
import MentorSignupForm from "@/components/auth/mentor-signup-form"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // Estado de Loading
  const [error, setError] = useState("") // Estado de Erro
  const [showSignup, setShowSignup] = useState(false) // Estado para mostrar formulário de cadastro
  const [successMessage, setSuccessMessage] = useState("") // Mensagem de sucesso

  // Verificar se o usuário veio da verificação de email ou cadastro
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setSuccessMessage("Email verificado com sucesso! Agora você pode fazer login.")
      
      // Limpar a mensagem após 5 segundos
      setTimeout(() => {
        setSuccessMessage("")
      }, 5000)
    } else if (searchParams.get('registered') === 'true') {
      setSuccessMessage("Conta criada com sucesso! Agora você pode fazer login.")
      
      // Limpar a mensagem após 5 segundos
      setTimeout(() => {
        setSuccessMessage("")
      }, 5000)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const user = await AuthService.login(email, password)
      if (user) {
        router.push("/dashboard") // Redireciona em caso de sucesso
      } else {
        setError("Email ou senha incorretos.")
      }
    } catch (err) {
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
      {showSignup ? (
        <MentorSignupForm onBackToLogin={() => setShowSignup(false)} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200"
        >
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-bold text-gray-800 mb-3"
            >
              Decolagem
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-gray-600"
            >
              Bem-vindo(a) de volta, mentor(a)!
            </motion.p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
                <motion.div 
                  initial={{opacity: 0, y: -10}}
                  animate={{opacity: 1, y: 0}}
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center text-sm"
                >
                  {error}
                </motion.div>
            )}
            {successMessage && (
                <motion.div 
                  initial={{opacity: 0, y: -10}}
                  animate={{opacity: 1, y: 0}}
                  className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-center text-sm"
                >
                  {successMessage}
                </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Label htmlFor="email" className="font-medium text-gray-700">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@gerandofalcoes.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full bg-gray-100/80 border-gray-300 rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="relative"
            >
              <Label htmlFor="password" className="font-medium text-gray-700">
                Senha
              </Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full bg-gray-100/80 border-gray-300 rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-500 hover:text-blue-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-right"
            >
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                Esqueceu a senha?
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:scale-100"
              >
                {isLoading ? 'Verificando...' : 'Entrar'}
              </Button>
            </motion.div>

            {/* Divisor */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="relative"
            >
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">ou</span>
              </div>
            </motion.div>

            {/* Botão para cadastro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSignup(true)}
                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Não tenho conta - Cadastrar
              </Button>
            </motion.div>
          </form>
        </motion.div>
      )}
    </div>
  )
}
