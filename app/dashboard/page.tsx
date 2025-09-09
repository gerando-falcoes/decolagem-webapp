"use client"

import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion, useInView, useAnimation } from "framer-motion"
import { useEffect, useRef } from "react"
import Link from "next/link"
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
            value={1234}
            icon={<Users className="text-blue-500" />}
            color="blue"
          />
          <MetricCard
            title="Avaliações Realizadas"
            value={567}
            icon={<FileText className="text-green-500" />}
            color="green"
          />
          <MetricCard
            title="Famílias Ativas"
            value={890}
            icon={<TrendingUp className="text-purple-500" />}
            color="purple"
          />
          <MetricCard
            title="Casos Pendentes"
            value={3}
            icon={<AlertTriangle className="text-orange-500" />}
            color="orange"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 space-y-6"
          >
            <motion.div variants={itemVariants}>
              <AverageScoreChart />
            </motion.div>
            <motion.div variants={itemVariants}>
              <DimensionMetrics />
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
            <RecentActivities />
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

const AverageScoreChart = () => (
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
            stroke="#10B981"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray="339.292"
            strokeDashoffset={339.292 - (339.292 * 7.8) / 10}
            initial={{ strokeDashoffset: 339.292 }}
            animate={{ strokeDashoffset: 339.292 - (339.292 * 7.8) / 10 }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-800">7.8</span>
          <span className="text-gray-500">/ 10</span>
        </div>
      </div>
      <div>
        <p className="text-green-600 font-semibold flex items-center">
          <TrendingUp size={20} className="mr-1" /> +5.4% vs. mês anterior
        </p>
        <p className="text-gray-600 mt-2">Um progresso notável na jornada das famílias.</p>
      </div>
    </div>
  </Card>
)

const DimensionMetrics = () => (
  <Card className="p-6 rounded-2xl shadow-md">
    <CardTitle className="text-lg font-semibold text-gray-800 mb-4">Médias por Dimensão</CardTitle>
    <div className="space-y-4">
      <ProgressItem label="Moradia" value={85} color="#3B82F6" />
      <ProgressItem label="Saúde" value={78} color="#10B981" />
      <ProgressItem label="Renda" value={62} color="#F59E0B" />
      <ProgressItem label="Educação" value={49} color="#EC4899" />
    </div>
  </Card>
)

const ProgressItem = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="text-sm font-bold text-gray-800">{value} / 100</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <motion.div
        className="h-2.5 rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </div>
  </div>
)

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

const RecentActivities = () => (
  <Card className="p-6 rounded-2xl shadow-md">
    <CardTitle className="text-lg font-semibold text-gray-800 mb-4">Atividades Recentes</CardTitle>
    <ul className="space-y-4">
      <li className="flex items-center space-x-3">
        <div className="p-2 bg-green-100 rounded-full">
          <Activity size={18} className="text-green-600" />
        </div>
        <p className="text-sm text-gray-600">Avaliação concluída para a família <span className="font-semibold">Silva</span>.</p>
      </li>
      <li className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-full">
          <Users size={18} className="text-blue-600" />
        </div>
        <p className="text-sm text-gray-600">Nova família <span className="font-semibold">Pereira</span> cadastrada.</p>
      </li>
      <li className="flex items-center space-x-3">
        <div className="p-2 bg-purple-100 rounded-full">
          <TrendingUp size={18} className="text-purple-600" />
        </div>
        <p className="text-sm text-gray-600">Meta de emprego alcançada pela família <span className="font-semibold">Santos</span>.</p>
      </li>
    </ul>
  </Card>
)
