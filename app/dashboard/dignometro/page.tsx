"use client";

import { Header } from '@/components/layout/header';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDignometroData } from './hooks/useDignometroData';
import { DignometroStats } from './components/DignometroStats';
import { PovertyLevelChart } from './components/PovertyLevelChart';
import { TimelineChart } from './components/TimelineChart';
import { DimensionChart } from './components/DimensionChart';
import { MentorRanking } from './components/MentorRanking';
import { GeographicChart } from './components/GeographicChart';
import { GoalsMatrix } from './components/GoalsMatrix';
import { FamiliesTable } from './components/FamiliesTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Cliente React Query (mova para um arquivo separado se preferir)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});

function DignometroDashboardContent() {
  const { families, timeline, isLoading, error } = useDignometroData();

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Erro ao carregar dados: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
          <div className="container mx-auto px-4 py-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Dignômetro</h1>
        <p className="text-sm text-gray-600">
          Acompanhe o progresso das famílias e identifique oportunidades de melhoria
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
          <span className="text-sm">Carregando dados...</span>
        </div>
      )}

      {/* Main Layout */}
      {!isLoading && (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Sidebar com KPIs */}
          <div className="lg:w-72 flex-shrink-0 space-y-4">
            <DignometroStats />
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1 space-y-4">
            {/* Tabela de Famílias */}
            <FamiliesTable />

            {/* Gráficos em Grid Compacto */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <PovertyLevelChart />
              <TimelineChart />
              <DimensionChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MentorRanking />
              <GeographicChart />
            </div>

            {/* Matriz de Metas */}
            <GoalsMatrix />
          </div>
        </div>
      )}
    </div>
  );
}

export default function DignometroDashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <DignometroDashboardContent />
      </div>
    </QueryClientProvider>
  );
}