"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTimelineData } from '../hooks/useTimelineData';
import { Loader2, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';

export function TimelineChart() {
  const { data: timelineData, isLoading, error } = useTimelineData(12);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Timeline de Evolução
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Carregando timeline...</p>
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
            <Calendar size={20} />
            Timeline de Evolução
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">Erro ao carregar timeline</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!timelineData || timelineData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Timeline de Evolução
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Nenhum dado disponível</p>
              <p className="text-gray-400 text-sm">Não há dados de timeline</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular valores para o gráfico
  const maxScore = Math.max(...timelineData.map(d => d.score));
  const maxAssessments = Math.max(...timelineData.map(d => d.assessments));
  const totalAssessments = timelineData.reduce((sum, d) => sum + d.assessments, 0);
  const avgScore = timelineData.reduce((sum, d) => sum + d.score, 0) / timelineData.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar size={20} />
          Timeline de Evolução (Últimas 12 semanas)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Métricas resumo */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalAssessments}</p>
              <p className="text-sm text-gray-600">Total de Avaliações</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{avgScore.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Score Médio</p>
            </div>
          </div>

          {/* Gráfico de linha simples */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Evolução da Pontuação Média</h4>
            <div className="relative h-40 bg-gray-50 rounded-lg p-4">
              <div className="flex items-end justify-between h-full">
                {timelineData.reverse().map((week, index) => {
                  const height = maxScore > 0 ? (week.score / maxScore) * 100 : 0;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 mx-1">
                      <div className="flex flex-col items-center h-full justify-end">
                        {/* Barra */}
                        <div 
                          className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 min-h-[2px]"
                          style={{ height: `${height}%` }}
                          title={`Semana ${week.week}: ${week.score.toFixed(1)} pontos - ${week.assessments} avaliações`}
                        />
                        {/* Label da semana */}
                        <p className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-center whitespace-nowrap">
                          {week.week}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tabela de detalhes */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Detalhes por Semana</h4>
            <div className="max-h-40 overflow-y-auto">
              <div className="space-y-1">
                {timelineData.map((week, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-2 rounded hover:bg-gray-50 text-sm"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-gray-700 w-12">{week.week}</span>
                      <span className="text-blue-600 font-medium">{week.score.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500">
                      <span>{week.assessments} avaliações</span>
                      {week.assessments > 0 && (
                        <TrendingUp size={14} className="text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legenda das cores dos níveis */}
          {timelineData.some(w => w.quebra_ciclo + w.prosperidade + w.dignidade + w.pobreza + w.pobreza_extrema > 0) && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 text-sm">Distribuição por Níveis</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
                  <span>Quebra Ciclo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded"></div>
                  <span>Prosperidade</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Dignidade</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span>Pobreza</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
