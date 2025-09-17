"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'

interface MetaModalProps {
  isOpen: boolean
  onClose: () => void
  familyId: string
}

export function MetaModal({ isOpen, onClose, familyId }: MetaModalProps) {
  const [formData, setFormData] = useState({
    goal_title: '',
    goal_category: '',
    target_date: '',
    dimension: 'Personalizada'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
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
        // Reset form
        setFormData({
          goal_title: '',
          goal_category: '',
          target_date: '',
          dimension: 'Personalizada'
        })
        onClose()
        // Recarregar página para ver as mudanças
        window.location.reload()
      } else {
        console.error('Erro ao criar meta')
      }
    } catch (error) {
      console.error('Erro ao criar meta:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Adicionar Nova Meta
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="goal_title">Título da Meta</Label>
            <Input
              id="goal_title"
              value={formData.goal_title}
              onChange={(e) => setFormData({ ...formData, goal_title: e.target.value })}
              placeholder="Ex: Instalar sistema de filtração de água"
              required
            />
          </div>

          <div>
            <Label htmlFor="goal_category">Descrição da Meta</Label>
            <Textarea
              id="goal_category"
              value={formData.goal_category}
              onChange={(e) => setFormData({ ...formData, goal_category: e.target.value })}
              placeholder="Descreva os detalhes e passos para realizar esta meta..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="dimension">Dimensão</Label>
            <Select 
              value={formData.dimension} 
              onValueChange={(value) => setFormData({ ...formData, dimension: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a dimensão" />
              </SelectTrigger>
              <SelectContent>
                {dimensions.map((dim) => (
                  <SelectItem key={dim} value={dim}>
                    {dim}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="target_date">Data Alvo (opcional)</Label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Meta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}