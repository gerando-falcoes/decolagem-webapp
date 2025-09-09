"use client"

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
} from "lucide-react"

// Mock Data
const familyData = {
  name: "Família Silva",
  status: "Dignidade",
  score: 7.5,
  mentor: "Carlos Mendes",
  avatar: "/placeholder-user.jpg",
  contact: {
    phone: "+55 11 99999-8888",
    email: "silva.family@email.com",
    address: "Rua das Flores, 123 - Vila Esperança, São Paulo",
  },
  goals: [
    { name: "Reforma do Banheiro", category: "Moradia", progress: 50, status: "Em Andamento" },
    { name: "Curso Profissionalizante", category: "Renda", progress: 0, status: "A Fazer" },
  ],
  evaluationHistory: [
    { date: "20 de Julho de 2024", score: 7.5, status: "Dignidade" },
    { date: "15 de Abril de 2024", score: 7.2, status: "Dignidade" },
    { date: "10 de Janeiro de 2024", score: 6.8, status: "Pobreza" },
    { date: "05 de Outubro de 2023", score: 6.5, status: "Pobreza" },
  ],
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
            <ProfileHeader data={familyData} />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Left Column */}
            <motion.div className="lg:col-span-2 space-y-6" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <EvaluationHistory history={familyData.evaluationHistory} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <GoalsList goals={familyData.goals} />
              </motion.div>
            </motion.div>

            {/* Right Column */}
            <motion.div className="space-y-6" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <DignometerScore score={familyData.score} status={familyData.status} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <ContactInfo contact={familyData.contact} />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

// --- Components ---

const ProfileHeader = ({ data }) => (
  <Card className="overflow-hidden rounded-2xl shadow-md">
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-24" />
    <div className="p-6 flex items-center space-x-6 -mt-16">
      <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
        <img
          src={data.avatar}
          alt={data.name}
          className="h-32 w-32 rounded-full border-4 border-white shadow-lg"
        />
      </motion.div>
      <div className="pt-16">
        <h1 className="text-3xl font-bold text-gray-800">{data.name}</h1>
        <p className="text-gray-600">Mentor: {data.mentor}</p>
      </div>
      <div className="ml-auto pt-16 flex space-x-2">
        <Button variant="outline">Nova Avaliação</Button>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          <Plus size={16} className="mr-2" /> Adicionar Meta
        </Button>
      </div>
    </div>
  </Card>
)

const DignometerScore = ({ score, status }) => (
  <Card className="p-6 rounded-2xl shadow-md text-center">
    <CardTitle className="text-lg font-semibold text-gray-800 mb-4">Dignômetro Atual</CardTitle>
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        <motion.circle cx="60" cy="60" r="54" stroke="#E5E7EB" strokeWidth="12" fill="transparent" />
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          stroke="#3B82F6"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray="339.292"
          initial={{ strokeDashoffset: 339.292 }}
          animate={{ strokeDashoffset: 339.292 - (339.292 * score) / 10 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-gray-800">{score.toFixed(1)}</span>
        <span className="text-gray-500">/ 10</span>
      </div>
    </div>
    <Badge className="mt-4 bg-blue-100 text-blue-800 font-semibold">{status}</Badge>
  </Card>
)

const EvaluationHistory = ({ history }) => (
  <Card className="p-6 rounded-2xl shadow-md">
    <CardTitle className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <BarChart size={20} className="mr-2 text-purple-500" />
      Histórico de Avaliações
    </CardTitle>
    <ul className="space-y-4">
      {history.map((item, index) => (
        <motion.li
          key={index}
          variants={itemVariants}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <Calendar size={16} className="text-gray-500" />
            <span className="font-medium text-gray-700">{item.date}</span>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-800">Nota: {item.score.toFixed(1)}</p>
            <p className="text-sm text-gray-600">{item.status}</p>
          </div>
        </motion.li>
      ))}
    </ul>
  </Card>
)

const GoalsList = ({ goals }) => (
  <Card className="p-6 rounded-2xl shadow-md">
    <CardTitle className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <Target size={20} className="mr-2 text-green-500" />
      Metas da Família
    </CardTitle>
    <div className="space-y-6">
      {goals.map((goal, index) => (
        <div key={index}>
          <div className="flex justify-between items-center mb-1">
            <p className="font-semibold text-gray-700">{goal.name}</p>
            <Badge className="bg-yellow-100 text-yellow-800 font-medium">{goal.status}</Badge>
          </div>
          <p className="text-sm text-gray-500 mb-2">{goal.category}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              className="bg-green-500 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${goal.progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  </Card>
)

const ContactInfo = ({ contact }) => (
  <Card className="p-6 rounded-2xl shadow-md">
    <CardTitle className="text-lg font-semibold text-gray-800 mb-4">Contato</CardTitle>
    <div className="space-y-4 text-sm">
      <div className="flex items-center space-x-3">
        <Phone size={16} className="text-gray-500" />
        <span className="text-gray-700">{contact.phone}</span>
      </div>
      <div className="flex items-center space-x-3">
        <Mail size={16} className="text-gray-500" />
        <span className="text-gray-700">{contact.email}</span>
      </div>
      <div className="flex items-start space-x-3">
        <MapPin size={16} className="text-gray-500 mt-1" />
        <span className="text-gray-700">{contact.address}</span>
      </div>
    </div>
  </Card>
)
