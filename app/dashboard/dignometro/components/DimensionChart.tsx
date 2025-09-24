"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDimensionData } from '../hooks/useDimensionData';
import { Loader2, AlertTriangle, Target, CheckCircle, XCircle } from 'lucide-react';

export function DimensionChart() {
  const { data: dimensionData, isLoading, error } = useDimensionData();

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            Performance por Dimensões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Analisando dimensões...</p>
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
            <Target size={20} />
            Performance por Dimensões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">Erro ao analisar dimensões</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!dimensionData || dimensionData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            Performance por Dimensões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <div className="text-center">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Nenhum dado disponível</p>
              <p className="text-gray-400 text-sm">Não há avaliações para analisar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Tradução de dimensões para exibição
  const dimensionLabels: Record<string, string> = {
    'moradia': 'Moradia',
    'agua': 'Água',
    'saneamento': 'Saneamento',
    'educacao': 'Educação',
    'saude': 'Saúde',
    'alimentacao': 'Alimentação',
    'renda_diversificada': 'Renda Diversificada',
    'renda_estavel': 'Renda Estável',
    'poupanca': 'Poupança',
    'bens_conectividade': 'Bens e Conectividade'
  };

  // Função para determinar ícone baseado na performance
  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 70) return <CheckCircle size={16} className="text-green-600" />;
    if (percentage >= 40) return <Target size={16} className="text-yellow-600" />;
    return <XCircle size={16} className="text-red-600" />;
  };

  // Função para obter cor de fundo baseada na performance
  const getBackgroundColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-50 border-green-200';
    if (percentage >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target size={18} />
          Performance por Dimensões
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Estatísticas gerais - mais compactas */}
          <div className="flex justify-center gap-6 py-2 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-base font-bold text-green-600">
                {dimensionData.filter(d => d.percentage >= 70).length}
              </p>
              <p className="text-xs text-gray-600">Excelentes</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-yellow-600">
                {dimensionData.filter(d => d.percentage >= 40 && d.percentage < 70).length}
              </p>
              <p className="text-xs text-gray-600">Médias</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-red-600">
                {dimensionData.filter(d => d.percentage < 40).length}
              </p>
              <p className="text-xs text-gray-600">Críticas</p>
            </div>
          </div>

          {/* Lista de dimensões - mais compacta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {dimensionData.map((dimension, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${getBackgroundColor(dimension.percentage)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {getPerformanceIcon(dimension.percentage)}
                    <h4 className="text-sm font-medium text-gray-900">
                      {dimensionLabels[dimension.dimension] || dimension.dimension}
                    </h4>
                  </div>
                  <span className="text-sm font-bold" style={{ color: dimension.color }}>
                    {dimension.percentage}%
                  </span>
                </div>
                
                {/* Barra de progresso mais fina */}
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${dimension.percentage}%`,
                      backgroundColor: dimension.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Legenda compacta */}
          <div className="flex justify-center gap-4 text-xs pt-2 border-t">
            <div className="flex items-center gap-1">
              <CheckCircle size={12} className="text-green-600" />
              <span className="text-green-800">≥70%</span>
            </div>
            <div className="flex items-center gap-1">
              <Target size={12} className="text-yellow-600" />
              <span className="text-yellow-800">40-69%</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle size={12} className="text-red-600" />
              <span className="text-red-800">&lt;40%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
