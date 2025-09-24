"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePovertyLevelData } from '../hooks/usePovertyLevelData';
import { Loader2, AlertTriangle, PieChart } from 'lucide-react';

export function PovertyLevelChart() {
  const { data: povertyData, isLoading, error } = usePovertyLevelData();

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart size={20} />
            Gráfico de Níveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Carregando dados...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart size={20} />
            Gráfico de Níveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">Erro ao carregar dados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!povertyData || povertyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart size={20} />
            Gráfico de Níveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Nenhum dado disponível</p>
              <p className="text-gray-400 text-sm">Não há famílias com avaliações</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = povertyData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart size={20} />
          Distribuição por Níveis de Pobreza
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend and Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {povertyData.map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(1);
              return (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="font-medium text-gray-900 text-sm capitalize">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.value} {item.value === 1 ? 'família' : 'famílias'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visual representation with bars */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Distribuição Visual (Total: {total} famílias)
            </p>
            {povertyData.map((item, index) => {
              const percentage = (item.value / total) * 100;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 capitalize">{item.name}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
