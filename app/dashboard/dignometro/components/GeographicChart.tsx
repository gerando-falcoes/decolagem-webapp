"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGeographicData, GeographicData } from '../hooks/useGeographicData';
import { Loader2, AlertTriangle, MapPin, Users, TrendingUp, Map } from 'lucide-react';

export function GeographicChart() {
  const { data: geographicData, isLoading, error } = useGeographicData();

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Map size={18} />
            Mapa Geográfico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Analisando dados geográficos...</p>
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
            <Map size={18} />
            Mapa Geográfico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">Erro ao carregar dados geográficos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!geographicData || geographicData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Map size={18} />
            Mapa Geográfico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Nenhum dado geográfico</p>
              <p className="text-gray-400 text-sm">Não há famílias com localização cadastrada</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Função para obter cor baseada na pontuação média
  const getScoreColor = (avgScore: number) => {
    if (avgScore >= 7) return { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' };
    if (avgScore >= 5) return { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' };
    if (avgScore >= 3) return { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800' };
    return { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800' };
  };

  // Função para obter cor da barra de progresso
  const getProgressColor = (avgScore: number) => {
    if (avgScore >= 7) return '#16A34A';
    if (avgScore >= 5) return '#EAB308';
    if (avgScore >= 3) return '#EA580C';
    return '#DC2626';
  };

  // Função para obter intensidade do heatmap
  const getHeatIntensity = (avgScore: number) => {
    return Math.min(avgScore / 10, 1);
  };

  // Agrupar por estado
  const statesData = geographicData.reduce((acc, location) => {
    if (!acc[location.state]) {
      acc[location.state] = {
        state: location.state,
        cities: [],
        totalFamilies: 0,
        totalAssessed: 0,
        avgScore: 0
      };
    }
    
    acc[location.state].cities.push(location);
    acc[location.state].totalFamilies += location.families_count;
    acc[location.state].totalAssessed += location.assessed_families;
    
    return acc;
  }, {} as Record<string, any>);

  // Calcular score médio por estado
  Object.values(statesData).forEach((state: any) => {
    const totalScore = state.cities.reduce((sum: number, city: GeographicData) => 
      sum + (city.avg_score * city.assessed_families), 0);
    state.avgScore = state.totalAssessed > 0 ? totalScore / state.totalAssessed : 0;
  });

  const sortedStates = Object.values(statesData).sort((a: any, b: any) => b.avgScore - a.avgScore);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Map size={18} />
          Mapa Geográfico
        </CardTitle>
        <p className="text-sm text-gray-600">
          Distribuição das famílias por localização e performance regional
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Estatísticas gerais */}
          <div className="grid grid-cols-3 gap-3 py-2 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-base font-bold text-blue-600">
                {Object.keys(statesData).length}
              </p>
              <p className="text-xs text-gray-600">Estados</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-green-600">
                {geographicData.length}
              </p>
              <p className="text-xs text-gray-600">Cidades</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-purple-600">
                {geographicData.reduce((sum, loc) => sum + loc.families_count, 0)}
              </p>
              <p className="text-xs text-gray-600">Famílias</p>
            </div>
          </div>

          {/* Heatmap por Estados */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <MapPin size={16} />
              Performance por Estado
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sortedStates.map((state: any, index) => {
                const colors = getScoreColor(state.avgScore);
                const progressColor = getProgressColor(state.avgScore);
                const heatIntensity = getHeatIntensity(state.avgScore);
                
                return (
                  <div 
                    key={state.state}
                    className={`p-3 rounded-lg border-2 ${colors.bg} ${colors.border} transition-all duration-200 hover:shadow-md`}
                    style={{
                      opacity: 0.7 + (heatIntensity * 0.3), // Intensidade do heatmap
                      transform: `scale(${1 + (heatIntensity * 0.05)})` // Efeito de escala baseado na performance
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h5 className={`text-sm font-bold ${colors.text}`}>
                          {state.state}
                        </h5>
                        <p className="text-xs text-gray-600">
                          {state.cities.length} cidade(s) • {state.totalFamilies} família(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${colors.text}`}>
                          {state.avgScore.toFixed(1)}/10
                        </span>
                        <p className="text-xs text-gray-500">
                          {state.totalAssessed} avaliada(s)
                        </p>
                      </div>
                    </div>
                    
                    {/* Barra de progresso */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${(state.avgScore / 10) * 100}%`,
                          backgroundColor: progressColor
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detalhes por Cidade */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Users size={16} />
              Detalhes por Cidade
            </h4>
            
            <div className="max-h-48 overflow-y-auto space-y-1">
              {geographicData.slice(0, 10).map((location, index) => {
                const colors = getScoreColor(location.avg_score);
                const progressColor = getProgressColor(location.avg_score);
                
                return (
                  <div 
                    key={`${location.state}-${location.city}`}
                    className={`p-2 rounded border ${colors.bg} ${colors.border} hover:shadow-sm transition-all duration-200`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-gray-500" />
                        <span className="text-xs font-medium text-gray-800">
                          {location.city}, {location.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-600">
                          {location.families_count} fam.
                        </span>
                        <span className="text-xs text-gray-600">
                          {location.assessed_families} aval.
                        </span>
                        <span className={`text-xs font-bold ${colors.text}`}>
                          {location.avg_score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Barra de progresso mini */}
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div
                        className="h-1 rounded-full transition-all duration-300 ease-out"
                        style={{ 
                          width: `${(location.avg_score / 10) * 100}%`,
                          backgroundColor: progressColor
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legenda do Heatmap */}
          <div className="flex justify-center gap-4 text-xs pt-2 border-t">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="text-green-800">≥7.0 Excelente</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span className="text-yellow-800">5.0-6.9 Bom</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-400"></div>
              <span className="text-orange-800">3.0-4.9 Regular</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <span className="text-red-800">&lt;3.0 Crítico</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
