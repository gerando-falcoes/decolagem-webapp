"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Trash2, 
  XCircle
} from 'lucide-react'
import { FamilyGoal, getStatusToggleButtonText, getCompletionButtonText } from '@/hooks/useFamilyGoals'

interface GoalActionButtonsProps {
  goal: FamilyGoal
  onToggleStatus: (goalId: string) => Promise<any>
  onMarkCompleted: (goalId: string) => Promise<any>
  onCancel: (goalId: string) => Promise<any>
  onDelete: (goalId: string) => Promise<any>
  disabled?: boolean
}

export function GoalActionButtonsSimple({
  goal,
  onToggleStatus,
  onMarkCompleted,
  onCancel,
  onDelete,
  disabled = false
}: GoalActionButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleToggleStatus = async () => {
    setLoading('toggle')
    try {
      await onToggleStatus(goal.id)
    } finally {
      setLoading(null)
    }
  }

  const handleMarkCompleted = async () => {
    if (goal.progress_percentage === 100) {
      alert('Esta meta já está concluída!')
      return
    }

    const confirmed = confirm(
      `Tem certeza que deseja marcar "${goal.goal_name}" como concluída (100%)?`
    )
    
    if (confirmed) {
      setLoading('complete')
      try {
        await onMarkCompleted(goal.id)
      } finally {
        setLoading(null)
      }
    }
  }

  const handleCancel = async () => {
    const confirmed = confirm(
      `Tem certeza que deseja cancelar a meta "${goal.goal_name}"?\n\nUma meta cancelada não pode ser retomada.`
    )
    
    if (confirmed) {
      setLoading('cancel')
      try {
        await onCancel(goal.id)
      } finally {
        setLoading(null)
      }
    }
  }

  const handleDelete = async () => {
    const confirmed = confirm(
      `Tem certeza que deseja excluir a meta "${goal.goal_name}"?\n\nEsta ação não pode ser desfeita.`
    )
    
    if (confirmed) {
      setLoading('delete')
      try {
        await onDelete(goal.id)
      } finally {
        setLoading(null)
      }
    }
  }

  const isCompleted = goal.progress_percentage === 100
  const isCanceled = goal.current_status === 'Cancelada'

  return (
    <div className="flex flex-col gap-2">
      {/* Botão de Status */}
      {!isCompleted && !isCanceled && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleStatus}
          disabled={disabled || loading === 'toggle'}
          className="w-full"
        >
          {loading === 'toggle' ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          ) : goal.current_status === 'Em progresso' ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span className="ml-1">
            {getStatusToggleButtonText(goal.current_status)}
          </span>
        </Button>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-2">
        {/* Botão Concluir */}
        {!isCompleted && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkCompleted}
            disabled={disabled || loading === 'complete'}
            className="flex-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
          >
            {loading === 'complete' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <CheckCircle className="w-4 h-4 mr-1" />
            )}
            Concluir
          </Button>
        )}

        {/* Botão Cancelar */}
        {!isCanceled && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={disabled || loading === 'cancel'}
            className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
          >
            {loading === 'cancel' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <XCircle className="w-4 h-4 mr-1" />
            )}
            Cancelar
          </Button>
        )}

        {/* Botão Excluir */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={disabled || loading === 'delete'}
          className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
        >
          {loading === 'delete' ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
