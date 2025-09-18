"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Target, CheckCircle, XCircle, RefreshCw, Zap, Users, Settings, FileText, Tag, Calendar } from 'lucide-react'
import { useDignometerTriggers } from '@/hooks/useDignometerTriggers'

// Helper functions para as recomendações
export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-600 text-white'
    case 'high': return 'bg-orange-600 text-white'
    case 'medium': return 'bg-yellow-600 text-white'
    case 'low': return 'bg-blue-600 text-white'
    default: return 'bg-gray-600 text-white'
  }
}

export const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'critical': return '🔴'
    case 'high': return '🟠'
    case 'medium': return '🟡'
    case 'low': return '🔵'
    default: return '⚪'
  }
}

export const getDimensionLabel = (dimension: string) => {
  const labels: { [key: string]: string } = {
    agua: 'Água',
    saneamento: 'Saneamento',
    saude: 'Saúde',
    educacao: 'Educação',
    moradia: 'Moradia',
    alimentacao: 'Alimentação',
    renda_diversificada: 'Renda Diversificada',
    renda_estavel: 'Renda Estável',
    poupanca: 'Poupança',
    bens_conectividade: 'Bens e Conectividade'
  }
  return labels[dimension] || dimension
}

export const getDimensionIcon = (dimension: string) => {
  const icons: { [key: string]: string } = {
    agua: '💧',
    saneamento: '🚿',
    saude: '🏥',
    educacao: '📚',
    moradia: '🏠',
    alimentacao: '🍽️',
    renda_diversificada: '💼',
    renda_estavel: '💰',
    poupanca: '🏦',
    bens_conectividade: '📱'
  }
  return icons[dimension] || '📋'
}

interface MetaModalProps {
  isOpen: boolean
  onClose: () => void
  familyId: string
}

export function MetaModal({ isOpen, onClose, familyId }: MetaModalProps) {
  const [activeTab, setActiveTab] = useState<'auto' | 'manual'>('auto')
  const [formData, setFormData] = useState({
    goal_title: '',
    goal_category: '',
    target_date: '',
    dimension: 'Personalizada'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [processingRecommendation, setProcessingRecommendation] = useState<string | null>(null)

  // Hook para triggers automáticos do dignômetro
  const {
    data: triggersData,
    loading: loadingTriggers,
    error: triggersError,
    refreshRecommendations: refreshTriggers,
    selectRecommendation,
    rejectRecommendation: rejectTriggerRecommendation,
    getSelectedRecommendations,
    clearSelectedRecommendations,
    createGoalFromRecommendation
  } = useDignometerTriggers(familyId)

  const dimensions = [
    'Moradia',
    'Água', 
    'Saneamento',
    'Educação',
    'Saúde',
    'Alimentação',
    'Renda',
    'Poupança',
    'Conectividade',
    'Personalizada'
  ]

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          family_id: familyId,
          goal_title: formData.goal_title,
          goal_category: formData.goal_category,
          target_date: formData.target_date || null,
          source: 'manual'
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Reset form
        setFormData({
          goal_title: '',
          goal_category: '',
          target_date: '',
          dimension: 'Personalizada'
        })
        
        // Mostrar feedback de sucesso
        alert('✅ Meta criada com sucesso! A meta aparecerá no Resumo de Metas.')
        
        onClose()
        // Recarregar página para ver as mudanças
        window.location.reload()
      } else {
        const errorData = await response.json()
        console.error('Erro ao criar meta:', errorData)
        alert('❌ Erro ao criar meta: ' + (errorData.error || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Erro ao criar meta:', error)
      alert('❌ Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }


  // Funções para triggers automáticos
  const handleSelectTriggerRecommendation = async (recommendationId: string) => {
    setProcessingRecommendation(recommendationId)
    try {
      await selectRecommendation(recommendationId)
    } catch (error) {
      console.error('Erro ao selecionar recomendação automática:', error)
    } finally {
      setProcessingRecommendation(null)
    }
  }

  const handleRejectTriggerRecommendation = async (recommendationId: string) => {
    setProcessingRecommendation(recommendationId)
    try {
      await rejectTriggerRecommendation(recommendationId)
    } catch (error) {
      console.error('Erro ao rejeitar recomendação automática:', error)
    } finally {
      setProcessingRecommendation(null)
    }
  }

  const handleCreateGoalFromTrigger = async (recommendation: any) => {
    setProcessingRecommendation(recommendation.id)
    try {
      const success = await createGoalFromRecommendation(recommendation)
      if (success) {
        // Recarregar página para ver as mudanças
        window.location.reload()
      }
    } catch (error) {
      console.error('Erro ao criar meta a partir de recomendação automática:', error)
    } finally {
      setProcessingRecommendation(null)
    }
  }

  const handleAddSelectedToGoals = async () => {
    const selectedRecommendations = getSelectedRecommendations()
    if (selectedRecommendations.length === 0) return

    let successCount = 0
    
    for (const recommendation of selectedRecommendations) {
      try {
        const success = await createGoalFromRecommendation(recommendation)
        if (success) successCount++
      } catch (error) {
        console.error('Erro ao criar meta:', error)
      }
    }

    if (successCount > 0) {
      // Limpar seleções
      clearSelectedRecommendations()
      // Recarregar página para ver as mudanças
      window.location.reload()
    }
  }

  const hasAutoRecommendations = triggersData && triggersData.total_recommendations > 0
  const selectedCount = getSelectedRecommendations().length

    return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-500" />
              <span>Gerenciar Metas da Família</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'auto'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('auto')}
          >
            <Zap className="w-4 h-4" />
            <span>Recomendações Automáticas</span>
            {hasAutoRecommendations && (
              <Badge variant="destructive" className="ml-1">
                {triggersData.total_recommendations}
              </Badge>
            )}
          </button>
          <button
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'manual'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('manual')}
          >
            <Settings className="w-4 h-4" />
            <span>Manual</span>
          </button>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'auto' && (
          <div className="space-y-4">
            {loadingTriggers ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Carregando triggers automáticos...</span>
              </div>
            ) : triggersError ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-2">❌ Erro ao carregar triggers</p>
                <p className="text-sm text-gray-500">{triggersError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => refreshTriggers()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
                            </div>
            ) : !hasAutoRecommendations ? (
              <div className="text-center py-8">
                <Zap size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma recomendação automática</h3>
                <p className="text-gray-500 mb-4">
                  {!triggersData?.has_dignometer 
                    ? 'Esta família ainda não possui dignômetro preenchido.'
                    : 'Não há vulnerabilidades detectadas no dignômetro desta família.'
                  }
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => refreshTriggers()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Verificar Novamente
                </Button>
                        </div>
            ) : (
              <div className="space-y-4">
                {/* Header com estatísticas e botão de ação */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-blue-900">
                        Recomendações Baseadas no Dignômetro
                      </h3>
                    </div>
                    {selectedCount > 0 && (
                      <Button 
                        onClick={handleAddSelectedToGoals}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Adicionar {selectedCount} ao Resumo de Metas
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="bg-white p-3 rounded-md">
                      <div className="text-2xl font-bold text-blue-600">
                        {triggersData.total_recommendations}
                      </div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                    <div className="bg-white p-3 rounded-md">
                      <div className="text-2xl font-bold text-orange-600">
                        {triggersData.vulnerable_dimensions?.length || 0}
                      </div>
                      <div className="text-xs text-gray-600">Dimensões Vulneráveis</div>
                    </div>
                    <div className="bg-white p-3 rounded-md">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedCount}
                      </div>
                      <div className="text-xs text-gray-600">Selecionadas</div>
                    </div>
                    <div className="bg-white p-3 rounded-md">
                      <div className="text-2xl font-bold text-purple-600">
                        {triggersData.vulnerable_dimensions?.filter(d => 
                          ['agua', 'saneamento', 'educacao', 'saude'].includes(d)
                        ).length || 0}
                      </div>
                      <div className="text-xs text-gray-600">Críticas</div>
                    </div>
                  </div>
                </div>

                {/* Recomendações por dimensão */}
                {Object.entries(triggersData.recommendations_by_dimension).map(([dimension, recommendations]) => (
                  <Card key={dimension} className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-md">
                        <span className="mr-2">{getDimensionIcon(dimension)}</span>
                        {getDimensionLabel(dimension)}
                        <Badge variant="outline" className="ml-2">
                          {recommendations.length} recomendação{recommendations.length !== 1 ? 'ões' : ''}
                        </Badge>
                        <Badge variant="destructive" className="ml-2 text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          RECOMENDAÇÃO AUTOMÁTICA
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        Recomendações geradas porque esta dimensão apresenta vulnerabilidades
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {recommendations.map((rec: any) => {
                        const isSelected = getSelectedRecommendations().some(selected => selected.id === rec.id)
                        
                        return (
                          <div key={rec.id} className={`border rounded-lg p-3 transition-colors ${
                            isSelected ? 'bg-green-50 border-green-300' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <h4 className="font-medium text-gray-900 mr-2">{rec.goal}</h4>
                                  <Badge className={`${getPriorityColor(rec.priority_level)} text-xs`}>
                                    {getPriorityIcon(rec.priority_level)} {rec.priority_level}
                                  </Badge>
                        </div>
                                <p className="text-sm text-gray-600 mb-2">{rec.question}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>🎯 Baseada no dignômetro</span>
                                  <span>📅 {new Date(rec.generated_at).toLocaleDateString('pt-BR')}</span>
                                  <span>🔍 Prioridade: {rec.priority_level}</span>
                        </div>
                    </div>
                              <div className="flex space-x-2 ml-4">
                                {isSelected ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCreateGoalFromTrigger(rec)}
                                    disabled={processingRecommendation === rec.id}
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                  >
                                    {processingRecommendation === rec.id ? (
                                      <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-1"></div>
                                        Criando...
                        </div>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Criar Meta
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSelectTriggerRecommendation(rec.id)}
                                    disabled={processingRecommendation === rec.id}
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                  >
                                    <Target className="w-4 h-4 mr-1" />
                                    Selecionar
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectTriggerRecommendation(rec.id)}
                                  disabled={processingRecommendation === rec.id}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Rejeitar
                                </Button>
                        </div>
                        </div>
                    </div>
                        )
                      })}
                </CardContent>
            </Card>
                ))}

                {/* Botão para limpar seleções */}
                {selectedCount > 0 && (
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      onClick={clearSelectedRecommendations}
                      className="text-gray-600"
                    >
                      Limpar Seleções
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">
                  Criar Meta Personalizada
                </h3>
              </div>
              <p className="text-sm text-blue-700">
                Defina uma meta específica para esta família baseada nas necessidades identificadas
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-6">
              {/* Título da Meta */}
              <div className="space-y-2">
                <Label htmlFor="goal_title" className="text-sm font-medium text-gray-700 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Título da Meta *
                </Label>
                <Input
                  id="goal_title"
                  value={formData.goal_title}
                  onChange={(e) => setFormData({ ...formData, goal_title: e.target.value })}
                  placeholder="Ex: Instalar sistema de filtração de água"
                  className="h-12 text-base"
                  required
                />
                <p className="text-xs text-gray-500">
                  Seja claro e específico sobre o objetivo da meta
                </p>
              </div>

              {/* Descrição da Meta */}
              <div className="space-y-2">
                <Label htmlFor="goal_category" className="text-sm font-medium text-gray-700 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Descrição e Passos
                </Label>
                <Textarea
                  id="goal_category"
                  value={formData.goal_category}
                  onChange={(e) => setFormData({ ...formData, goal_category: e.target.value })}
                  placeholder="Descreva detalhadamente como esta meta será executada, incluindo passos específicos e recursos necessários..."
                  rows={4}
                  className="text-base resize-none"
                />
                <p className="text-xs text-gray-500">
                  Inclua detalhes que ajudem a família a entender como alcançar esta meta
                </p>
              </div>

              {/* Dimensão */}
              <div className="space-y-2">
                <Label htmlFor="dimension" className="text-sm font-medium text-gray-700 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Dimensão da Meta *
                </Label>
                <Select 
                  value={formData.dimension} 
                  onValueChange={(value) => setFormData({ ...formData, dimension: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione a dimensão relacionada" />
                  </SelectTrigger>
                  <SelectContent>
                    {dimensions.map((dim) => (
                      <SelectItem key={dim} value={dim} className="py-3">
                        <div className="flex items-center space-x-2">
                          {getDimensionIcon(dim)}
                          <span>{dim}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Escolha a área principal que esta meta irá impactar
                </p>
              </div>

              {/* Data Alvo */}
              <div className="space-y-2">
                <Label htmlFor="target_date" className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Data Alvo (opcional)
                </Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="h-12"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500">
                  Defina um prazo realista para conclusão desta meta
                </p>
              </div>

              {/* Preview da Meta */}
              {formData.goal_title && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Prévia da Meta:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {formData.dimension}
                      </Badge>
                      <h5 className="font-medium text-gray-900">{formData.goal_title}</h5>
                    </div>
                    {formData.goal_category && (
                      <p className="text-sm text-gray-600">{formData.goal_category}</p>
                    )}
                    {formData.target_date && (
                      <p className="text-xs text-gray-500">
                        📅 Prazo: {new Date(formData.target_date).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="px-6"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                        </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.goal_title.trim()}
                  className="px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Criando Meta...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>Criar Meta</span>
                    </div>
                  )}
                        </Button>
              </div>
            </form>
          </div>
                    )}
            </DialogContent>
        </Dialog>
  )
}