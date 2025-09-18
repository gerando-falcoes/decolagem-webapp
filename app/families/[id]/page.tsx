"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Target,
  Plus,
  ArrowLeft,
  BarChart,
  Calendar,
  Users,
  User,
  Zap,
  AlertTriangle,
  Eye,
} from "lucide-react"
import { MetaModal } from "@/components/families/meta-modal"
import { useFamilyById, FamilyOverview } from "@/hooks/useFamilyOverview"
import { useFamilyGoals, getStatusColor, getStatusIcon, getTransitionButtonText, getNextStatus, getGoalDimension, formatDate } from "@/hooks/useFamilyGoals"
import { useDignometerTriggers } from "@/hooks/useDignometerTriggers"
import { useAuth } from "@/lib/auth"
import { isMentorEmail } from "@/lib/mentor-utils"

// Função para obter cor baseada na classificação
const getClassificationColor = (classification: string) => {
  switch (classification) {
    case 'Dignidade':
      return 'bg-green-100 text-green-800'
    case 'Vulnerabilidade':
      return 'bg-yellow-100 text-yellow-800'
    case 'Pobreza':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export default function FamilyProfilePage() {
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false)
  const [userIsMentor, setUserIsMentor] = useState(false)
  const [checkingMentor, setCheckingMentor] = useState(true)
  const params = useParams()
  const familyId = params?.id as string
  const { user } = useAuth()
  
  const { family, loading, error } = useFamilyById(familyId)

  // Verificar se o usuário é mentor E se é mentor desta família
  const isMentorOfFamily = userIsMentor && user?.email && family?.mentor_email === user.email

  // Verificar se usuário é mentor no sistema
  useEffect(() => {
    async function checkMentorStatus() {
      if (!user?.email) {
        setUserIsMentor(false)
        setCheckingMentor(false)
        return
      }

      try {
        const isMentor = await isMentorEmail(user.email)
        setUserIsMentor(isMentor)
      } catch (error) {
        console.error('Erro ao verificar se usuário é mentor:', error)
        setUserIsMentor(false)
      } finally {
        setCheckingMentor(false)
      }
    }

    checkMentorStatus()
  }, [user?.email])

  // DEBUG: Log para verificar autenticação
  console.log('🔍 Debug Autenticação:', {
    userEmail: user?.email,
    userIsMentor,
    familyMentorEmail: family?.mentor_email,
    isMentorOfFamily,
    familyName: family?.family_name
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados da família...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !family) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-4">❌</div>
              <p className="text-red-600">Erro ao carregar família: {error || 'Família não encontrada'}</p>
              <Button asChild className="mt-4">
                <Link href="/families">Voltar para lista</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto p-6">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <Button variant="outline" asChild className="mb-6">
              <Link href="/families" className="flex items-center">
                <ArrowLeft size={16} className="mr-2" />
                Voltar para a lista
              </Link>
            </Button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <ProfileHeader 
              family={family} 
              onAddMeta={() => setIsMetaModalOpen(true)} 
              isMentorOfFamily={isMentorOfFamily}
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Left Column */}
            <motion.div className="lg:col-span-2 space-y-6" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <FamilyStats family={family} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <GoalsSummary family={family} isMentorOfFamily={isMentorOfFamily} onAddMeta={() => setIsMetaModalOpen(true)} />
              </motion.div>
            </motion.div>

            {/* Right Column */}
            <motion.div className="space-y-6" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <DignometerScore family={family} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <ContactInfo family={family} />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </main>
      <MetaModal 
        isOpen={isMetaModalOpen} 
        onClose={() => setIsMetaModalOpen(false)} 
        familyId={family.family_id}
      />
    </div>
  )
}

// --- Components ---

const ProfileHeader = ({ 
  family, 
  onAddMeta, 
  isMentorOfFamily 
}: { 
  family: FamilyOverview
  onAddMeta: () => void
  isMentorOfFamily: boolean 
}) => (
  <Card className="overflow-hidden rounded-2xl shadow-md">
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-24" />
    <div className="p-6 flex items-center space-x-6 -mt-16">
      <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
        <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
          <Users size={48} className="text-gray-500" />
        </div>
      </motion.div>
      <div className="pt-16 flex-1">
        <h1 className="text-3xl font-bold text-gray-800">{family.family_name || 'Família'}</h1>
        <p className="text-gray-600 mb-2">
          {family.has_active_mentor ? (
            <span className="flex items-center">
              <User size={16} className="mr-1 text-green-500" />
              Mentor: {family.mentor_name}
            </span>
          ) : (
            <span className="flex items-center text-red-600">
              <User size={16} className="mr-1" />
              Sem mentor ativo
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <Badge className={getClassificationColor(family.assessment_status)}>
            {family.assessment_status}
          </Badge>
          {family.dignity_classification !== 'Não Classificado' && (
            <Badge variant="outline">
              {family.dignity_classification}
            </Badge>
          )}
        </div>
      </div>
      <div className="ml-auto pt-16 flex space-x-2">
        <Button variant="outline">Nova Avaliação</Button>
        {isMentorOfFamily ? (
          <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={onAddMeta}>
            <Plus size={16} className="mr-2" /> Adicionar Meta
          </Button>
        ) : (
          <div className="flex flex-col items-end">
            <Button disabled className="bg-gray-300 text-gray-500 cursor-not-allowed">
              <Plus size={16} className="mr-2" /> Adicionar Meta
            </Button>
            <p className="text-xs text-gray-500 mt-1">
              {family.has_active_mentor 
                ? "Apenas o mentor pode adicionar metas"
                : "Família precisa de um mentor"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  </Card>
)

const DignometerScore = ({ family }: { family: FamilyOverview }) => {
  const score = family.current_poverty_score || 0
  const hasScore = family.current_poverty_score !== null
  
  return (
    <Card className="p-6 rounded-2xl shadow-md text-center">
      <CardTitle className="text-lg font-semibold text-gray-800 mb-4">Dignômetro Atual</CardTitle>
      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <motion.circle cx="60" cy="60" r="54" stroke="#E5E7EB" strokeWidth="12" fill="transparent" />
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            stroke={hasScore ? "#3B82F6" : "#9CA3AF"}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray="339.292"
            initial={{ strokeDashoffset: 339.292 }}
            animate={{ strokeDashoffset: 339.292 - (339.292 * score) / 10 }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-800">
            {hasScore ? score.toFixed(1) : 'N/A'}
          </span>
          <span className="text-gray-500">/ 10</span>
        </div>
      </div>
      <Badge className={`mt-4 font-semibold ${getClassificationColor(family.dignity_classification)}`}>
        {family.dignity_classification}
      </Badge>
      {family.latest_assessment_date && (
        <p className="text-xs text-gray-500 mt-2">
          Última avaliação: {new Date(family.latest_assessment_date).toLocaleDateString('pt-BR')}
        </p>
      )}
    </Card>
  )
}

const FamilyStats = ({ family }: { family: FamilyOverview }) => (
  <Card className="p-6 rounded-2xl shadow-md">
    <CardTitle className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <BarChart size={20} className="mr-2 text-purple-500" />
      Estatísticas da Família
    </CardTitle>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-3 bg-blue-50 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">{family.family_size || 0}</div>
        <div className="text-sm text-gray-600">Pessoas</div>
      </div>
      <div className="text-center p-3 bg-green-50 rounded-lg">
        <div className="text-2xl font-bold text-green-600">{family.children_count || 0}</div>
        <div className="text-sm text-gray-600">Crianças</div>
      </div>
      <div className="text-center p-3 bg-purple-50 rounded-lg">
        <div className="text-2xl font-bold text-purple-600">{family.total_assessments}</div>
        <div className="text-sm text-gray-600">Avaliações</div>
      </div>
      <div className="text-center p-3 bg-orange-50 rounded-lg">
        <div className="text-2xl font-bold text-orange-600">{family.total_goals}</div>
        <div className="text-sm text-gray-600">Metas</div>
      </div>
    </div>
    
    {family.days_since_last_assessment && (
      <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <p className="text-yellow-800 text-sm">
          <Calendar size={16} className="inline mr-2" />
          Última avaliação há {family.days_since_last_assessment} dias
        </p>
      </div>
    )}
  </Card>
)

const GoalsSummary = ({ 
  family, 
  isMentorOfFamily, 
  onAddMeta 
}: { 
  family: FamilyOverview
  isMentorOfFamily: boolean
  onAddMeta: () => void 
}) => {
  const { data: goalsData, loading, error, updateGoalStatus } = useFamilyGoals(family.family_id)
  const { data: triggersData } = useDignometerTriggers(family.family_id)
  const [updatingGoalId, setUpdatingGoalId] = useState<string | null>(null)

  const handleStatusTransition = async (goalId: string, currentStatus: string) => {
    setUpdatingGoalId(goalId)
    try {
      const newStatus = getNextStatus(currentStatus)
      await updateGoalStatus(goalId, newStatus)
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    } finally {
      setUpdatingGoalId(null)
    }
  }

  return (
    <Card className="p-6 rounded-2xl shadow-md">
      <CardTitle className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <Target size={20} className="mr-2 text-green-500" />
          Resumo de Metas
        </div>
        {isMentorOfFamily && (
          <Button size="sm" onClick={onAddMeta}>
            <Plus size={16} className="mr-2" />
            Adicionar Meta
          </Button>
        )}
      </CardTitle>

      {/* Alert para recomendações automáticas */}
      {triggersData && triggersData.total_recommendations > 0 && isMentorOfFamily && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-orange-600" />
              <div>
                <h4 className="text-sm font-semibold text-orange-900">
                  {triggersData.total_recommendations} Recomendação{triggersData.total_recommendations !== 1 ? 'ões' : ''} Baseada{triggersData.total_recommendations !== 1 ? 's' : ''} no Dignômetro
                </h4>
                <p className="text-xs text-orange-700">
                  Recomendações geradas para as dimensões com vulnerabilidades
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="destructive" className="text-xs">
                {triggersData.vulnerable_dimensions?.filter(d => 
                  ['agua', 'saneamento', 'educacao', 'saude'].includes(d)
                ).length || 0} críticas
              </Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={onAddMeta}
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver Agora
              </Button>
            </div>
          </div>
        </motion.div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Carregando metas...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 mb-2">❌ Erro ao carregar metas</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      ) : goalsData && goalsData.totalGoals > 0 ? (
        <div className="space-y-6">
          {/* Estatísticas resumidas - Conforme solicitado */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{goalsData.activeGoals}</div>
              <div className="text-xs text-gray-600">🎯 Ativas</div>
              <div className="text-xs text-gray-500 mt-1">Sendo realizadas</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{goalsData.completedGoals}</div>
              <div className="text-xs text-gray-600">✅ Concluídas</div>
              <div className="text-xs text-gray-500 mt-1">Finalizadas</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-xl font-bold text-yellow-600">{goalsData.suggestedGoals}</div>
              <div className="text-xs text-gray-600">💡 Sugeridas</div>
              <div className="text-xs text-gray-500 mt-1">Personalizadas</div>
            </div>
          </div>
          
          {/* Progresso médio */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso Médio</span>
              <span className="text-sm font-bold text-gray-800">
                {goalsData.goals.length > 0 
                  ? Math.round(goalsData.goals.reduce((sum, goal) => sum + goal.progress_percentage, 0) / goalsData.goals.length)
                  : 0
                }%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <motion.div
                className="bg-green-500 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${goalsData.goals.length > 0 
                    ? Math.round(goalsData.goals.reduce((sum, goal) => sum + goal.progress_percentage, 0) / goalsData.goals.length)
                    : 0
                  }%` 
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* VISUALIZAÇÃO DETALHADA DAS METAS - Conforme solicitado */}
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-800 mb-4 flex items-center">
              📋 Todas as Metas da Família
              <Badge variant="outline" className="ml-2">{goalsData.totalGoals} total</Badge>
            </h4>
            
            <div className="space-y-4">
              {goalsData.goals.map((goal, index) => (
                <motion.div 
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Título e Status */}
                      <div className="flex items-center mb-2">
                        <h5 className="font-medium text-gray-900 mr-3">{goal.goal_title}</h5>
                        <Badge className={`${getStatusColor(goal.current_status)} border text-xs`}>
                          {getStatusIcon(goal.current_status)} {goal.current_status}
                        </Badge>
                      </div>
                      
                      {/* Descrição/Categoria */}
                      {goal.goal_category && (
                        <p className="text-sm text-gray-600 mb-2">
                          📝 <strong>Descrição:</strong> {goal.goal_category}
                        </p>
                      )}
                      
                      {/* Dimensão */}
                      <p className="text-sm text-gray-600 mb-2">
                        🎯 <strong>Dimensão:</strong> {getGoalDimension(goal)}
                      </p>
                      
                      {/* Progresso */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            📊 <strong>Progresso:</strong>
                          </span>
                          <span className="text-sm font-medium text-gray-800">
                            {goal.progress_percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${goal.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Informações adicionais */}
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                        <div>
                          📅 <strong>Criada em:</strong> {formatDate(goal.created_at)}
                        </div>
                        {goal.target_date && (
                          <div>
                            🎯 <strong>Prazo:</strong> {formatDate(goal.target_date)}
                          </div>
                        )}
                        {goal.source && (
                          <div>
                            🔗 <strong>Origem:</strong> {goal.source === 'manual' ? 'Personalizada' : 'Dignômetro'}
                          </div>
                        )}
                        {goal.assessment_id && (
                          <div>
                            📊 <strong>Avaliação:</strong> Linked
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Botão de ação - apenas para mentores */}
                    {isMentorOfFamily && (
                      <div className="ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusTransition(goal.id, goal.current_status)}
                          disabled={updatingGoalId === goal.id}
                          className="text-xs"
                        >
                          {updatingGoalId === goal.id ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                              Atualizando...
                            </div>
                          ) : (
                            getTransitionButtonText(goal.current_status)
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {!goalsData.activeGoals && (
            <div className="mt-4 p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
              <p className="text-orange-800 text-sm">
                ⚠️ Nenhuma meta ativa no momento
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Target size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma meta cadastrada</h3>
          <p className="text-gray-500 mb-4">Adicione metas para acompanhar o progresso da família.</p>
          {isMentorOfFamily ? (
            <Button size="sm" variant="outline" onClick={onAddMeta}>
              <Plus size={16} className="mr-2" />
              Adicionar primeira meta
            </Button>
          ) : (
            <div className="text-center">
              <Button size="sm" variant="outline" disabled className="bg-gray-100 text-gray-400 cursor-not-allowed">
                <Plus size={16} className="mr-2" />
                Adicionar primeira meta
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                {family.has_active_mentor 
                  ? "Apenas o mentor pode adicionar metas"
                  : "Família precisa de um mentor"
                }
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

const ContactInfo = ({ family }: { family: FamilyOverview }) => (
  <Card className="p-6 rounded-2xl shadow-md">
    <CardTitle className="text-lg font-semibold text-gray-800 mb-4">Contato</CardTitle>
    <div className="space-y-4 text-sm">
      {family.phone && family.phone !== 'N/A' ? (
        <div className="flex items-center space-x-3">
          <Phone size={16} className="text-gray-500" />
          <span className="text-gray-700">{family.phone}</span>
        </div>
      ) : (
        <div className="flex items-center space-x-3 text-gray-400">
          <Phone size={16} />
          <span>Telefone não informado</span>
        </div>
      )}
      
      {family.whatsapp && family.whatsapp !== 'N/A' && (
        <div className="flex items-center space-x-3">
          <Phone size={16} className="text-green-500" />
          <span className="text-gray-700">{family.whatsapp} (WhatsApp)</span>
        </div>
      )}
      
      {family.email ? (
        <div className="flex items-center space-x-3">
          <Mail size={16} className="text-gray-500" />
          <span className="text-gray-700">{family.email}</span>
        </div>
      ) : (
        <div className="flex items-center space-x-3 text-gray-400">
          <Mail size={16} />
          <span>Email não informado</span>
        </div>
      )}
      
      {family.full_address ? (
        <div className="flex items-start space-x-3">
          <MapPin size={16} className="text-gray-500 mt-1" />
          <div className="text-gray-700">
            <p>{family.full_address}</p>
            {family.reference_point && (
              <p className="text-xs text-gray-500 mt-1">
                Ref: {family.reference_point}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-3 text-gray-400">
          <MapPin size={16} />
          <span>Endereço não informado</span>
        </div>
      )}
      
      {family.income_range && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-sm font-medium">
            💰 Faixa de renda: {family.income_range}
          </p>
        </div>
      )}
    </div>
  </Card>
)
