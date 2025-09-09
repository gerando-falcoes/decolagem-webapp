"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Since login is handled externally, we just navigate to dashboard
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#231e3d] mb-2">Bem-vindo(a) de volta!</h1>
          <p className="text-[#374151]">Faça login para continuar</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <Label htmlFor="email" className="text-[#374151] font-medium">
              Nome de usuário ou e-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 bg-[#f2f0f4] border-[#d1d5db] focus:border-[#590da5] focus:ring-[#590da5]"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-[#374151] font-medium">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 bg-[#f2f0f4] border-[#d1d5db] focus:border-[#590da5] focus:ring-[#590da5]"
              required
            />
          </div>

          <div className="text-right">
            <a href="#" className="text-[#590da5] text-sm hover:underline">
              Esqueceu a senha?
            </a>
          </div>

          <Button type="submit" className="w-full bg-[#590da5] hover:bg-[#4a0b87] text-white py-3 font-medium">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}
