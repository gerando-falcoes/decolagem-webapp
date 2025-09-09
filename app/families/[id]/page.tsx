import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Phone, MessageCircle, Mail, MapPin, CheckCircle } from "lucide-react"

export default function FamilyProfilePage() {
  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Header />

      <main className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2 text-sm text-[#374151] mb-2">
              <span>Famílias</span>
              <span>/</span>
              <span>Família Silva</span>
            </div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-[#231e3d]">Família Silva</h1>
              <Badge className="bg-orange-100 text-orange-800">Pobreza Moderada</Badge>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">Voltar ao painel</Button>
            <Button className="bg-[#590da5] hover:bg-[#4a0b87]">Iniciar nova avaliação</Button>
            <Button className="bg-[#10b981] hover:bg-[#059669]">Adicionar meta</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#231e3d]">Informações de contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-[#374151]" />
                  <div>
                    <p className="text-sm font-medium text-[#231e3d]">Telefone</p>
                    <p className="text-sm text-[#374151]">+55 11 99999-8888</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-4 h-4 text-[#10b981]" />
                  <div>
                    <p className="text-sm font-medium text-[#231e3d]">WhatsApp</p>
                    <p className="text-sm text-[#374151]">+55 11 99999-8888</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-[#590da5]" />
                  <div>
                    <p className="text-sm font-medium text-[#231e3d]">E-mail</p>
                    <p className="text-sm text-[#374151]">silva.family@email.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#231e3d]">Endereço</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-[#374151] mt-1" />
                  <div>
                    <p className="text-sm text-[#374151]">Endereço: Rua das Flores, 123 - Vila Esperança, São Paulo</p>
                    <p className="text-sm text-[#374151] mt-2">
                      <strong>Referência:</strong> Próximo ao mercado
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Socioeconomic Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#231e3d]">Dados Socioeconômicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-[#231e3d]">Faixa de renda</p>
                  <p className="text-sm text-[#374151]">R$ 1 - R$ 500</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#231e3d]">Tamanho da família</p>
                  <p className="text-sm text-[#374151]">4 pessoas</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#231e3d]">Crianças</p>
                  <p className="text-sm text-[#374151]">2</p>
                </div>
              </CardContent>
            </Card>

            {/* Registration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#231e3d]">Registro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-[#231e3d]">Cadastro criado em</p>
                  <p className="text-sm text-[#374151]">15/04/2023</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#231e3d]">Última atualização</p>
                  <p className="text-sm text-[#374151]">20/07/2024</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column */}
          <div className="space-y-6">
            {/* Dignity Meter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#231e3d]">Dignômetro da família</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle
                      cx="60"
                      cy="60"
                      r="45"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="8"
                      strokeDasharray={`${(7.5 / 10) * 283} 283`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#231e3d]">7.5</div>
                      <div className="text-sm text-[#374151]">/10</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-orange-600">Pobreza Moderada</p>
                <p className="text-xs text-[#374151] mt-1">Última avaliação em 20/07/2024</p>
              </CardContent>
            </Card>

            {/* Evolution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#231e3d]">Evolução das avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-between">
                  <div className="w-full h-full bg-gradient-to-t from-purple-100 to-purple-200 rounded relative">
                    <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-[#590da5] rounded-b"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#374151]">20/07/2024</span>
                    <span className="font-medium text-[#231e3d]">Nota 75</span>
                    <Badge className="bg-orange-100 text-orange-800">Moderada</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#374151]">15/04/2024</span>
                    <span className="font-medium text-[#231e3d]">Nota 72</span>
                    <Badge className="bg-orange-100 text-orange-800">Moderada</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#374151]">10/01/2024</span>
                    <span className="font-medium text-[#231e3d]">Nota 68</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Vulnerável</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Latest Evaluation Responses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#231e3d]">Respostas da última avaliação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-[#231e3d] mb-2">Saúde e Bem-estar</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#374151]">SA01 - Acesso a serviços de saúde</span>
                      <span className="font-medium">90</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#374151]">SA02 - Qualidade da alimentação</span>
                      <span className="font-medium">94</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#231e3d] mb-2">Moradia</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#374151]">MO01 - Condições da habitação</span>
                      <span className="font-medium">45</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#374151]">MO02 - Acesso a saneamento básico</span>
                      <span className="font-medium">35</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#374151] italic">
                  * Notas de 0 a 100, onde 100 é a melhor avaliação possível
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Family Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#231e3d]">Metas da família</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-[#231e3d]">Reforma do Banheiro</h4>
                    <Badge className="bg-blue-100 text-blue-800">Em Andamento</Badge>
                  </div>
                  <p className="text-sm text-[#374151] mb-3">Categoria: Moradia</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso: 50%</span>
                      <span>Prazo: 31/12/2024</span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button variant="link" size="sm" className="text-[#590da5] p-0 h-auto">
                      Ver detalhes
                    </Button>
                    <Button variant="link" size="sm" className="text-[#10b981] p-0 h-auto">
                      Atualizar
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-[#231e3d]">Curso Profissionalizante</h4>
                    <Badge className="bg-gray-100 text-gray-800">A Fazer</Badge>
                  </div>
                  <p className="text-sm text-[#374151] mb-3">Categoria: Renda e Trabalho</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso: 0%</span>
                      <span>Prazo: 20/12/2024</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button variant="link" size="sm" className="text-[#590da5] p-0 h-auto">
                      Ver detalhes
                    </Button>
                    <Button variant="link" size="sm" className="text-[#10b981] p-0 h-auto">
                      Atualizar
                    </Button>
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
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#3b82f6] rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#231e3d]">Nova avaliação realizada</p>
                    <p className="text-xs text-[#374151]">Há 2 dias</p>
                    <p className="text-xs text-[#374151]">A nota geral da família Silva subiu para 75</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-[#10b981] mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#231e3d]">Meta Reforma do Banheiro atualizada</p>
                    <p className="text-xs text-[#374151]">Há 5 dias</p>
                    <p className="text-xs text-[#374151]">Progresso atualizado para 50%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
