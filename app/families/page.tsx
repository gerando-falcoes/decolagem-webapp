import { supabaseServerClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Search, ChevronRight, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input"; // Assuming Input is in ui

// Fetch data directly on the server
async function getFamiliesData() {
  const { data, error } = await supabaseServerClient
    .from('vw_families_overview')
    .select('*');

  if (error) {
    console.error('Error fetching families overview:', error);
    return [];
  }
  return data;
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

export default async function FamiliesPage() {
  const families = await getFamiliesData();

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
            <Button 
              variant="outline" 
              className="border-green-600 text-green-600 hover:bg-green-50 font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
            >
              <LinkIcon className="mr-2" /> Vincular Família
            </Button>
            <Link href="/families/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                <Plus className="mr-2" /> Nova Família
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Todas as Famílias</h2>
            <div className="relative w-64">
              <Input type="search" placeholder="Buscar família..." className="pl-10" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

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
                {families.map((family, index) => (
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
        </div>
      </main>
    </div>
  );
}
