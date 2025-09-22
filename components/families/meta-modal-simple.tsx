"use client"

import { useState } from 'react'
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

export const getDimensionIcon = (dimension: string) => {
  const dimensionLower = dimension.toLowerCase()
  switch (dimensionLower) {
    case 'água': return '💧'
    case 'saneamento': return '🚿'
    case 'saúde': return '🏥'
    case 'educação': return '📚'
    case 'moradia': return '🏠'
    case 'renda': return '💰'
    case 'alimentação': return '🍎'
    case 'documentação': return '📄'
    default: return '📋'
  }
}

export const getDimensionLabel = (dimension: string) => {
  return dimension.charAt(0).toUpperCase() + dimension.slice(1)
}

interface MetaModalProps {
  isOpen: boolean
  onClose: () => void
  familyId: string | null
}

export function MetaModal({ isOpen, onClose, familyId }: MetaModalProps) {
  const [activeTab, setActiveTab] = useState<'auto' | 'manual'>('auto')
  
  const {
    data: triggersData,
    loading: triggersLoading,
    error: triggersError,
    refreshRecommendations: refreshTriggers,
    createGoalFromRecommendation
  } = useDignometerTriggers(familyId)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-500" />
              <span>Gerenciar Metas da Família</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
          <Button 
            variant={activeTab === 'auto' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveTab('auto')}
            className="flex-1"
          >
            <Zap className="w-4 h-4 mr-2" />
            Recomendações Automáticas
            {triggersData && triggersData.total_recommendations > 0 && (
              <Badge variant="destructive" className="ml-2">
                {triggersData.total_recommendations}
              </Badge>
            )}
          </Button>
          
          <Button 
            variant={activeTab === 'manual' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setActiveTab('manual')}
            className="flex-1"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manual
          </Button>
        </div>

        <div className="space-y-4">
          {activeTab === 'auto' && (
            <div className="space-y-4">
              <h3>Recomendações Automáticas</h3>
              <p>Funcionalidade em desenvolvimento...</p>
            </div>
          )}
          
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <h3>Criar Meta Manual</h3>
              <p>Funcionalidade em desenvolvimento...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
