"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
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
  Loader2,
  AlertCircle,
  Trash2,
  UserPlus,
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

// Componente para card dos membros da família
const FamilyMemberCard = ({ member, index, onUpdate, onRemove, canRemove }) => (
  <Card className="border-2 border-dashed border-gray-300 hover:border-blue-300 transition-colors">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
          <Users className="w-4 h-4 mr-2 text-blue-500" />
          Membro {index + 1}
        </CardTitle>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor={`member-name-${index}`}>Nome completo</Label>
        <Input
          id={`member-name-${index}`}
          placeholder="Ex. João Silva Santos"
          value={member.name}
          onChange={(e) => onUpdate(index, 'name', e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor={`member-cpf-${index}`}>CPF</Label>
        <Input
          id={`member-cpf-${index}`}
          placeholder="000.000.000-00"
          value={member.cpf}
          onChange={(e) => onUpdate(index, 'cpf', e.target.value)}
          className="mt-1"
        />
      </div>
    </CardContent>
  </Card>
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
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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

  // Estado para membros da família
  const [familyMembers, setFamilyMembers] = useState([
    { name: "", cpf: "" } // Pelo menos um membro inicial
  ]);

  const totalFields = 16; // Atualizado para incluir membros da família
  const completedFields = useMemo(() => {
      const formFieldsCount = Object.values(formData).filter(value => {
          if (typeof value === 'boolean') return value === true;
          return value !== '' && value !== null;
      }).length;
      
      // Contar membros com pelo menos nome preenchido
      const membersCount = familyMembers.filter(member => member.name.trim() !== '').length;
      
      return formFieldsCount + (membersCount > 0 ? 1 : 0);
  }, [formData, familyMembers]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [id]: type === 'checkbox' ? checked : value }))
    // Limpar mensagens de erro/sucesso quando o usuário começar a editar
    if (error) setError("")
    if (success) setSuccess("")
  }

  const handleSelectChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
    // Limpar mensagens de erro/sucesso quando o usuário começar a editar
    if (error) setError("")
    if (success) setSuccess("")
  }

  // Funções para gerenciar membros da família
  const addFamilyMember = () => {
    setFamilyMembers(prev => [...prev, { name: "", cpf: "" }])
  }

  const removeFamilyMember = (index) => {
    setFamilyMembers(prev => prev.filter((_, i) => i !== index))
  }

  const updateFamilyMember = (index, field, value) => {
    setFamilyMembers(prev => prev.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    ))
    // Limpar mensagens de erro/sucesso
    if (error) setError("")
    if (success) setSuccess("")
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Nome da família é obrigatório")
      return false
    }
    if (!formData.email.trim()) {
      setError("E-mail é obrigatório")
      return false
    }
    if (!formData.password.trim()) {
      setError("Senha é obrigatória")
      return false
    }
    if (formData.password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      return false
    }
    
    // Validação dos membros da família
    const validMembers = familyMembers.filter(member => member.name.trim() !== '')
    if (validMembers.length === 0) {
      setError("É necessário cadastrar pelo menos um membro da família")
      return false
    }
    
    if (!formData.consent) {
      setError("É necessário aceitar os termos de uso e política de privacidade")
      return false
    }
    return true
  }

  const handleSubmit = async (e, redirectToDignometro = false) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch('/api/families', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cadastrar família')
      }

      if (redirectToDignometro) {
        setSuccess('Família cadastrada! Redirecionando para o Dignômetro...')
        
        // Redirecionar para o Dignômetro com o ID da família
        setTimeout(() => {
          router.push(`/dignometro?familyId=${data.family.id}`)
        }, 1500)
      } else {
        setSuccess('Família cadastrada com sucesso!')
        
        // Aguardar um pouco para mostrar a mensagem de sucesso
        setTimeout(() => {
          router.push('/families')
        }, 2000)
      }

    } catch (err) {
      setError(err.message || 'Erro ao cadastrar família')
    } finally {
      setIsLoading(false)
    }
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

          {/* Mensagens de Erro e Sucesso */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}

          {/* Main Grid Layout */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_340px] gap-8 items-start">
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
                        <SelectItem value="1000-1500">R$ 1.000 - R$ 1.500</SelectItem>
                        <SelectItem value="1500-2000">R$ 1.500 - R$ 2.000</SelectItem>
                        <SelectItem value="2000-3000">R$ 2.000 - R$ 3.000</SelectItem>
                        <SelectItem value="3000-5000">R$ 3.000 - R$ 5.000</SelectItem>
                        <SelectItem value="5000+">Acima de R$ 5.000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="mentor">Mentor responsável</Label>
                    <div className="flex space-x-2 mt-1">
                      <Select onValueChange={(value) => handleSelectChange("mentor", value)}>
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
                </div>
              </FormSection>

              {/* Nova seção: Membros da Família */}
              <FormSection title="Membros da Família" icon={<UserPlus />} isRequired>
                <div>
                  <Label htmlFor="familySize">Tamanho da família</Label>
                  <Input id="familySize" placeholder="Ex. 4" className="mt-1" onChange={handleInputChange} />
                </div>
                
                <p className="text-sm text-gray-600">
                  Adicione pelo menos um membro da família com nome e CPF.
                </p>
                
                <div className="space-y-4">
                  {familyMembers.map((member, index) => (
                    <FamilyMemberCard
                      key={index}
                      member={member}
                      index={index}
                      onUpdate={updateFamilyMember}
                      onRemove={() => removeFamilyMember(index)}
                      canRemove={familyMembers.length > 1}
                    />
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFamilyMember}
                    className="w-full border-dashed border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50 text-gray-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar novo membro
                  </Button>
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
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/families')}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gray-800 hover:bg-gray-900 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    'Salvar Família'
                  )}
                </Button>
                <Button 
                  type="button" 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isLoading}
                  onClick={(e) => handleSubmit(e, true)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar e Enviar Dignômetro'
                  )}
                </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
