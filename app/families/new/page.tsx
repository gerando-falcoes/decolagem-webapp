import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"

export default function NewFamilyPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Header />

      <main className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-[#374151] mb-2">
            <span>Famílias</span>
            <span>/</span>
            <span>Adicionar nova família</span>
          </div>
          <h1 className="text-2xl font-bold text-[#231e3d] mb-2">Adicionar Nova Família</h1>
          <p className="text-[#374151]">Preencha os campos abaixo para adicionar uma nova família à plataforma.</p>
        </div>

        <form className="space-y-8">
          {/* 1. General Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#231e3d]">1. Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="familyName" className="text-[#374151] font-medium">
                  Nome da família*
                </Label>
                <Input id="familyName" placeholder="Ex. Família Silva" className="mt-1 bg-white border-[#d1d5db]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone" className="text-[#374151] font-medium">
                    Telefone*
                  </Label>
                  <Input id="phone" placeholder="(XX) XXXX-XXXX" className="mt-1 bg-white border-[#d1d5db]" />
                </div>
                <div>
                  <Label htmlFor="whatsapp" className="text-[#374151] font-medium">
                    WhatsApp
                  </Label>
                  <Input id="whatsapp" placeholder="(XX) X XXXX-XXXX" className="mt-1 bg-white border-[#d1d5db]" />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-[#374151] font-medium">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ex. email@exemplo.com"
                  className="mt-1 bg-white border-[#d1d5db]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="income" className="text-[#374151] font-medium">
                    Faixa de renda*
                  </Label>
                  <Select>
                    <SelectTrigger className="mt-1 bg-white border-[#d1d5db]">
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
                  <Label htmlFor="familySize" className="text-[#374151] font-medium">
                    Tamanho da família*
                  </Label>
                  <Input id="familySize" placeholder="Ex. 4" className="mt-1 bg-white border-[#d1d5db]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="children" className="text-[#374151] font-medium">
                    Nº de crianças
                  </Label>
                  <Input id="children" placeholder="Ex. 2" className="mt-1 bg-white border-[#d1d5db]" />
                </div>
                <div>
                  <Label htmlFor="mentor" className="text-[#374151] font-medium">
                    Mentor responsável
                  </Label>
                  <div className="flex space-x-2 mt-1">
                    <Select>
                      <SelectTrigger className="bg-white border-[#d1d5db]">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carlos">Carlos Mendes</SelectItem>
                        <SelectItem value="ana">Ana Souza</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#374151]">* Campos obrigatórios</p>
            </CardContent>
          </Card>

          {/* 2. Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#231e3d]">2. Endereço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="state" className="text-[#374151] font-medium">
                    Estado*
                  </Label>
                  <Select>
                    <SelectTrigger className="mt-1 bg-white border-[#d1d5db]">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sp">São Paulo</SelectItem>
                      <SelectItem value="rj">Rio de Janeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city" className="text-[#374151] font-medium">
                    Cidade
                  </Label>
                  <Input id="city" placeholder="São Paulo" className="mt-1 bg-white border-[#d1d5db]" />
                </div>
              </div>

              <div>
                <Label htmlFor="street" className="text-[#374151] font-medium">
                  Rua*
                </Label>
                <Input id="street" placeholder="Ex. Rua das Flores, 123" className="mt-1 bg-white border-[#d1d5db]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="neighborhood" className="text-[#374151] font-medium">
                    Bairro*
                  </Label>
                  <Input id="neighborhood" placeholder="Ex. Vila Nova" className="mt-1 bg-white border-[#d1d5db]" />
                </div>
                <div>
                  <Label htmlFor="reference" className="text-[#374151] font-medium">
                    Ponto de referência
                  </Label>
                  <Input
                    id="reference"
                    placeholder="Ex. Próximo ao mercado"
                    className="mt-1 bg-white border-[#d1d5db]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Responsible Person Access */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#231e3d]">3. Acesso do responsável</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-[#374151]">
                Crie uma senha para que o responsável pela família possa acessar o portal e acompanhar o progresso.
              </p>

              <div>
                <Label htmlFor="autoEmail" className="text-[#374151] font-medium">
                  E-mail (auto-preenchido)
                </Label>
                <Input
                  id="autoEmail"
                  value="silva.family@email.com"
                  disabled
                  className="mt-1 bg-[#f2f0f4] border-[#d1d5db]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="password" className="text-[#374151] font-medium">
                    Criar senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    className="mt-1 bg-white border-[#d1d5db]"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-[#374151] font-medium">
                    Confirmar senha
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita a senha"
                    className="mt-1 bg-white border-[#d1d5db]"
                  />
                </div>
              </div>

              <p className="text-xs text-[#374151]">A senha deve ter no mínimo 8 caracteres, com letras e números.</p>
            </CardContent>
          </Card>

          {/* 4. Privacy and Consent */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#231e3d]">4. Privacidade e Consentimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-3">
                <Checkbox id="consent" className="mt-1" />
                <Label htmlFor="consent" className="text-sm text-[#374151] leading-relaxed">
                  Concordo com os{" "}
                  <a href="#" className="text-[#590da5] underline">
                    Termos de Uso
                  </a>{" "}
                  e a{" "}
                  <a href="#" className="text-[#590da5] underline">
                    Política de Privacidade
                  </a>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline">Cancelar</Button>
            <Button className="bg-[#590da5] hover:bg-[#4a0b87]">Salvar Família</Button>
            <Button className="bg-[#10b981] hover:bg-[#059669]">Salvar e Enviar Dignômetro</Button>
          </div>
        </form>
      </main>
    </div>
  )
}
