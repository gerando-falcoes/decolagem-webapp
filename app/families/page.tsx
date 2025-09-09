"use client"

import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import Link from "next/link"
import { Plus, Search, ChevronRight } from "lucide-react"

const families = [
  { id: 1, name: "Família Silva", score: 8.2, status: "Prosperidade", mentor: "Carlos Mendes" },
  { id: 2, name: "Família Oliveira", score: 2.5, status: "Pobreza Extrema", mentor: "Ana Souza" },
  { id: 3, name: "Família Santos", score: 9.5, status: "Quebra de Ciclo", mentor: "Carlos Mendes" },
  { id: 4, name: "Família Pereira", score: 1.8, status: "Pobreza Extrema", mentor: "Ana Souza" },
  { id: 5, name: "Família Costa", score: 6.1, status: "Dignidade", mentor: "Carlos Mendes" },
  { id: 6, name: "Família Almeida", score: 8.8, status: "Prosperidade", mentor: "Ana Souza" },
  { id: 7, name: "Família Rocha", score: 4.8, status: "Pobreza", mentor: "Carlos Mendes" },
]

const statusConfig = {
  "Pobreza Extrema": { color: "red", label: "Pobreza Extrema" },
  Pobreza: { color: "orange", label: "Pobreza" },
  Dignidade: { color: "yellow", label: "Dignidade" },
  Prosperidade: { color: "blue", label: "Prosperidade" },
  "Quebra de Ciclo": { color: "green", label: "Quebra de Ciclo" },
}

const getStatusBadge = (status) => {
  const config = statusConfig[status] || { color: "gray", label: "Desconhecido" }
  const colors = {
    red: "bg-red-100 text-red-800 border-red-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    gray: "bg-gray-100 text-gray-800 border-gray-200",
  }
  return <Badge className={`font-semibold ${colors[config.color]}`}>{config.label}</Badge>
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export default function FamiliesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Painel de Famílias</h1>
            <p className="text-gray-600 mt-1">Acompanhe o desenvolvimento e as metas de cada família.</p>
          </div>
          <Link href="/families/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Plus className="mr-2" /> Nova Família
            </Button>
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Todas as Famílias</h2>
            <div className="relative w-64">
              <Input type="search" placeholder="Buscar família..." className="pl-10" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-600">NOME DA FAMÍLIA</th>
                  <th className="p-4 font-semibold text-gray-600">DIGNÔMETRO</th>
                  <th className="p-4 font-semibold text-gray-600">STATUS</th>
                  <th className="p-4 font-semibold text-gray-600">MENTOR</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                {families.map((family) => (
                  <motion.tr
                    key={family.id}
                    variants={itemVariants}
                    whileHover={{ backgroundColor: "#F9FAFB", scale: 1.01 }}
                    className="border-b border-gray-100 cursor-pointer"
                  >
                    <td className="p-4 font-medium text-gray-800">{family.name}</td>
                    <td className="p-4 font-medium text-gray-700">{family.score.toFixed(1)}</td>
                    <td className="p-4">{getStatusBadge(family.status)}</td>
                    <td className="p-4 text-gray-600">{family.mentor}</td>
                    <td className="p-4 text-right">
                      <Link href={`/families/${family.id}`}>
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600">
                          <ChevronRight />
                        </Button>
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

// Mock Input component if not available
const Input = (props) => (
  <input
    {...props}
    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow ${props.className}`}
  />
)
