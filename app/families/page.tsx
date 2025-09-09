import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function FamiliesPage() {
  const families = [
    { name: "Família Silva", score: 80, status: "Prosperidade em progresso", mentor: "Carlos Mendes" },
    { name: "Família Oliveira", score: 25, status: "Pobreza", mentor: "Ana Souza" },
    { name: "Família Santos", score: 95, status: "Quebra de Ciclo", mentor: "Carlos Mendes" },
    { name: "Família Pereira", score: 10, status: "Pobreza extrema", mentor: "Ana Souza" },
    { name: "Família Costa", score: 60, status: "Dignidade", mentor: "Carlos Mendes" },
    { name: "Família Almeida", score: 85, status: "Prosperidade em progresso", mentor: "Ana Souza" },
    { name: "Família Rocha", score: 48, status: "Pobreza", mentor: "Carlos Mendes" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pobreza extrema":
        return "bg-red-100 text-red-800"
      case "Pobreza":
        return "bg-orange-100 text-orange-800"
      case "Dignidade":
        return "bg-yellow-100 text-yellow-800"
      case "Prosperidade em progresso":
        return "bg-blue-100 text-blue-800"
      case "Quebra de Ciclo":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Header />

      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#231e3d] mb-2">Painel de Famílias – Decolagem</h1>
          <p className="text-[#374151]">Acompanhe o desenvolvimento e as metas de cada família.</p>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#374151]">Pobreza extrema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#231e3d]">15</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#374151]">Pobreza</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#231e3d]">25</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#374151]">Dignidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#231e3d]">40</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#374151]">Prosp. em progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#231e3d]">30</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#374151]">Quebra de Ciclo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#231e3d]">10</div>
            </CardContent>
          </Card>
        </div>

        {/* Families Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f2f0f4]">
                  <tr>
                    <th className="text-left p-4 font-medium text-[#374151]">NOME DA FAMÍLIA</th>
                    <th className="text-left p-4 font-medium text-[#374151]">DIGNÔMETRO (0-10)</th>
                    <th className="text-left p-4 font-medium text-[#374151]">MENTOR</th>
                    <th className="text-left p-4 font-medium text-[#374151]">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {families.map((family, index) => (
                    <tr key={index} className="border-b border-[#e5e7eb]">
                      <td className="p-4">
                        <div className="font-medium text-[#231e3d]">{family.name}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-[#231e3d]">{family.score}</span>
                          <Badge className={getStatusColor(family.status)}>{family.status}</Badge>
                        </div>
                      </td>
                      <td className="p-4 text-[#374151]">{family.mentor}</td>
                      <td className="p-4">
                        <Button variant="link" className="text-[#590da5] p-0 h-auto" asChild>
                          <a href={`/families/${index + 1}`}>Ver Detalhes</a>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
