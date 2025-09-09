"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Users,
  MapPin,
  Lock,
  CheckCircle,
  Eye,
  Lightbulb,
} from "lucide-react"

// Reusable Form Section Component from the plan
const FormSection = ({ title, icon, children, isRequired }) => (
  <Card className="h-fit shadow-md hover:shadow-lg transition-shadow duration-300">
    <CardHeader className="pb-4">
      <div className="flex items-center space-x-3">
        <span className="text-2xl text-blue-500">{icon}</span>
        <CardTitle className="text-lg font-semibold text-gray-800">
          {title}
        </CardTitle>
        {isRequired && (
          <Badge variant="destructive" className="text-xs">
            Obrigatório
          </Badge>
        )}
      </div>
    </CardHeader>
    <CardContent className="space-y-6 pt-2">{children}</CardContent>
  </Card>
)

// Sidebar Component from the plan
const FormSidebar = ({ formData }) => (
  <div className="space-y-6 lg:sticky lg:top-24">
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-base flex items-center text-gray-800">
          <Eye className="w-4 h-4 mr-2 text-blue-500" />
          Preview da Família
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>Nome:</strong> {formData.name || <span className="text-gray-400">Não informado</span>}
          </p>
          <p>
            <strong>Telefone:</strong> {formData.phone || <span className="text-gray-400">Não informado</span>}
          </p>
          <p>
            <strong>Endereço:</strong> {formData.street || <span className="text-gray-400">Não informado</span>}
          </p>
          <p>
            <strong>Mentor:</strong> {formData.mentor || <span className="text-gray-400">Não atribuído</span>}
          </p>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-blue-50 border-blue-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-base flex items-center text-blue-800">
          <Lightbulb className="w-4 h-4 mr-2 text-blue-600" />
          Dicas
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-3 text-blue-700">
        <p>💡 Use o formato (XX) XXXXX-XXXX para telefones.</p>
        <p>📍 Inclua pontos de referência para facilitar visitas.</p>
        <p>🔐 A senha deve ter pelo menos 8 caracteres.</p>
      </CardContent>
    </Card>
  </div>
)

// Progress Indicator from the plan
const ProgressIndicator = ({ completedFields, totalFields }) => {
    const progressPercentage = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
    return (
        <div className="sticky top-[80px] bg-white/80 backdrop-blur-lg shadow-sm border-b z-40 p-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>Famílias</span>
                    <span>/</span>
                    <span className="font-semibold text-gray-700">Adicionar nova família</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                        {completedFields}/{totalFields} campos preenchidos
                    </span>
                    <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-2 bg-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function NewFamilyPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    income: "",
    familySize: "",
    mentor: "",
    state: "",
    city: "",
    street: "",
    neighborhood: "",
    reference: "",
    password: "",
    confirmPassword: "",
    consent: false,
  });

  const totalFields = 15; // Total number of fields in the form
  const completedFields = useMemo(() => {
      return Object.values(formData).filter(value => {
          if (typeof value === 'boolean') return value === true;
          return value !== '' && value !== null;
      }).length;
  }, [formData]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [id]: type === 'checkbox' ? checked : value }))
  }

  const handleSelectChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <ProgressIndicator completedFields={completedFields} totalFields={totalFields} />

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Adicionar Nova Família</h1>
            <p className="text-gray-600 mt-1">Um processo mais claro e organizado para adicionar famílias.</p>
          </div>

          {/* Main Grid Layout */}
          <form className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_340px] gap-8 items-start">
            {/* Form Sections Column 1 */}
            <div className="space-y-8">
              <FormSection title="Informações Gerais" icon={<Users />} isRequired>
                <div>
                  <Label htmlFor="name">Nome da família</Label>
                  <Input id="name" placeholder="Ex. Família Silva" className="mt-1" onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" placeholder="(XX) XXXX-XXXX" className="mt-1" onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input id="whatsapp" placeholder="(XX) X XXXX-XXXX" className="mt-1" onChange={handleInputChange} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="Ex. email@exemplo.com" className="mt-1" onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="income">Faixa de renda</Label>
                    <Select onValueChange={(value) => handleSelectChange("income", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-500">R$ 0 - R$ 500</SelectItem>
                        <SelectItem value="500-1000">R$ 500 - R$ 1.000</SelectItem>
                        <SelectItem value="1000-2000">R$ 1.000 - R$ 2.000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="familySize">Tamanho da família</Label>
                    <Input id="familySize" placeholder="Ex. 4" className="mt-1" onChange={handleInputChange} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="mentor">Mentor responsável</Label>
                  <div className="flex space-x-2 mt-1">
                    <Select onValuecha_change={(value) => handleSelectChange("mentor", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Carlos Mendes">Carlos Mendes</SelectItem>
                        <SelectItem value="Ana Souza">Ana Souza</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </FormSection>

              <FormSection title="Acesso do Responsável" icon={<Lock />}>
                <p className="text-sm text-gray-600 -mt-2">
                  Crie uma senha para que o responsável acesse o portal.
                </p>
                <div>
                  <Label htmlFor="autoEmail">E-mail (auto-preenchido)</Label>
                  <Input id="autoEmail" value={formData.email || ""} disabled className="mt-1 bg-gray-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="password">Criar senha</Label>
                    <Input id="password" type="password" placeholder="Mínimo 8 caracteres" className="mt-1" onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <Input id="confirmPassword" type="password" placeholder="Repita a senha" className="mt-1" onChange={handleInputChange} />
                  </div>
                </div>
              </FormSection>
            </div>

            {/* Form Sections Column 2 */}
            <div className="space-y-8">
              <FormSection title="Endereço" icon={<MapPin />} isRequired>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Select onValueChange={(value) => handleSelectChange("state", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" placeholder="São Paulo" className="mt-1" onChange={handleInputChange} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="street">Rua</Label>
                  <Input id="street" placeholder="Ex. Rua das Flores, 123" className="mt-1" onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input id="neighborhood" placeholder="Ex. Vila Nova" className="mt-1" onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="reference">Ponto de referência</Label>
                    <Input id="reference" placeholder="Ex. Próximo ao mercado" className="mt-1" onChange={handleInputChange} />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Privacidade e Consentimento" icon={<CheckCircle />} isRequired>
                <div className="flex items-start space-x-3">
                  <Checkbox id="consent" className="mt-1" onCheckedChange={(checked) => handleSelectChange("consent", checked)} />
                  <Label htmlFor="consent" className="text-sm text-gray-600 leading-relaxed">
                    Concordo com os{" "}
                    <a href="#" className="text-blue-600 underline">
                      Termos de Uso
                    </a>{" "}
                    e a{" "}
                    <a href="#" className="text-blue-600 underline">
                      Política de Privacidade
                    </a>
                  </Label>
                </div>
              </FormSection>
            </div>

            {/* Sidebar Column */}
            <FormSidebar formData={formData} />

            {/* Action Buttons */}
            <div className="lg:col-span-3 mt-8 flex justify-end space-x-4 border-t pt-6">
                <Button variant="outline">Cancelar</Button>
                <Button className="bg-gray-800 hover:bg-gray-900 text-white">Salvar Família</Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white">Salvar e Enviar Dignômetro</Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
