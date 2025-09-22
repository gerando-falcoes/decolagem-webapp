"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth"
import { Trash2, AlertTriangle, User, Mail, Phone, Calendar, Search } from "lucide-react"

interface Family {
  id: string
  name: string
  email: string | null
  phone: string | null
  cpf: string | null
  status_aprovacao: string
  created_at: string
  updated_at: string | null
}

interface DeletarFamiliaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function DeletarFamiliaModal({ isOpen, onClose, onSuccess }: DeletarFamiliaModalProps) {
  const [families, setFamilies] = useState<Family[]>([])
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [userIsMentor, setUserIsMentor] = useState(false)
  const [checkingMentor, setCheckingMentor] = useState(true)
  const { user } = useAuth()

  // Verificar se usuário tem perfil na tabela profiles
  useEffect(() => {
    async function checkUserProfile() {
      if (!isOpen || !user?.email) {
        setCheckingMentor(false)
        return
      }

      try {
        setCheckingMentor(true)
        console.log('🔍 Verificando perfil do usuário para exclusão:', user.email)
        
        const response = await fetch('/api/auth/check-mentor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        })
        
        const data = await response.json()
        console.log('✅ Resposta da verificação:', data)
        
        if (data.profile) {
          setUserIsMentor(true)
          fetchFamilies()
        } else {
          setUserIsMentor(false)
        }
      } catch (error) {
        console.error('❌ Erro ao verificar perfil:', error)
        setUserIsMentor(false)
      } finally {
        setCheckingMentor(false)
      }
    }

    checkUserProfile()
  }, [isOpen, user?.email])

  // Filtrar famílias baseado na busca
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredFamilies(families)
    } else {
      const filtered = families.filter(family =>
        family.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        family.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        family.cpf?.includes(searchTerm) ||
        family.phone?.includes(searchTerm)
      )
      setFilteredFamilies(filtered)
    }
  }, [searchTerm, families])

  // Debug das condições do botão
  useEffect(() => {
    console.log('🔍 Debug - Estado do botão:', {
      userIsMentor,
      selectedFamily: selectedFamily?.name || 'nenhuma',
      confirmText,
      shouldShowButton: userIsMentor && selectedFamily && confirmText === 'DELETAR'
    })
  }, [userIsMentor, selectedFamily, confirmText])

  const fetchFamilies = async () => {
    try {
      setLoading(true)
      console.log('🔍 Buscando famílias para exclusão...')
      
      const response = await fetch('/api/families/delete')
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Erro na API:', errorData)
        alert(`Erro ao buscar famílias: ${errorData.error}`)
        return
      }

      const { families: familiesData } = await response.json()
      console.log('✅ Famílias recebidas:', familiesData.length)

      setFamilies(familiesData || [])
    } catch (error) {
      console.error('❌ Erro ao buscar famílias:', error)
      alert(`Erro de conexão: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletarFamilia = async () => {
    if (!selectedFamily || !confirmText) return

    try {
      setIsDeleting(true)

      console.log('🗑️ Deletando família:', selectedFamily.name)
      console.log('🔍 Debug - Condições:', {
        userIsMentor,
        selectedFamily: !!selectedFamily,
        confirmText,
        confirmTextMatch: confirmText === 'DELETAR'
      })

      const response = await fetch('/api/families/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          familyId: selectedFamily.id,
          cpf: selectedFamily.cpf,
          confirmText: confirmText
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Erro na API de exclusão:', errorData)
        alert(`Erro ao deletar família: ${errorData.error}`)
        return
      }

      const result = await response.json()
      console.log('✅ Família deletada com sucesso:', result)

      // Remover família deletada da lista
      setFamilies(prev => prev.filter(family => family.id !== selectedFamily.id))
      setSelectedFamily(null)
      setConfirmText("")
      
      onSuccess?.()
      
      alert(`Família "${result.deletedFamily.name}" foi deletada permanentemente do sistema.`)
    } catch (error) {
      console.error('❌ Erro ao deletar família:', error)
      alert('Erro de conexão. Tente novamente.')
    } finally {
      setIsDeleting(false)
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pendente': { color: 'bg-orange-100 text-orange-800', label: 'Pendente' },
      'aprovado': { color: 'bg-green-100 text-green-800', label: 'Aprovado' },
      'rejeitado': { color: 'bg-red-100 text-red-800', label: 'Rejeitado' }
    }
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status }
    
    return (
      <Badge className={`font-semibold ${config.color}`}>
        {config.label}
      </Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Deletar Família
          </DialogTitle>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
            <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
              <AlertTriangle className="w-4 h-4" />
              Ação Irreversível
            </div>
            <p className="text-red-700 text-sm">
              Esta ação irá deletar <strong>permanentemente</strong> todos os dados da família, incluindo:
              perfil, membros, avaliações, metas, acompanhamentos e histórico completo.
              <strong> Esta ação não pode ser desfeita!</strong>
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Verificação se usuário tem permissão */}
          {checkingMentor ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-2 text-gray-600">Verificando permissões...</span>
            </div>
          ) : !userIsMentor ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4 text-4xl">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Negado</h3>
              <p className="text-gray-600 mb-4">
                Apenas usuários autorizados podem deletar famílias. Seu email <strong>{user?.email}</strong> não tem permissão para esta ação.
              </p>
            </div>
          ) : (
            <>
              {/* Barra de Pesquisa */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="search"
                  placeholder="Buscar família por nome, email, CPF ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Lista de Famílias */}
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    <span className="ml-2 text-gray-600">Carregando famílias...</span>
                  </div>
                ) : filteredFamilies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {families.length === 0 ? 'Nenhuma família encontrada' : 'Nenhuma família encontrada na busca'}
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredFamilies.map((family) => (
                      <div
                        key={family.id}
                        className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedFamily?.id === family.id ? 'bg-red-50 border-l-4 border-red-500' : ''
                        }`}
                        onClick={() => setSelectedFamily(family)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-4 h-4 border-2 rounded ${
                                selectedFamily?.id === family.id 
                                  ? 'bg-red-500 border-red-500' 
                                  : 'border-gray-300'
                              }`}>
                                {selectedFamily?.id === family.id && (
                                  <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                                )}
                              </div>
                              <User className="w-4 h-4 text-gray-400" />
                              <h3 className="font-medium text-gray-900">{family.name}</h3>
                              {getStatusBadge(family.status_aprovacao)}
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
                              {family.cpf && (
                                <div className="flex items-center gap-2">
                                  <span className="w-4 h-4">📄</span>
                                  <span>CPF: {family.cpf}</span>
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

              {/* Confirmação de Exclusão */}
              {selectedFamily && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">
                    Confirmar Exclusão de: {selectedFamily.name}
                  </h4>
                  <p className="text-red-700 text-sm mb-3">
                    Para confirmar a exclusão permanente, digite <strong>DELETAR</strong> no campo abaixo:
                  </p>
                  <Input
                    type="text"
                    placeholder="Digite DELETAR para confirmar"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="mb-3"
                  />
                  <p className="text-xs text-red-600">
                    ⚠️ Esta ação irá deletar todos os dados relacionados a esta família permanentemente.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isDeleting}>
              Cancelar
            </Button>
            
            {/* Debug info - remover depois */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mr-4">
                Debug: userIsMentor={userIsMentor ? 'true' : 'false'}, 
                selectedFamily={selectedFamily ? 'true' : 'false'}, 
                confirmText="{confirmText}"
              </div>
            )}
            
            {userIsMentor && selectedFamily && confirmText === 'DELETAR' ? (
              <Button 
                onClick={handleDeletarFamilia}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-500 text-white hover:text-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Deletando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar Permanentemente
                  </>
                )}
              </Button>
            ) : userIsMentor && selectedFamily ? (
              <Button 
                disabled
                className="bg-gray-400 text-white cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Digite "DELETAR" para confirmar
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
