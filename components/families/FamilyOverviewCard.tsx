import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FamilyOverview, 
  formatAddress, 
  getClassificationColor, 
  getStatusIcon 
} from '@/hooks/useFamilyOverview'
import {
  Users,
  Mail,
  Phone,
  MapPin,
  Target,
  TrendingUp,
  Calendar,
  User
} from 'lucide-react'

interface FamilyOverviewCardProps {
  family: FamilyOverview
}

export function FamilyOverviewCard({ family }: FamilyOverviewCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {family.family_name || 'Nome não informado'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="secondary" 
                className={getClassificationColor(family.dignity_classification)}
              >
                {getStatusIcon(family.assessment_status)} {family.assessment_status}
              </Badge>
              {family.dignity_classification !== 'Não Classificado' && (
                <Badge variant="outline">
                  {family.dignity_classification}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="text-right">
            {family.current_poverty_score && (
              <div className="text-2xl font-bold text-blue-600">
                {family.current_poverty_score.toFixed(1)}
                <span className="text-sm text-gray-500 ml-1">/10</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informações Básicas */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-500" />
            <span>{family.family_size || 0} pessoas</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-500" />
            <span>{family.children_count || 0} crianças</span>
          </div>
        </div>

        {/* Mentor */}
        {family.has_active_mentor ? (
          <div className="flex items-center gap-2 text-sm">
            <User size={16} className="text-green-500" />
            <span className="text-green-700 font-medium">
              {family.mentor_name}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <User size={16} className="text-red-500" />
            <span className="text-red-600">Sem mentor ativo</span>
          </div>
        )}

        {/* Contato */}
        <div className="space-y-1">
          {family.phone && family.phone !== 'N/A' && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone size={16} />
              <span>{family.phone}</span>
            </div>
          )}
          {family.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail size={16} />
              <span className="truncate">{family.email}</span>
            </div>
          )}
          {family.full_address && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin size={16} className="mt-0.5 flex-shrink-0" />
              <span className="text-xs leading-relaxed">
                {formatAddress(family)}
              </span>
            </div>
          )}
        </div>

        {/* Metas e Progresso */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Target size={16} className="text-blue-500" />
            <span>
              {family.active_goals}/{family.total_goals} metas ativas
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-purple-500" />
            <span>{family.avg_goal_progress.toFixed(0)}% progresso</span>
          </div>
        </div>

        {/* Última Avaliação */}
        {family.latest_assessment_date && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} />
            <span>
              Última avaliação: {new Date(family.latest_assessment_date).toLocaleDateString('pt-BR')}
              {family.days_since_last_assessment && family.days_since_last_assessment > 0 && (
                <span className="text-gray-500 ml-1">
                  ({family.days_since_last_assessment} dias atrás)
                </span>
              )}
            </span>
          </div>
        )}

        {/* Alertas */}
        {family.days_since_last_assessment && family.days_since_last_assessment > 90 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
            <p className="text-yellow-800 text-sm font-medium">
              ⚠️ Família sem avaliação há mais de 90 dias
            </p>
          </div>
        )}

        {!family.has_active_mentor && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
            <p className="text-red-800 text-sm font-medium">
              🚨 Família sem mentor ativo
            </p>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/families/${family.family_id}`}>
              Ver Perfil
            </Link>
          </Button>
          {family.assessment_status === 'Não Avaliado' && (
            <Button variant="outline" size="sm" className="flex-1">
              Nova Avaliação
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para lista de famílias usando a view
export function FamilyOverviewGrid({ families }: { families: FamilyOverview[] }) {
  if (families.length === 0) {
    return (
      <div className="text-center py-12">
        <Users size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma família encontrada
        </h3>
        <p className="text-gray-500">
          Cadastre a primeira família para começar.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {families.map((family) => (
        <FamilyOverviewCard key={family.family_id} family={family} />
      ))}
    </div>
  )
}

// Componente de estatísticas rápidas
export function FamilyQuickStats({ families }: { families: FamilyOverview[] }) {
  const stats = {
    total: families.length,
    assessed: families.filter(f => f.assessment_status === 'Avaliado').length,
    withMentor: families.filter(f => f.has_active_mentor).length,
    withActiveGoals: families.filter(f => f.has_active_goals).length,
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total de Famílias</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.assessed}</div>
          <div className="text-sm text-gray-600">Avaliadas</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.withMentor}</div>
          <div className="text-sm text-gray-600">Com Mentor</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.withActiveGoals}</div>
          <div className="text-sm text-gray-600">Com Metas Ativas</div>
        </CardContent>
      </Card>
    </div>
  )
}
