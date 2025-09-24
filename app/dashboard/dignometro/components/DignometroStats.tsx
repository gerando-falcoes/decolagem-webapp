"use client";

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, AlertTriangle, Loader2 } from 'lucide-react';
import { useKPIData } from '../hooks/useKPIData';

export function DignometroStats() {
  const { data: kpiData, isLoading, error } = useKPIData();

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-center h-12">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="grid grid-cols-1 gap-3">
        <Card className="col-span-full">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600">Erro ao carregar KPIs</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!kpiData) return null;

  const stats = [
    {
      title: 'Total de Famílias',
      value: kpiData.totalFamilies,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pontuação Média',
      value: kpiData.avgScore,
      suffix: '/10',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Famílias Críticas',
      value: kpiData.criticalFamilies,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Em Prosperidade',
      value: kpiData.successfulFamilies,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-3">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {stat.value}
                  <span className="text-xs text-gray-500 ml-1">
                    {stat.suffix}
                  </span>
                </p>
              </div>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}