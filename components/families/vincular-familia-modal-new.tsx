"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import { isMentorEmail } from "@/lib/mentor-utils"
import { Search, Link as LinkIcon, User, MapPin, Phone } from "lucide-react"

interface Family {
  id: string
  name: string
  phone: string | null
  whatsapp: string | null
  email: string | null
  city: string | null
  state: string | null
  mentor_email: string | null
  has_mentor: boolean
}

interface VincularFamiliaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function VincularFamiliaModal({ isOpen, onClose, onSuccess }: VincularFamiliaModalProps) {
  const [families, setFamilies] = useState<Family[]>([])
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const [userIsMentor, setUserIsMentor] = useState(false)
  const [checkingMentor, setCheckingMentor] = useState(true)
  const { user } = useAuth()

  // Verificar se usuário é mentor quando modal abre
  useEffect(() => {
    async function checkIfUserIsMentor() {
      if (!isOpen || !user?.email) {
        setCheckingMentor(false)
        return
      }

      try {
        setCheckingMentor(true)
        console.log('🔍 Verificando se usuário é mentor:', user.email)
        const isMentor = await isMentorEmail(user.email)
        console.log('✅ Resultado da verificação:', isMentor)
        setUserIsMentor(isMentor)
        
        if (isMentor) {
          fetchAvailableFamilies()
        }
      } catch (error) {
        console.error('❌ Erro ao verificar se usuário é mentor:', error)
        setUserIsMentor(false)
      } finally {
        setCheckingMentor(false)
      }
    }

    checkIfUserIsMentor()
  }, [isOpen, user?.email])

  // Filtrar famílias baseado na busca
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredFamilies(families)
    } else {
      const filtered = families.filter(family =>
        family.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        family.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        family.city?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredFamilies(filtered)
    }
  }, [searchTerm, families])

  const fetchAvailableFamilies = async () => {
    try {
      setLoading(true)
      console.log('🔍 Iniciando busca de famílias via API...', { userEmail: user?.email })
      
      const response = await fetch(`/api/families/available?userEmail=${encodeURIComponent(user?.email || '')}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Erro na API:', errorData)
        alert(`Erro ao buscar famílias: ${errorData.error}`)
        return
      }

      const { families: familiesData } = await response.json()
      console.log('✅ Famílias recebidas da API:', familiesData)

      if (!familiesData || familiesData.length === 0) {
        console.log('📝 Nenhuma família encontrada na API')
        setFamilies([])
        return
      }

      setFamilies(familiesData)
    } catch (error) {
      console.error('❌ Erro geral ao buscar famílias:', error)
      alert(`Erro de conexão: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleVincularFamilia = async () => {
    if (!selectedFamily || !user?.email) return

    try {
      setIsLinking(true)

      console.log('🔗 Vinculando família via API...', { familyId: selectedFamily, mentorEmail: user.email })

      const response = await fetch('/api/families/link-mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          familyId: selectedFamily,
          mentorEmail: user.email,
          action: 'link'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Erro na API de vinculação:', errorData)
        alert(`Erro ao vincular família: ${errorData.error}`)
        return
      }

      const result = await response.json()
      console.log('✅ Família vinculada com sucesso:', result)

      setFamilies(prev => prev.map(family => 
        family.id === selectedFamily 
          ? { ...family, mentor_email: user.email, has_mentor: true }
          : family
      ))

      setSelectedFamily(null)
      onSuccess?.()
      
      alert(result.message || 'Família vinculada com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao vincular família:', error)
      alert('Erro de conexão. Tente novamente.')
    } finally {
      setIsLinking(false)
    }
  }

  const handleDesvincularFamilia = async (familyId: string) => {
    try {
      setIsLinking(true)

      console.log('🔗 Desvinculando família via API...', { familyId })

      const response = await fetch('/api/families/link-mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          familyId,
          action: 'unlink'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Erro na API de desvinculação:', errorData)
        alert(`Erro ao desvincular família: ${errorData.error}`)
        return
      }

      const result = await response.json()
      console.log('✅ Família desvinculada com sucesso:', result)

      setFamilies(prev => prev.map(family => 
        family.id === familyId 
          ? { ...family, mentor_email: null, has_mentor: false }
          : family
      ))

      alert(result.message || 'Família desvinculada com sucesso!')
      onSuccess?.()
    } catch (error) {
      console.error('❌ Erro ao desvincular família:', error)
      alert('Erro de conexão. Tente novamente.')
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-green-600" />
            Vincular Família
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Selecione uma família para vincular como mentor atual: <strong>{user?.email}</strong>
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Verificação se usuário é mentor */}
          {checkingMentor ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Verificando permissões...</span>
            </div>
          ) : !userIsMentor ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4 text-4xl">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Negado</h3>
              <p className="text-gray-600 mb-4">
                Apenas mentores podem vincular famílias. Seu email <strong>{user?.email}</strong> não está registrado como mentor no sistema.
              </p>
              <p className="text-sm text-gray-500">
                Entre em contato com o administrador para solicitar acesso de mentor.
              </p>
            </div>
          ) : (
            <>
              {/* Barra de Pesquisa */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="search"
                  placeholder="Buscar família por nome, email ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Lista de Famílias */}
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Carregando famílias...</span>
                  </div>
                ) : filteredFamilies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {families.length === 0 ? 'Nenhuma família disponível para vinculação' : 'Nenhuma família encontrada'}
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredFamilies.map((family) => (
                      <div
                        key={family.id}
                        className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedFamily === family.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => !family.has_mentor && setSelectedFamily(family.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <h3 className="font-medium text-gray-900">{family.name}</h3>
                              {family.has_mentor && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  {family.mentor_email === user?.email ? 'Você é mentor' : 'Tem mentor'}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              {family.email && (
                                <div className="flex items-center gap-2">
                                  <span className="w-4 h-4">📧</span>
                                  <span>{family.email}</span>
                                </div>
                              )}
                              {family.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{family.phone}</span>
                                </div>
                              )}
                              {family.city && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>{family.city}, {family.state}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="ml-4">
                            {family.has_mentor && family.mentor_email === user?.email ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDesvincularFamilia(family.id)
                                }}
                                disabled={isLinking}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                Desvincular
                              </Button>
                            ) : (
                              <div className="flex items-center">
                                {selectedFamily === family.id && (
                                  <div className="w-4 h-4 border-2 border-blue-500 rounded-full mr-2" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLinking}>
              Cancelar
            </Button>
            
            {userIsMentor && selectedFamily && !families.find(f => f.id === selectedFamily)?.has_mentor && (
              <Button 
                onClick={handleVincularFamilia}
                disabled={isLinking}
                className="bg-green-600 hover:bg-green-500 text-white hover:text-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                {isLinking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Vinculando...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Vincular Família
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

