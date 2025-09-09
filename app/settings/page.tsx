import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Header />

      <main className="p-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#231e3d] text-center">Configurações da Conta</h1>
        </div>

        <Card>
          <CardContent className="p-8">
            <form className="space-y-6">
              <div>
                <Label htmlFor="profileName" className="text-[#374151] font-medium">
                  Nome do Perfil
                </Label>
                <Input id="profileName" defaultValue="Ana Silva" className="mt-2 bg-[#f2f0f4] border-[#d1d5db] py-3" />
              </div>

              <div>
                <Label htmlFor="email" className="text-[#374151] font-medium">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="ana.silva@gerandofalcoes.com"
                  className="mt-2 bg-[#f2f0f4] border-[#d1d5db] py-3"
                />
              </div>

              <div className="pt-4">
                <Button className="w-full bg-[#590da5] hover:bg-[#4a0b87] text-white py-3">Salvar Alterações</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
