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
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard Dignômetro</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Acompanhe o progresso das famílias e identifique oportunidades de melhoria
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
          <span className="text-lg">Carregando dados...</span>
        </div>
      )}

          {/* Stats */}
          {!isLoading && (
            <>
              <DignometroStats />

              {/* Tabela de Famílias */}
              <FamiliesTable />

              {/* Gráficos e componentes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PovertyLevelChart />

            <TimelineChart />
          </div>

          {/* Análise de Dimensões */}
          <DimensionChart />

          {/* Ranking de Mentores */}
          <MentorRanking />

          {/* Mapa Geográfico */}
          <GeographicChart />

          {/* Matriz de Metas */}
          <GoalsMatrix />

          {/* Debug info (remova em produção) */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Total de famílias: {families.length}</p>
              <p>Semanas na timeline: {timeline.length}</p>
              <details className="mt-4">
                <summary className="cursor-pointer text-blue-600">
                  Ver dados brutos (clique para expandir)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify({ families: families.slice(0, 3), timeline: timeline.slice(0, 3) }, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        </>
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