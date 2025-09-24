"use client";

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, AlertTriangle } from 'lucide-react';
import { DashboardFamily } from '../types/dashboard';

interface DignometroStatsProps {
  families: DashboardFamily[];
}

export function DignometroStats({ families }: DignometroStatsProps) {
  // Calcular métricas
  const totalFamilies = families.length;
  
  // Filtrar famílias que têm avaliação
  const familiesWithAssessment = families.filter(f => f.poverty_score !== null);
  const avgScore = familiesWithAssessment.length > 0 
    ? familiesWithAssessment.reduce((sum, f) => sum + (f.poverty_score || 0), 0) / familiesWithAssessment.length 
    : 0;
  
  const criticalFamilies = families.filter(f => 
    f.poverty_level === 'pobreza extrema' || f.poverty_level === 'pobreza'
  ).length;

  const successfulFamilies = families.filter(f => 
    f.poverty_level === 'quebra de ciclo da pobreza' || 
    f.poverty_level === 'prosperidade em desenvolvimento'
  ).length;

  const stats = [
    {
      title: 'Total de Famílias',
      value: totalFamilies,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pontuação Média',
      value: avgScore.toFixed(1),
      suffix: '/10',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Famílias Críticas',
      value: criticalFamilies,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Em Prosperidade',
      value: successfulFamilies,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                  <span className="text-sm text-gray-500 ml-1">
                    {stat.suffix}
                  </span>
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}