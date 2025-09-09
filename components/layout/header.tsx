import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Header() {
  return (
    <header className="bg-white border-b border-[#e5e7eb] px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-bold text-[#231e3d]">Dignômetro</h1>

          <nav className="flex space-x-6">
            <Link href="/dashboard" className="text-[#374151] hover:text-[#590da5] font-medium">
              Dashboard
            </Link>
            <Link href="/families" className="text-[#374151] hover:text-[#590da5] font-medium">
              Famílias
            </Link>
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src="/abstract-profile.png" />
              <AvatarFallback className="bg-[#590da5] text-white">AS</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/settings">Configurações da Conta</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
