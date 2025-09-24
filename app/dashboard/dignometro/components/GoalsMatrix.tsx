"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoalsMatrixData, GoalsMatrixData } from '../hooks/useGoalsMatrixData';
import { Loader2, AlertTriangle, Target, CheckCircle, Clock, XCircle, Plus } from 'lucide-react';

export function GoalsMatrix() {
  const { data: goalsData, isLoading, error } = useGoalsMatrixData();

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target size={18} />
            Matriz de Metas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Analisando matriz de metas...</p>
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
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target size={18} />
            Matriz de Metas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">Erro ao carregar matriz de metas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!goalsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target size={18} />
            Matriz de Metas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Nenhum dado disponível</p>
              <p className="text-gray-400 text-sm">Não há dados de metas para exibir</p>
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

  // Tradução de status para exibição
  const statusLabels: Record<string, string> = {
    'pending': 'Pendente',
    'in_progress': 'Em Progresso',
    'completed': 'Concluída',
    'cancelled': 'Cancelada'
  };

  // Função para obter cor baseada no status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800', icon: CheckCircle };
      case 'in_progress': return { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', icon: Clock };
      case 'pending': return { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800', icon: Clock };
      case 'cancelled': return { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', icon: XCircle };
      default: return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-800', icon: Target };
    }
  };

  if (!goalsData.hasAssignments) {
    // Mostrar templates disponíveis
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target size={18} />
            Matriz de Metas
          </CardTitle>
          <p className="text-sm text-gray-600">
            Templates de metas disponíveis por dimensão
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Estatísticas gerais */}
            <div className="grid grid-cols-1 gap-3 py-2 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">
                  {goalsData.totalTemplates || 0}
                </p>
                <p className="text-xs text-gray-600">Templates Disponíveis</p>
              </div>
            </div>

            {/* Templates por dimensão */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Plus size={16} />
                Templates por Dimensão
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(goalsData.templatesByDimension || {}).map(([dimension, templates]) => (
                  <div 
                    key={dimension}
                    className="p-3 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-all duration-200"
                  >
                    <h5 className="text-sm font-semibold text-gray-800 mb-2">
                      {dimensionLabels[dimension] || dimension}
                    </h5>
                    <div className="space-y-1">
                      {templates.slice(0, 3).map((template, index) => (
                        <div key={index} className="text-xs text-gray-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          <span className="truncate">{template}</span>
                        </div>
                      ))}
                      {templates.length > 3 && (
                        <div className="text-xs text-gray-500 italic">
                          +{templates.length - 3} mais...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mensagem informativa */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-blue-600" />
                <h4 className="text-sm font-semibold text-blue-800">Metas não atribuídas</h4>
              </div>
              <p className="text-sm text-blue-700">
                Nenhuma meta foi atribuída às famílias ainda. As famílias precisam receber metas para que a matriz seja preenchida.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mostrar matriz de metas reais
  const dimensions = Object.keys(goalsData.matrix || {});
  const allStatuses = new Set();
  dimensions.forEach(dim => {
    Object.keys(goalsData.matrix![dim]).forEach(status => allStatuses.add(status));
  });
  const statusList = Array.from(allStatuses) as string[];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target size={18} />
          Matriz de Metas
        </CardTitle>
        <p className="text-sm text-gray-600">
          Distribuição de metas por dimensão e status de progresso
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Estatísticas gerais */}
          <div className="grid grid-cols-3 gap-3 py-2 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-base font-bold text-blue-600">
                {dimensions.length}
              </p>
              <p className="text-xs text-gray-600">Dimensões</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-green-600">
                {statusList.length}
              </p>
              <p className="text-xs text-gray-600">Status</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-purple-600">
                {goalsData.totalAssignments || 0}
              </p>
              <p className="text-xs text-gray-600">Metas</p>
            </div>
          </div>

          {/* Matriz de metas */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Target size={16} />
              Distribuição por Dimensão e Status
            </h4>
            
            <div className="overflow-x-auto">
              <div className="min-w-full space-y-2">
                {dimensions.map((dimension) => (
                  <div 
                    key={dimension}
                    className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-all duration-200"
                  >
                    <div className="w-32 flex-shrink-0">
                      <h5 className="text-sm font-semibold text-gray-800">
                        {dimensionLabels[dimension] || dimension}
                      </h5>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap flex-1">
                      {statusList.map((status) => {
                        const count = goalsData.matrix![dimension][status] || 0;
                        const colors = getStatusColor(status);
                        const IconComponent = colors.icon;
                        
                        return (
                          <div 
                            key={status}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md border ${colors.bg} ${colors.border}`}
                          >
                            <IconComponent size={12} className={colors.text} />
                            <span className={`text-xs font-medium ${colors.text}`}>
                              {count}
                            </span>
                            <span className={`text-xs ${colors.text}`}>
                              {statusLabels[status] || status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumo por status */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle size={16} />
              Resumo por Status
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {statusList.map((status) => {
                const total = dimensions.reduce((sum, dim) => 
                  sum + (goalsData.matrix![dim][status] || 0), 0);
                const colors = getStatusColor(status);
                const IconComponent = colors.icon;
                
                return (
                  <div 
                    key={status}
                    className={`p-3 rounded-lg border ${colors.bg} ${colors.border} text-center`}
                  >
                    <IconComponent size={20} className={`${colors.text} mx-auto mb-1`} />
                    <p className={`text-lg font-bold ${colors.text}`}>
                      {total}
                    </p>
                    <p className={`text-xs ${colors.text}`}>
                      {statusLabels[status] || status}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legenda */}
          <div className="flex justify-center gap-4 text-xs pt-2 border-t">
            <div className="flex items-center gap-1">
              <CheckCircle size={12} className="text-green-600" />
              <span className="text-green-800">Concluída</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-blue-600" />
              <span className="text-blue-800">Em Progresso</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-yellow-600" />
              <span className="text-yellow-800">Pendente</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle size={12} className="text-red-600" />
              <span className="text-red-800">Cancelada</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
