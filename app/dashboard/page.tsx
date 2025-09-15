"use client"

import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion, useInView, useAnimation } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { supabaseBrowserClient } from "@/lib/supabase/browser"
import {
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  Plus,
  BarChart2,
  PieChart,
  Activity,
} from "lucide-react"

// Types
interface DashboardData {
  total_familias: number
  avaliacoes_realizadas: number
  pontuacao_media_geral: number | null
  familias_ativas: number
  nivel_pobreza_baixo: number
  nivel_pobreza_medio: number
  nivel_pobreza_alto: number
  familias_com_avaliacao: number
  tamanho_medio_familia: number
  media_criancas_por_familia: number
  ultima_atualizacao: string
}

// Custom hook to fetch dashboard data
function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = supabaseBrowserClient
        const { data: dashboardData, error } = await supabase
          .from('dashboard_indicators')
          .select('*')
          .order('ultima_atualizacao', { ascending: false })
          .limit(1)
          .single()

        if (error) {
          setError(error.message)
          return
        }

        setData(dashboardData)
      } catch (err) {
        setError('Erro ao carregar dados do dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
}

// Animated Counter Component
function AnimatedCounter({ to }) {
  const count = Math.round(to)
  return <span className="tabular-nums">{count}</span>
}

export default function DashboardPage() {
  const { data, loading, error } = useDashboardData()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados do dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-4">❌</div>
              <p className="text-red-600">Erro ao carregar dados: {error}</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Calcular casos pendentes (famílias que não têm avaliação)
  const casosPendentes = data.total_familias - data.familias_com_avaliacao

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <MetricCard
            title="Total de Famílias"
            value={data.total_familias}
            icon={<Users className="text-blue-500" />}
            color="blue"
          />
          <MetricCard
            title="Avaliações Realizadas"
            value={data.avaliacoes_realizadas}
            icon={<FileText className="text-green-500" />}
            color="green"
          />
          <MetricCard
            title="Famílias Ativas"
            value={data.familias_ativas}
            icon={<TrendingUp className="text-purple-500" />}
            color="purple"
          />
          <MetricCard
            title="Casos Pendentes"
            value={casosPendentes}
            icon={<AlertTriangle className="text-orange-500" />}
            color="orange"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <AverageScoreChart pontuacaoMedia={data.pontuacao_media_geral} />
            </motion.div>
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            className="space-y-6"
          >
            <QuickActions />
            <RecentActivities data={data} />
          </motion.div>
        </div>
      </main>
    </div>
  )
}

// --- Reusable Components for Dashboard ---

const MetricCard = ({ title, value, icon, color }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -5, scale: 1.02, shadow: "lg" }}
    className={`bg-white p-6 rounded-2xl shadow-md border-l-4 border-${color}-500 cursor-pointer`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <div className="text-3xl font-bold text-gray-800">
          <AnimatedCounter to={value} />
        </div>
      </div>
      <div className={`p-3 bg-${color}-100 rounded-full`}>{icon}</div>
    </div>
  </motion.div>
)

const AverageScoreChart = ({ pontuacaoMedia }: { pontuacaoMedia: number | null }) => {
  const score = pontuacaoMedia || 0
  const scoreFormatted = pontuacaoMedia ? score.toFixed(1) : "N/A"
  
  return (
    <Card className="p-6 rounded-2xl shadow-md">
      <CardTitle className="text-lg font-semibold text-gray-800 mb-4">Pontuação Média Geral</CardTitle>
      <div className="flex items-center justify-center space-x-8">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              stroke="#E5E7EB"
              strokeWidth="12"
              fill="transparent"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              stroke={pontuacaoMedia ? "#10B981" : "#9CA3AF"}
              strokeWidth="12"
              fill="transparent"
              strokeDasharray="339.292"
              strokeDashoffset={339.292 - (339.292 * score) / 10}
              initial={{ strokeDashoffset: 339.292 }}
              animate={{ strokeDashoffset: 339.292 - (339.292 * score) / 10 }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-gray-800">{scoreFormatted}</span>
            <span className="text-gray-500">/ 10</span>
          </div>
        </div>
        <div>
          {pontuacaoMedia ? (
            <>
              <p className="text-blue-600 font-semibold flex items-center">
                <TrendingUp size={20} className="mr-1" /> Pontuação atual
              </p>
              <p className="text-gray-600 mt-2">Baseado nas avaliações realizadas.</p>
            </>
          ) : (
            <>
              <p className="text-gray-600 font-semibold flex items-center">
                <TrendingUp size={20} className="mr-1" /> Sem dados suficientes
              </p>
              <p className="text-gray-600 mt-2">Realize mais avaliações para ver a pontuação média.</p>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}


const QuickActions = () => (
  <Card className="p-6 rounded-2xl shadow-md">
    <CardTitle className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</CardTitle>
    <div className="space-y-3">
      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
        <Link href="/families/new">
          <Plus className="mr-2" /> Nova Família
        </Link>
      </Button>
      <Button
        variant="outline"
        className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold py-3 rounded-lg transform hover:scale-105 transition-transform duration-300"
      >
        <FileText className="mr-2" /> Nova Avaliação
      </Button>
    </div>
  </Card>
)

const RecentActivities = ({ data }: { data: DashboardData }) => (
  <Card className="p-6 rounded-2xl shadow-md">
    <CardTitle className="text-lg font-semibold text-gray-800 mb-4">Métricas Adicionais</CardTitle>
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <Users size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Tamanho Médio da Família</p>
            <p className="text-xs text-gray-600">Por família cadastrada</p>
          </div>
        </div>
        <span className="text-lg font-bold text-blue-600">{Number(data.tamanho_medio_familia).toFixed(1)}</span>
      </div>
      
      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Activity size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Média de Crianças</p>
            <p className="text-xs text-gray-600">Por família</p>
          </div>
        </div>
        <span className="text-lg font-bold text-green-600">{Number(data.media_criancas_por_familia).toFixed(1)}</span>
      </div>

      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-full">
            <FileText size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Taxa de Avaliação</p>
            <p className="text-xs text-gray-600">Famílias avaliadas / total</p>
          </div>
        </div>
        <span className="text-lg font-bold text-purple-600">
          {((data.familias_com_avaliacao / data.total_familias) * 100).toFixed(1)}%
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Última atualização: {new Date(data.ultima_atualizacao).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  </Card>
)
