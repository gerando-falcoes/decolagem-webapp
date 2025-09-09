"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"
import { LayoutGrid, Users, LogOut, Settings, Home } from "lucide-react"

export function Header() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-200/80 shadow-sm"
    >
      <div className="container mx-auto flex items-center justify-between h-20 px-6">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-800 tracking-tighter">Decolagem</h1>
          </Link>

          <nav className="hidden md:flex items-center space-x-2 rounded-full bg-gray-100/80 p-1">
            <NavItem href="/dashboard" icon={<LayoutGrid size={18} />}>
              Dashboard
            </NavItem>
            <NavItem href="/families" icon={<Users size={18} />}>
              Famílias
            </NavItem>
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Avatar className="cursor-pointer h-10 w-10 border-2 border-transparent hover:border-blue-500 transition-colors">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback className="bg-blue-500 text-white font-bold">AS</AvatarFallback>
              </Avatar>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center">
                <Home size={16} className="mr-2" /> Início
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center">
                <Settings size={16} className="mr-2" /> Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 focus:text-red-600 focus:bg-red-50">
              <LogOut size={16} className="mr-2" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  )
}

const NavItem = ({ href, icon, children }) => (
  <Link
    href={href}
    className="flex items-center space-x-2 px-4 py-2 rounded-full text-gray-600 hover:bg-white hover:text-blue-600 transition-colors duration-200 shadow-sm"
  >
    {icon}
    <span className="font-medium">{children}</span>
  </Link>
)
