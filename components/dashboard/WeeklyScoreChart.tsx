'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWeeklyScores, WeeklyScoreData } from "@/hooks/useWeeklyScores"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react"
import { motion } from "framer-motion"

interface WeeklyScoreChartProps {
  limit?: number
  weeks?: string
  year?: string
  autoRefresh?: boolean
  className?: string
}

export default function WeeklyScoreChart({ 
  limit = 12, 
  weeks, 
  year, 
  autoRefresh = false,
  className = ""
}: WeeklyScoreChartProps) {
  const {
    data,
    stats,
    meta,
    loading,
    error,
    hasData
  } = useWeeklyScores({
    limit,
    weeks,
    year,
    autoRefresh
  })

  // Componente de tooltip customizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    const data = payload[0].payload as WeeklyScoreData
    
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{data.formattedDate}</p>
        <div className="mt-2 space-y-1">
          <p className="text-sm">
            <span className="font-medium text-blue-600">Pontuação: </span>
            <span className="font-bold">{data.score.toFixed(2)}</span>
          </p>
          <p className="text-sm">
            <span className="font-medium text-gray-600">Avaliações: </span>
            <span>{data.assessments}</span>
          </p>
        </div>
      </div>
    )
  }

  // Ícone da tendência
  const TrendIcon = () => {
    if (!stats) return <Minus className="w-4 h-4 text-gray-400" />
    
    switch (stats.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  // Texto da tendência
  const trendText = () => {
    if (!stats) return 'Sem dados'
    
    switch (stats.trend) {
      case 'up':
        return 'Tendência de alta'
      case 'down':
        return 'Tendência de baixa'
      default:
        return 'Tendência estável'
    }
  }

  // Cor da tendência
  const trendColor = () => {
    if (!stats) return 'text-gray-500'
    
    switch (stats.trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading && !hasData) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart className="w-5 h-5 text-blue-600" />
            Timeline Semanal Dignômetro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              Carregando dados...
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart className="w-5 h-5 text-red-600" />
            Timeline Semanal Dignômetro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-red-500 mb-2">❌ Erro ao carregar dados</div>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasData) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart className="w-5 h-5 text-gray-600" />
            Timeline Semanal Dignômetro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-600 mb-2">Nenhum dado semanal encontrado</p>
            <p className="text-sm text-gray-500">
              Os dados serão calculados automaticamente
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart className="w-5 h-5 text-blue-600" />
            Timeline Semanal Dignômetro
          </CardTitle>
          
          {/* Estatísticas */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">Média Geral</p>
                <p className="text-lg font-bold text-blue-600">
                  {stats.average.toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Maior Score</p>
                <p className="text-lg font-bold text-green-600">
                  {stats.highest.toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Tendência</p>
                <div className={`flex items-center justify-center gap-1 ${trendColor()}`}>
                  <TrendIcon />
                  <span className="text-sm font-medium">{trendText()}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Avaliações</p>
                <p className="text-lg font-bold text-purple-600">
                  {stats.total_assessments}
                </p>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="week"
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis 
                  domain={[0, 10]}
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="score" 
                  name="Pontuação Média"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Informações adicionais */}
          {meta && (
            <div className="mt-4 pt-3 border-t text-xs text-gray-500">
              <div className="flex justify-between items-center">
                <span>
                  {meta.total_records} semanas • 
                  {meta.date_range ? ` ${meta.date_range.from} a ${meta.date_range.to}` : ' Sem período definido'}
                </span>
                {autoRefresh && (
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 border border-gray-400 border-t-blue-600 rounded-full animate-spin"></div>
                    Auto-refresh ativo
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
