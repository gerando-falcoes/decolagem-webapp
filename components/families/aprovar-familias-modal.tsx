"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import { CheckCircle, Clock, User, Mail, Phone, Calendar } from "lucide-react"

interface PendingFamily {
  id: string
  name: string
  email: string | null
  phone: string | null
  cpf: string | null
  status_aprovacao: string
  created_at: string
  updated_at: string | null
}

interface AprovarFamiliasModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AprovarFamiliasModal({ isOpen, onClose, onSuccess }: AprovarFamiliasModalProps) {
  const [pendingFamilies, setPendingFamilies] = useState<PendingFamily[]>([])
  const [selectedFamilies, setSelectedFamilies] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
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
        console.log('🔍 Verificando se usuário é mentor para aprovação:', user.email)
        
        // Verificar se o usuário logado é mentor na tabela profiles
        const response = await fetch('/api/auth/check-mentor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        })
        
        const { isMentor } = await response.json()
        console.log('✅ Resultado da verificação de mentor:', isMentor)
        setUserIsMentor(isMentor)
        
        if (isMentor) {
          fetchPendingFamilies()
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

  const fetchPendingFamilies = async () => {
    try {
      setLoading(true)
      console.log('🔍 Buscando famílias pendentes de aprovação...')
      
      const response = await fetch('/api/families/approve')
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Erro na API:', errorData)
        alert(`Erro ao buscar famílias pendentes: ${errorData.error}`)
        return
      }

      const { pendingFamilies: familiesData } = await response.json()
      console.log('✅ Famílias pendentes recebidas:', familiesData.length)

      setPendingFamilies(familiesData || [])
    } catch (error) {
      console.error('❌ Erro ao buscar famílias pendentes:', error)
      alert(`Erro de conexão: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectFamily = (familyId: string) => {
    const newSelected = new Set(selectedFamilies)
    if (newSelected.has(familyId)) {
      newSelected.delete(familyId)
    } else {
      newSelected.add(familyId)
    }
    setSelectedFamilies(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedFamilies.size === pendingFamilies.length) {
      setSelectedFamilies(new Set())
    } else {
      setSelectedFamilies(new Set(pendingFamilies.map(f => f.id)))
    }
  }

  const handleApprovarFamilias = async () => {
    if (selectedFamilies.size === 0 || !user?.email) return

    try {
      setIsApproving(true)

      console.log('✅ Aprovando famílias selecionadas:', Array.from(selectedFamilies))

      // Buscar informações do mentor logado
      const mentorResponse = await fetch('/api/auth/check-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      })

      const mentorData = await mentorResponse.json()
      if (!mentorData.isMentor) {
        alert('Erro: Usuário não é mentor')
        return
      }

      const response = await fetch('/api/families/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          familyIds: Array.from(selectedFamilies),
          mentorId: mentorData.mentor.id,
          mentorName: mentorData.mentor.name
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Erro na API de aprovação:', errorData)
        alert(`Erro ao aprovar famílias: ${errorData.error}`)
        return
      }

      const result = await response.json()
      console.log('✅ Famílias aprovadas com sucesso:', result)

      // Remover famílias aprovadas da lista
      setPendingFamilies(prev => prev.filter(family => !selectedFamilies.has(family.id)))
      setSelectedFamilies(new Set())
      
      onSuccess?.()
      
      alert(`${result.approvedFamilies.length} família(s) aprovada(s) com sucesso!`)
    } catch (error) {
      console.error('❌ Erro ao aprovar famílias:', error)
      alert('Erro de conexão. Tente novamente.')
    } finally {
      setIsApproving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Aprovar Famílias
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Aprovar famílias libera o acesso à plataforma. Mentor atual: <strong>{user?.email}</strong>
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
                Apenas mentores podem aprovar famílias. Seu email <strong>{user?.email}</strong> não está registrado como mentor no sistema.
              </p>
            </div>
          ) : (
            <>
              {/* Status e Ações */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <Clock className="w-4 h-4 mr-2" />
                    {pendingFamilies.length} família(s) pendente(s)
                  </Badge>
                  {selectedFamilies.size > 0 && (
                    <Badge className="bg-blue-100 text-blue-800">
                      {selectedFamilies.size} selecionada(s)
                    </Badge>
                  )}
                </div>
                
                {pendingFamilies.length > 0 && (
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedFamilies.size === pendingFamilies.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                  </Button>
                )}
              </div>

              {/* Lista de Famílias Pendentes */}
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Carregando famílias pendentes...</span>
                  </div>
                ) : pendingFamilies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p>Não há famílias pendentes de aprovação</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {pendingFamilies.map((family) => (
                      <div
                        key={family.id}
                        className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedFamilies.has(family.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => handleSelectFamily(family.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-4 h-4 border-2 rounded ${
                                selectedFamilies.has(family.id) 
                                  ? 'bg-blue-500 border-blue-500' 
                                  : 'border-gray-300'
                              }`}>
                                {selectedFamilies.has(family.id) && (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <User className="w-4 h-4 text-gray-400" />
                              <h3 className="font-medium text-gray-900">{family.name}</h3>
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                Pendente
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1 ml-7">
                              {family.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  <span>{family.email}</span>
                                </div>
                              )}
                              {family.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{family.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Cadastrado em: {formatDate(family.created_at)}</span>
                              </div>
                            </div>
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
            <Button variant="outline" onClick={onClose} disabled={isApproving}>
              Cancelar
            </Button>
            
            {userIsMentor && selectedFamilies.size > 0 && (
              <Button 
                onClick={handleApprovarFamilias}
                disabled={isApproving}
                className="bg-green-600 hover:bg-green-500 text-white hover:text-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                {isApproving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Aprovando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar {selectedFamilies.size} Família{selectedFamilies.size > 1 ? 's' : ''}
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
