"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Trash2, 
  XCircle,
  MoreHorizontal 
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FamilyGoal, getStatusToggleButtonText, getCompletionButtonText } from '@/hooks/useFamilyGoals'

interface GoalActionButtonsProps {
  goal: FamilyGoal
  onToggleStatus: (goalId: string) => Promise<any>
  onMarkCompleted: (goalId: string) => Promise<any>
  onCancel: (goalId: string) => Promise<any>
  onDelete: (goalId: string) => Promise<any>
  disabled?: boolean
}

export function GoalActionButtons({
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
    <div className="flex items-center space-x-2">
      {/* Botão de Status - Visível apenas se não estiver concluída ou cancelada */}
      {!isCompleted && !isCanceled && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleStatus}
          disabled={disabled || loading === 'toggle'}
          className={`transition-colors ${
            goal.current_status === 'Em progresso'
              ? 'text-blue-700 border-blue-200 hover:bg-blue-50'
              : 'text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {loading === 'toggle' ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          ) : goal.current_status === 'Em progresso' ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span className="ml-1 hidden sm:inline">
            {getStatusToggleButtonText(goal.current_status)}
          </span>
        </Button>
      )}

      {/* Menu Dropdown com ações adicionais */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={disabled || loading !== null}
            className="h-8 w-8 p-0"
            type="button"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 z-50" side="bottom">
          {/* Marcar como Concluída - sempre visível se não estiver concluída */}
          {!isCompleted && (
            <DropdownMenuItem
              onClick={handleMarkCompleted}
              disabled={loading === 'complete'}
              className="text-green-700 focus:text-green-700"
            >
              {loading === 'complete' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {getCompletionButtonText(goal.progress_percentage)}
            </DropdownMenuItem>
          )}

          {/* Cancelar Meta - sempre visível se não estiver cancelada */}
          {!isCanceled && (
            <DropdownMenuItem
              onClick={handleCancel}
              disabled={loading === 'cancel'}
              className="text-orange-700 focus:text-orange-700"
            >
              {loading === 'cancel' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Cancelar Meta
            </DropdownMenuItem>
          )}

          {/* Status da meta concluída */}
          {isCompleted && (
            <DropdownMenuItem disabled className="text-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Meta Concluída (100%)
            </DropdownMenuItem>
          )}

          {/* Status da meta cancelada */}
          {isCanceled && (
            <DropdownMenuItem disabled className="text-orange-700">
              <XCircle className="w-4 h-4 mr-2" />
              Meta Cancelada
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Excluir Meta - sempre visível */}
          <DropdownMenuItem
            onClick={handleDelete}
            disabled={loading === 'delete'}
            className="text-red-700 focus:text-red-700"
          >
            {loading === 'delete' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Excluir Meta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
