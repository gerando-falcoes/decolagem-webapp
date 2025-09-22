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
import { useGoalRecommendations, getDimensionColor, getDimensionIcon, getPriorityColor, getPriorityText } from '@/hooks/useGoalRecommendations'


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
    dimension: 'Personalizada',
    priority_level: 'medium'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [processingRecommendation, setProcessingRecommendation] = useState<string | null>(null)
  const [recommendationSettings, setRecommendationSettings] = useState<{[key: string]: {target_date: string, priority: string}}>({})

  // Hook para recomendações baseadas no dignômetro
  const {
    data: recommendationsData,
    loading: loadingRecommendations,
    error: recommendationsError,
    refreshRecommendations,
    createGoalFromRecommendation,
    hasVulnerabilities
  } = useGoalRecommendations(familyId)

  // Hook para triggers automáticos do dignômetro (mantido para compatibilidade)
  const {
    data: triggersData,
    loading: loadingTriggers,
    error: triggersError,
    refreshRecommendations: refreshTriggers,
    selectRecommendation,
    rejectRecommendation: rejectTriggerRecommendation,
    getSelectedRecommendations,
    clearSelectedRecommendations,
    createGoalFromRecommendation: createGoalFromTrigger
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
      // Validação dos campos obrigatórios
      if (!formData.goal_title.trim()) {
        alert('❌ Por favor, preencha o título da meta.')
        setIsSubmitting(false)
        return
      }

      if (!formData.goal_category.trim()) {
        alert('❌ Por favor, preencha a descrição e passos da meta.')
        setIsSubmitting(false)
        return
      }

      if (!formData.dimension || formData.dimension === '') {
        alert('❌ Por favor, selecione a dimensão da meta.')
        setIsSubmitting(false)
        return
      }

      if (!formData.target_date) {
        alert('❌ Por favor, defina uma data alvo para a meta.')
        setIsSubmitting(false)
        return
      }

      if (!formData.priority_level) {
        alert('❌ Por favor, selecione a prioridade da meta.')
        setIsSubmitting(false)
        return
      }

      console.log('🚀 Criando meta manual:', {
        titulo: formData.goal_title,
        descricao: formData.goal_category,
        dimensao: formData.dimension,
        data_alvo: formData.target_date
      })

      const response = await fetch(`/api/families/${familyId}/goal-assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal_name: formData.goal_title.trim(),
          goal_description: formData.goal_category.trim(),
          dimension: formData.dimension,
          target_date: formData.target_date,
          priority_level: formData.priority_level,
          source: 'manual'
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Meta manual criada com sucesso:', result.goal_assignment)
        
        // Reset form
        setFormData({
          goal_title: '',
          goal_category: '',
          target_date: '',
          dimension: 'Personalizada',
          priority_level: 'medium'
        })
        
        console.log('✅ Meta manual criada! Atualizando página para mostrar no resumo...')
        
        onClose()
        // Recarregar página para ver as mudanças no resumo
        window.location.reload()
      } else {
        const errorData = await response.json()
        console.error('Erro ao criar meta:', errorData)
        const errorMessage = errorData.details 
          ? `${errorData.error}\nDetalhes: ${errorData.details}` 
          : (errorData.error || 'Erro desconhecido')
        alert('❌ Erro ao criar meta: ' + errorMessage)
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
      // Inicializar configurações padrão para a recomendação selecionada
      if (!recommendationSettings[recommendationId]) {
        setRecommendationSettings(prev => ({
          ...prev,
          [recommendationId]: {
            target_date: '',
            priority: 'média'
          }
        }))
      }
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
      // Remover configurações da recomendação rejeitada
      setRecommendationSettings(prev => {
        const newSettings = { ...prev }
        delete newSettings[recommendationId]
        return newSettings
      })
    } catch (error) {
      console.error('Erro ao rejeitar recomendação automática:', error)
    } finally {
      setProcessingRecommendation(null)
    }
  }

  // Funções para atualizar configurações das recomendações
  const updateRecommendationSetting = (recommendationId: string, field: 'target_date' | 'priority', value: string) => {
    setRecommendationSettings(prev => ({
      ...prev,
      [recommendationId]: {
        ...prev[recommendationId],
        [field]: value
      }
    }))
  }

  const handleCreateGoalFromTrigger = async (recommendation: any) => {
    let settings = recommendationSettings[recommendation.id]
    
    // Inicializar configurações padrão se não existirem
    if (!settings) {
      settings = {
        target_date: '',
        priority: 'média'
      }
      setRecommendationSettings(prev => ({
        ...prev,
        [recommendation.id]: settings
      }))
    }
    
    // Validar se data e prioridade foram definidas
    if (!settings?.target_date) {
      alert('❌ Por favor, defina a data da meta antes de criá-la.')
      return
    }
    
    if (!settings?.priority) {
      alert('❌ Por favor, defina a prioridade da meta antes de criá-la.')
      return
    }

    setProcessingRecommendation(recommendation.id)
    try {
      console.log('🚀 Criando meta a partir da recomendação:', recommendation.id, recommendation.goal_name, settings)
      const success = await createGoalFromRecommendation(recommendation, settings)
      if (success) {
        console.log('✅ Meta criada com sucesso! Atualizando página para mostrar no resumo...')
        // Limpar configurações da recomendação
        setRecommendationSettings(prev => {
          const newSettings = { ...prev }
          delete newSettings[recommendation.id]
          return newSettings
        })
        // Atualizar página para mostrar a meta no resumo
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

    // Validar se todas as recomendações selecionadas têm configurações
    const missingSettings = selectedRecommendations.filter(rec => {
      const settings = recommendationSettings[rec.id]
      return !settings?.target_date || !settings?.priority
    })

    if (missingSettings.length > 0) {
      alert(`❌ Por favor, configure data e prioridade para todas as metas selecionadas (${missingSettings.length} pendente${missingSettings.length > 1 ? 's' : ''}).`)
      return
    }

    let successCount = 0
    
    for (const recommendation of selectedRecommendations) {
      try {
        const settings = recommendationSettings[recommendation.id]
        const success = await createGoalFromRecommendation(recommendation, settings)
        if (success) successCount++
      } catch (error) {
        console.error('Erro ao criar meta:', error)
      }
    }

    if (successCount > 0) {
      // Limpar seleções e configurações
      clearSelectedRecommendations()
      setRecommendationSettings({})
      console.log(`✅ ${successCount} metas criadas e recomendações removidas da lista`)
      // Atualizar página para mostrar as metas no resumo
      window.location.reload()
    }
  }

  const hasAutoRecommendations = recommendationsData && recommendationsData.total_recommendations > 0
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
            {recommendationsData && recommendationsData.total_recommendations > 0 && (
              <Badge variant="destructive" className="ml-1">
                {recommendationsData.total_recommendations}
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
                  {!recommendationsData?.has_assessment 
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
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="bg-white p-3 rounded-md">
                      <div className="text-2xl font-bold text-blue-600">
                        {recommendationsData.total_recommendations}
                      </div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                    <div className="bg-white p-3 rounded-md">
                      <div className="text-2xl font-bold text-orange-600">
                        {recommendationsData.vulnerable_dimensions?.length || 0}
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
                        {recommendationsData.recommendations?.filter(r => 
                          r.priority_level === 'high'
                        ).length || 0}
                      </div>
                      <div className="text-xs text-gray-600">Alta Prioridade</div>
                    </div>
                  </div>
                </div>

                {/* Recomendações por dimensão */}
                {Object.entries(recommendationsData.recommendations_by_dimension).map(([dimension, recommendations]) => (
                  <Card key={dimension} className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-md">
                        <span className="mr-2">{getDimensionIcon(dimension)}</span>
                        {dimension}
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
                        return (
                          <div key={rec.id} className="border rounded-lg p-3 transition-colors bg-gray-50">
                            <div className="flex justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <h4 className="font-medium text-gray-900 mr-2">{rec.goal_name}</h4>
                                </div>
                                {rec.goal_description && (
                                  <p className="text-sm text-gray-600 mb-3">{rec.goal_description}</p>
                                )}
                                
                                {/* Campos de configuração para recomendações */}
                                <div className="bg-white p-2 rounded-md border space-y-2">
                                  <div className="flex gap-2">
                                    {/* Data da Meta */}
                                    <div className="flex-1 space-y-1">
                                      <Label className="text-xs font-medium text-gray-700 flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        Data *
                                      </Label>
                                      <div className="flex gap-1">
                                        {/* Dia */}
                                        <Select
                                          value={recommendationSettings[rec.id]?.target_date ? 
                                            new Date(recommendationSettings[rec.id].target_date).getDate().toString().padStart(2, '0') : ''}
                                          onValueChange={(day) => {
                                            const currentDate = recommendationSettings[rec.id]?.target_date ? 
                                              new Date(recommendationSettings[rec.id].target_date) : new Date()
                                            const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(day))
                                            updateRecommendationSetting(rec.id, 'target_date', newDate.toISOString().split('T')[0])
                                          }}
                                        >
                                          <SelectTrigger className="h-7 text-xs flex-1">
                                            <SelectValue placeholder="Dia" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                              <SelectItem key={day} value={day.toString().padStart(2, '0')} className="text-xs">
                                                {day}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>

                                        {/* Mês */}
                                        <Select
                                          value={recommendationSettings[rec.id]?.target_date ? 
                                            (new Date(recommendationSettings[rec.id].target_date).getMonth() + 1).toString().padStart(2, '0') : ''}
                                          onValueChange={(month) => {
                                            const currentDate = recommendationSettings[rec.id]?.target_date ? 
                                              new Date(recommendationSettings[rec.id].target_date) : new Date()
                                            const newDate = new Date(currentDate.getFullYear(), parseInt(month) - 1, currentDate.getDate())
                                            updateRecommendationSetting(rec.id, 'target_date', newDate.toISOString().split('T')[0])
                                          }}
                                        >
                                          <SelectTrigger className="h-7 text-xs flex-1">
                                            <SelectValue placeholder="Mês" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {[
                                              { value: '01', label: 'Jan' }, { value: '02', label: 'Fev' },
                                              { value: '03', label: 'Mar' }, { value: '04', label: 'Abr' },
                                              { value: '05', label: 'Mai' }, { value: '06', label: 'Jun' },
                                              { value: '07', label: 'Jul' }, { value: '08', label: 'Ago' },
                                              { value: '09', label: 'Set' }, { value: '10', label: 'Out' },
                                              { value: '11', label: 'Nov' }, { value: '12', label: 'Dez' }
                                            ].map(month => (
                                              <SelectItem key={month.value} value={month.value} className="text-xs">
                                                {month.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>

                                        {/* Ano */}
                                        <Select
                                          value={recommendationSettings[rec.id]?.target_date ? 
                                            new Date(recommendationSettings[rec.id].target_date).getFullYear().toString() : ''}
                                          onValueChange={(year) => {
                                            const currentDate = recommendationSettings[rec.id]?.target_date ? 
                                              new Date(recommendationSettings[rec.id].target_date) : new Date()
                                            const newDate = new Date(parseInt(year), currentDate.getMonth(), currentDate.getDate())
                                            updateRecommendationSetting(rec.id, 'target_date', newDate.toISOString().split('T')[0])
                                          }}
                                        >
                                          <SelectTrigger className="h-7 text-xs flex-1">
                                            <SelectValue placeholder="Ano" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                              <SelectItem key={year} value={year.toString()} className="text-xs">
                                                {year}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    
                                    {/* Prioridade da Meta */}
                                    <div className="flex-1 space-y-1">
                                      <Label htmlFor={`priority_${rec.id}`} className="text-xs font-medium text-gray-700 flex items-center">
                                        <Tag className="w-3 h-3 mr-1" />
                                        Prioridade *
                                      </Label>
                                      <Select 
                                        value={recommendationSettings[rec.id]?.priority || 'média'} 
                                        onValueChange={(value) => updateRecommendationSetting(rec.id, 'priority', value)}
                                      >
                                        <SelectTrigger className="h-7 text-xs">
                                          <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="baixa" className="text-xs">
                                            🔵 Baixa
                                          </SelectItem>
                                          <SelectItem value="média" className="text-xs">
                                            🟡 Média
                                          </SelectItem>
                                          <SelectItem value="alta" className="text-xs">
                                            🟠 Alta
                                          </SelectItem>
                                          <SelectItem value="crítica" className="text-xs">
                                            🔴 Crítica
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                        </div>
                        </div>
                    </div>
                              <div className="flex flex-col gap-4 m-4 justify-end">
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
                  Descrição e Passos *
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
                  Data Alvo *
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

              {/* Prioridade */}
              <div className="space-y-2">
                <Label htmlFor="priority_level" className="text-sm font-medium text-gray-700 flex items-center">
                  🎯 Prioridade *
                </Label>
                <Select 
                  value={formData.priority_level} 
                  onValueChange={(value) => setFormData({ ...formData, priority_level: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low" className="py-3">
                      <div className="flex items-center space-x-2">
                        <span>🔵 Baixa</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium" className="py-3">
                      <div className="flex items-center space-x-2">
                        <span>🟡 Média</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high" className="py-3">
                      <div className="flex items-center space-x-2">
                        <span>🟠 Alta</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Defina a importância desta meta para a família
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