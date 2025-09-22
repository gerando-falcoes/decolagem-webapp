"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
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
      {/* Primeira linha: Nome, Idade, CPF */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor={`member-name-${index}`}>Nome</Label>
          <Input
            id={`member-name-${index}`}
            placeholder="Nome completo"
            value={member.name}
            onChange={(e) => onUpdate(index, 'name', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`member-age-${index}`}>Idade</Label>
          <Input
            id={`member-age-${index}`}
            type="number"
            placeholder="Idade"
            value={member.age}
            onChange={(e) => onUpdate(index, 'age', e.target.value)}
            className="mt-1"
            min="0"
            max="120"
          />
        </div>
        <div>
          <Label htmlFor={`member-cpf-${index}`}>CPF (Opcional)</Label>
          <Input
            id={`member-cpf-${index}`}
            placeholder="000.000.000-00"
            value={member.cpf}
            onChange={(e) => onUpdate(index, 'cpf', e.target.value)}
            className="mt-1"
            maxLength={14}
          />
        </div>
      </div>

      {/* Segunda linha: Relação com a Família */}
      <div>
        <Label htmlFor={`member-relation-${index}`}>Relação com a Família</Label>
        <Select onValueChange={(value) => onUpdate(index, 'relation', value)} value={member.relation}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Selecione a relação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pai">Pai</SelectItem>
            <SelectItem value="mae">Mãe</SelectItem>
            <SelectItem value="filho">Filho</SelectItem>
            <SelectItem value="filha">Filha</SelectItem>
            <SelectItem value="avo">Avô</SelectItem>
            <SelectItem value="avo-f">Avó</SelectItem>
            <SelectItem value="neto">Neto</SelectItem>
            <SelectItem value="neta">Neta</SelectItem>
            <SelectItem value="irmao">Irmão</SelectItem>
            <SelectItem value="irma">Irmã</SelectItem>
            <SelectItem value="tio">Tio</SelectItem>
            <SelectItem value="tia">Tia</SelectItem>
            <SelectItem value="primo">Primo</SelectItem>
            <SelectItem value="prima">Prima</SelectItem>
            <SelectItem value="cunhado">Cunhado</SelectItem>
            <SelectItem value="cunhada">Cunhada</SelectItem>
            <SelectItem value="sogro">Sogro</SelectItem>
            <SelectItem value="sogra">Sogra</SelectItem>
            <SelectItem value="genro">Genro</SelectItem>
            <SelectItem value="nora">Nora</SelectItem>
            <SelectItem value="padrasto">Padrasto</SelectItem>
            <SelectItem value="madrasta">Madrasta</SelectItem>
            <SelectItem value="enteado">Enteado</SelectItem>
            <SelectItem value="enteada">Enteada</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Terceira linha: Checkboxes */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id={`member-employed-${index}`}
            checked={member.isEmployed}
            onCheckedChange={(checked) => onUpdate(index, 'isEmployed', checked)}
          />
          <Label htmlFor={`member-employed-${index}`} className="text-sm">
            Está empregado
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id={`member-responsible-${index}`}
            checked={member.isResponsible}
            onCheckedChange={(checked) => onUpdate(index, 'isResponsible', checked)}
          />
          <Label htmlFor={`member-responsible-${index}`} className="text-sm">
            É o responsável pela família
          </Label>
        </div>
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
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [mentorEmail, setMentorEmail] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    cpf: "",
    income: "",
    familySize: "",
    cep: "",
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
    { 
      name: "", 
      age: "", 
      cpf: "", 
      relation: "", 
      isEmployed: false, 
      isResponsible: false 
    } // Pelo menos um membro inicial
  ]);

  // Obter email do mentor logado
  useEffect(() => {
    if (user?.email) {
      setMentorEmail(user.email)
    }
  }, [user])

  const totalFields = 16; // Atualizado: removido whatsapp e mentor, adicionado cpf e cep
  const completedFields = useMemo(() => {
      // Contar campos obrigatórios preenchidos (email é opcional)
      const requiredFields = ['name', 'phone', 'cpf', 'income', 'familySize', 'state', 'city', 'street', 'neighborhood', 'reference', 'password', 'confirmPassword'];
      const optionalFields = ['email', 'cep'];
      
      const requiredFieldsCount = requiredFields.filter(field => formData[field] && formData[field].toString().trim() !== '').length;
      const optionalFieldsCount = optionalFields.filter(field => formData[field] && formData[field].toString().trim() !== '').length;
      const consentCount = formData.consent ? 1 : 0;
      
      const formFieldsCount = requiredFieldsCount + optionalFieldsCount + consentCount;
      
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

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica máscara (11) 99999-9999
    if (numbers.length <= 2) {
      return `(${numbers}`
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }
  }

  const formatCPF = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica máscara 000.000.000-00
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData((prev) => ({ ...prev, phone: formatted }))
    if (error) setError("")
    if (success) setSuccess("")
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setFormData((prev) => ({ ...prev, cpf: formatted }))
    if (error) setError("")
    if (success) setSuccess("")
  }

  const formatCEP = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica máscara 00000-000
    if (numbers.length <= 5) {
      return numbers
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
    }
  }

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value)
    setFormData((prev) => ({ ...prev, cep: formatted }))
    if (error) setError("")
    if (success) setSuccess("")
  }

  const fetchAddressByCEP = async (cep: string) => {
    // Remove formatação do CEP
    const cleanCEP = cep.replace(/\D/g, '')
    
    // Verifica se tem 8 dígitos
    if (cleanCEP.length !== 8) return

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const data = await response.json()

      if (data.erro) {
        console.log('CEP não encontrado')
        return
      }

      // Preenche automaticamente os campos de endereço
      setFormData(prev => ({
        ...prev,
        cep: cep, // Usar o CEP original formatado
        state: data.uf || prev.state,
        city: data.localidade || prev.city,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood
      }))

    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    }
  }

  const handleCEPBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value
    if (cep && cep.length >= 8) {
      fetchAddressByCEP(cep)
    }
  }

  // Funções para gerenciar membros da família
  const addFamilyMember = () => {
    setFamilyMembers(prev => [...prev, { 
      name: "", 
      age: "", 
      cpf: "", 
      relation: "", 
      isEmployed: false, 
      isResponsible: false 
    }])
  }

  const removeFamilyMember = (index) => {
    setFamilyMembers(prev => prev.filter((_, i) => i !== index))
  }

  const updateFamilyMember = (index, field, value) => {
    // Aplicar formatação de CPF se necessário
    if (field === 'cpf') {
      value = formatCPF(value)
    }
    
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
    if (!formData.phone.trim()) {
      setError("Telefone/WhatsApp é obrigatório")
      return false
    }
    if (!formData.cpf.trim()) {
      setError("CPF da família é obrigatório")
      return false
    }
    // Validação básica de CPF (11 dígitos)
    const cpfNumbers = formData.cpf.replace(/\D/g, '')
    if (cpfNumbers.length !== 11) {
      setError("CPF deve conter 11 dígitos")
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
        body: JSON.stringify({
          ...formData,
          mentorEmail: mentorEmail, // Adicionar email do mentor automaticamente
          familyMembers: familyMembers // Adicionar membros da família
        }),
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
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Form Sections Column 1 */}
            <div className="space-y-6">
              <FormSection title="Informações Gerais" icon={<Users />} isRequired>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome da família</Label>
                    <Input id="name" placeholder="Ex. Família Silva" className="mt-1" onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone/WhatsApp</Label>
                    <Input 
                      id="phone" 
                      placeholder="(XX) XXXXX-XXXX" 
                      className="mt-1" 
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      maxLength={15}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cpf">CPF da família</Label>
                    <Input 
                      id="cpf" 
                      placeholder="000.000.000-00" 
                      className="mt-1" 
                      value={formData.cpf}
                      onChange={handleCPFChange}
                      maxLength={14}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail <span className="text-gray-500 text-sm">(opcional)</span></Label>
                    <Input id="email" type="email" placeholder="Ex. email@exemplo.com" className="mt-1" onChange={handleInputChange} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="income">Faixa de renda</Label>
                  <Select onValueChange={(value) => handleSelectChange("income", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ate-1412">Até R$ 1.412,00</SelectItem>
                      <SelectItem value="1412-2824">De R$ 1.412,01 a R$ 2.824,00</SelectItem>
                      <SelectItem value="2824-4236">De R$ 2.824,01 a R$ 4.236,00</SelectItem>
                      <SelectItem value="4236-5648">De R$ 4.236,01 a R$ 5.648,00</SelectItem>
                      <SelectItem value="acima-5648">Acima de R$ 5.648,00</SelectItem>
                    </SelectContent>
                  </Select>
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
                    Adicionar Membro
                  </Button>
                </div>
              </FormSection>
            </div>

            {/* Form Sections Column 2 */}
            <div className="space-y-6">
              <FormSection title="Endereço" icon={<MapPin />} isRequired>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cep">CEP <span className="text-gray-500 text-sm">(opcional)</span></Label>
                    <Input 
                      id="cep" 
                      placeholder="00000-000" 
                      className="mt-1" 
                      value={formData.cep}
                      onChange={handleCEPChange}
                      onBlur={handleCEPBlur}
                      maxLength={9}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Digite o CEP para preenchimento automático
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Select onValueChange={(value) => handleSelectChange("state", value)} value={formData.state}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AC">Acre</SelectItem>
                        <SelectItem value="AL">Alagoas</SelectItem>
                        <SelectItem value="AP">Amapá</SelectItem>
                        <SelectItem value="AM">Amazonas</SelectItem>
                        <SelectItem value="BA">Bahia</SelectItem>
                        <SelectItem value="CE">Ceará</SelectItem>
                        <SelectItem value="DF">Distrito Federal</SelectItem>
                        <SelectItem value="ES">Espírito Santo</SelectItem>
                        <SelectItem value="GO">Goiás</SelectItem>
                        <SelectItem value="MA">Maranhão</SelectItem>
                        <SelectItem value="MT">Mato Grosso</SelectItem>
                        <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                        <SelectItem value="PA">Pará</SelectItem>
                        <SelectItem value="PB">Paraíba</SelectItem>
                        <SelectItem value="PR">Paraná</SelectItem>
                        <SelectItem value="PE">Pernambuco</SelectItem>
                        <SelectItem value="PI">Piauí</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                        <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                        <SelectItem value="RO">Rondônia</SelectItem>
                        <SelectItem value="RR">Roraima</SelectItem>
                        <SelectItem value="SC">Santa Catarina</SelectItem>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="SE">Sergipe</SelectItem>
                        <SelectItem value="TO">Tocantins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input 
                      id="city" 
                      placeholder="São Paulo" 
                      className="mt-1" 
                      value={formData.city}
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="street">Rua</Label>
                  <Input 
                    id="street" 
                    placeholder="Ex. Rua das Flores, 123" 
                    className="mt-1" 
                    value={formData.street}
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input 
                      id="neighborhood" 
                      placeholder="Ex. Vila Nova" 
                      className="mt-1" 
                      value={formData.neighborhood}
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="reference">Ponto de referência</Label>
                    <Input 
                      id="reference" 
                      placeholder="Ex. Próximo ao mercado" 
                      className="mt-1" 
                      value={formData.reference}
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Acesso do Responsável" icon={<Lock />}>
                <p className="text-sm text-gray-600 -mt-2 mb-4">
                  O acesso será feito através do CPF da família preenchido anteriormente.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="autoCPF">CPF da família (auto-preenchido)</Label>
                    <Input id="autoCPF" value={formData.cpf || ""} disabled className="mt-1 bg-gray-100" />
                  </div>
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

            {/* Action Buttons */}
            <div className="lg:col-span-2 mt-8 flex justify-end space-x-4 border-t pt-6">
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
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
