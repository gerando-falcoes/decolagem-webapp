import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, FileText, Users, AlertTriangle } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Header />

      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#374151]">Total de Famílias Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#231e3d]">1.234</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#374151]">Número de Avaliações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#231e3d]">567</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#374151]">Famílias Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#231e3d]">890</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#374151]">Casos Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">3</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Average Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#231e3d]">Pontuação Média</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#84cc16"
                      strokeWidth="8"
                      strokeDasharray={`${(7.8 / 10) * 314} 314`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#231e3d]">7.8</div>
                      <div className="text-sm text-[#374151]">/10</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 ml-8">
                  <p className="text-sm text-[#374151] mb-2">Média das avaliações mais recentes.</p>
                  <div className="flex items-center text-green-600 text-sm">
                    <span>↗ +5.4%</span>
                    <span className="ml-2 text-[#374151]">vs. período anterior</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dimension Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#231e3d]">Médias por Dimensão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#374151]">Moradia</span>
                  <div className="flex items-center space-x-3 flex-1 ml-4">
                    <Progress value={85} className="flex-1 h-2" />
                    <span className="text-sm font-medium text-[#231e3d] w-8">8.5</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#374151]">Saúde</span>
                  <div className="flex items-center space-x-3 flex-1 ml-4">
                    <Progress value={78} className="flex-1 h-2" />
                    <span className="text-sm font-medium text-[#231e3d] w-8">7.8</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#374151]">Renda</span>
                  <div className="flex items-center space-x-3 flex-1 ml-4">
                    <Progress value={62} className="flex-1 h-2" />
                    <span className="text-sm font-medium text-[#231e3d] w-8">6.2</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#374151]">Educação</span>
                  <div className="flex items-center space-x-3 flex-1 ml-4">
                    <Progress value={49} className="flex-1 h-2" />
                    <span className="text-sm font-medium text-[#231e3d] w-8">4.9</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#231e3d]">Distribuição por Nível de Dignidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between h-48 space-x-2">
                  {[
                    { height: 60, color: "#ef4444" },
                    { height: 45, color: "#f97316" },
                    { height: 80, color: "#3b82f6" },
                    { height: 70, color: "#10b981" },
                    { height: 65, color: "#8b5cf6" },
                    { height: 75, color: "#06b6d4" },
                  ].map((bar, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full rounded-t"
                        style={{
                          height: `${bar.height}%`,
                          backgroundColor: bar.color,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-[#10b981] rounded"></div>
                    <span>Excelente (≥8)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-[#3b82f6] rounded"></div>
                    <span>Bom (7-8)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-[#f97316] rounded"></div>
                    <span>Regular (5-6.9)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-[#ef4444] rounded"></div>
                    <span>Crítico (&lt;5)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#231e3d]">Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-[#10b981]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#231e3d]">Avaliação concluída para a família Silva</p>
                    <p className="text-xs text-[#374151]">Mentor: Carlos Andrade</p>
                  </div>
                  <span className="text-xs text-[#374151]">20 de Julho de 2024</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-[#3b82f6]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#231e3d]">Nova família (Pereira) cadastrada</p>
                    <p className="text-xs text-[#374151]">Responsável: Ana Pereira</p>
                  </div>
                  <span className="text-xs text-[#374151]">18 de Julho de 2024</span>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-[#f97316]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#231e3d]">
                      Meta de emprego alcançada para a família Santos
                    </p>
                    <p className="text-xs text-[#374151]">Mentor: João Santos</p>
                  </div>
                  <span className="text-xs text-[#374151]">15 de Julho de 2024</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Attention Points */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#231e3d]">Pontos de Atenção</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700">Educação</span>
                  </div>
                  <div className="text-right">
                    <Button variant="link" size="sm" className="text-red-600 p-0 h-auto">
                      Criar Meta
                    </Button>
                    <Button variant="link" size="sm" className="text-red-600 p-0 h-auto ml-2">
                      Ver Famílias
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-700">Renda</span>
                  </div>
                  <div className="text-right">
                    <Button variant="link" size="sm" className="text-yellow-600 p-0 h-auto">
                      Criar Meta
                    </Button>
                    <Button variant="link" size="sm" className="text-yellow-600 p-0 h-auto ml-2">
                      Ver Famílias
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#231e3d]">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-[#590da5] hover:bg-[#4a0b87] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Família
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[#590da5] text-[#590da5] hover:bg-[#590da5] hover:text-white bg-transparent"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Nova Avaliação
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
