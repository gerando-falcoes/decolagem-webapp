"use client"

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VincularFamiliaModal } from "@/components/families/vincular-familia-modal";
import { AprovarFamiliasModal } from "@/components/families/aprovar-familias-modal";
import { DeletarFamiliaModal } from "@/components/families/deletar-familia-modal";
import Link from "next/link";
import { Plus, Search, ChevronRight, Link as LinkIcon, CheckCircle, ChevronDown, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabaseBrowserClient } from "@/lib/supabase/browser";

// Fetch data from API to ensure real-time updates
async function getFamiliesData() {
  try {
    console.log('🔍 Buscando dados das famílias via API...')
    
    const response = await fetch('/api/families')
    
    if (!response.ok) {
      console.error('❌ Erro na API de famílias:', response.status)
      return []
    }

    const { families } = await response.json()
    console.log('✅ Dados das famílias recebidos da API:', families?.length || 0)
    
    return families || []
  } catch (error) {
    console.error('❌ Erro ao buscar famílias via API:', error)
    return []
  }
}

const statusConfig = {
  "Pobreza Extrema": { color: "red", label: "Pobreza Extrema" },
  Pobreza: { color: "orange", label: "Pobreza" },
  Dignidade: { color: "yellow", label: "Dignidade" },
  Prosperidade: { color: "blue", label: "Prosperidade" },
  "Quebra de Ciclo": { color: "green", label: "Quebra de Ciclo" },
};

const getStatusBadge = (status) => {
  if (!status) return <Badge className={`font-semibold bg-gray-100 text-gray-800 border-gray-200`}>Não Avaliado</Badge>;
  const config = statusConfig[status] || { color: "gray", label: status };
  const colors = {
    red: "bg-red-100 text-red-800 border-red-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    gray: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return <Badge className={`font-semibold ${colors[config.color]}`}>{config.label}</Badge>;
};

export default function FamiliesPage() {
  const [families, setFamilies] = useState([]);
  const [filteredFamilies, setFilteredFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isVincularModalOpen, setIsVincularModalOpen] = useState(false);
  const [isAprovarModalOpen, setIsAprovarModalOpen] = useState(false);
  const [isDeletarModalOpen, setIsDeletarModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const loadFamilies = async () => {
      setLoading(true);
      const data = await getFamiliesData();
      setFamilies(data);
      setFilteredFamilies(data);
      setLoading(false);
    };

    loadFamilies();
  }, []);

  // Filtrar famílias baseado na busca
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredFamilies(families);
    } else {
      const filtered = families.filter(family =>
        family.FAMILIA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        family.MENTOR?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        family.STATUS?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFamilies(filtered);
    }
  }, [searchTerm, families]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleVincularSuccess = () => {
    // Recarregar a lista após vincular
    getFamiliesData().then(data => {
      setFamilies(data);
      setFilteredFamilies(data);
    });
  };

  const handleAprovarSuccess = () => {
    // Recarregar a lista após aprovação
    getFamiliesData().then(data => {
      setFamilies(data);
      setFilteredFamilies(data);
    });
  };

  const handleDeletarSuccess = () => {
    // Recarregar a lista após exclusão
    getFamiliesData().then(data => {
      setFamilies(data);
      setFilteredFamilies(data);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Painel de Famílias</h1>
            <p className="text-gray-600 mt-1">Acompanhe o desenvolvimento e as metas de cada família.</p>
          </div>
          <div className="flex space-x-3">
            <div className="relative dropdown-container">
              <Button 
                variant="outline" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Ações
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsVincularModalOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 focus:bg-green-50 flex items-center"
                    >
                      <LinkIcon className="mr-2 h-4 w-4 text-green-600" />
                      <span className="text-green-700 font-medium">Vincular Família</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsAprovarModalOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 focus:bg-blue-50 flex items-center"
                    >
                      <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                      <span className="text-blue-700 font-medium">Aprovar Famílias</span>
                    </button>
                    
                    <Link 
                      href="/families/new"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 focus:bg-blue-50 flex items-center"
                    >
                      <Plus className="mr-2 h-4 w-4 text-blue-600" />
                      <span className="text-blue-700 font-medium">Nova Família</span>
                    </Link>
                    
                    <button
                      onClick={() => {
                        setIsDeletarModalOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 focus:bg-red-50 flex items-center"
                    >
                      <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                      <span className="text-red-700 font-medium">Deletar Família</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Todas as Famílias</h2>
            <div className="relative w-64">
              <Input 
                type="search" 
                placeholder="Buscar família..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Carregando famílias...</span>
            </div>
          ) : filteredFamilies.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhuma família encontrada' : 'Nenhuma família cadastrada'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? `Não encontramos famílias que correspondam a "${searchTerm}"`
                  : 'Comece cadastrando uma nova família'
                }
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm("")}
                  className="mt-4"
                >
                  Limpar busca
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="p-4 font-semibold text-gray-600">FAMILIA</th>
                    <th className="p-4 font-semibold text-gray-600">DIGNOMETRO</th>
                    <th className="p-4 font-semibold text-gray-600">STATUS</th>
                    <th className="p-4 font-semibold text-gray-600">MENTOR</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFamilies.map((family, index) => (
                    <tr
                      key={index} // Using index as key since view might not have a unique ID per row
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-4 font-medium text-gray-800">{family.FAMILIA}</td>
                      <td className="p-4 font-medium text-gray-700">{family.DIGNOMETRO ? family.DIGNOMETRO.toFixed(1) : "--"}</td>
                      <td className="p-4">{getStatusBadge(family.STATUS)}</td>
                      <td className="p-4 text-gray-600">{family.MENTOR || "--"}</td>
                      <td className="p-4 text-right">
                        {/* The link should ideally use a family ID if available from the view */}
                        <Link href={`/families/${family.family_id}`}>
                          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600">
                            <ChevronRight />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Vincular Família */}
      <VincularFamiliaModal
        isOpen={isVincularModalOpen}
        onClose={() => setIsVincularModalOpen(false)}
        onSuccess={handleVincularSuccess}
      />

      {/* Modal de Aprovar Famílias */}
      <AprovarFamiliasModal
        isOpen={isAprovarModalOpen}
        onClose={() => setIsAprovarModalOpen(false)}
        onSuccess={handleAprovarSuccess}
      />

      {/* Modal de Deletar Família */}
      <DeletarFamiliaModal
        isOpen={isDeletarModalOpen}
        onClose={() => setIsDeletarModalOpen(false)}
        onSuccess={handleDeletarSuccess}
      />
    </div>
  );
}
