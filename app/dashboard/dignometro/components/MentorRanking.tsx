"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMentorRankingData, MentorRankingData } from '../hooks/useMentorRankingData';
import { Loader2, AlertTriangle, Trophy, Users, TrendingUp, AlertCircle } from 'lucide-react';

export function MentorRanking() {
  const { data: mentorData, isLoading, error } = useMentorRankingData();

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy size={18} />
            Ranking de Mentores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Analisando performance dos mentores...</p>
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
            <Trophy size={18} />
            Ranking de Mentores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">Erro ao carregar ranking de mentores</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!mentorData || mentorData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy size={18} />
            Ranking de Mentores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Nenhum mentor encontrado</p>
              <p className="text-gray-400 text-sm">Não há mentores com famílias avaliadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Função para obter posição do ranking
  const getRankPosition = (index: number) => {
    switch (index) {
      case 0: return { icon: '🥇', color: 'text-yellow-600' };
      case 1: return { icon: '🥈', color: 'text-gray-500' };
      case 2: return { icon: '🥉', color: 'text-orange-600' };
      default: return { icon: `${index + 1}`, color: 'text-gray-400' };
    }
  };

  // Função para obter cor baseada na performance
  const getPerformanceColor = (avgScore: number) => {
    if (avgScore >= 7) return 'text-green-600';
    if (avgScore >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Função para obter cor de fundo baseada na performance
  const getBackgroundColor = (avgScore: number) => {
    if (avgScore >= 7) return 'bg-green-50 border-green-200';
    if (avgScore >= 5) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy size={18} />
          Ranking de Mentores
        </CardTitle>
        <p className="text-sm text-gray-600">
          Performance dos mentores baseada na pontuação média das famílias
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Estatísticas gerais */}
          <div className="grid grid-cols-3 gap-3 py-2 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-base font-bold text-blue-600">
                {mentorData.length}
              </p>
              <p className="text-xs text-gray-600">Mentores</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-green-600">
                {mentorData.reduce((sum, m) => sum + m.families_count, 0)}
              </p>
              <p className="text-xs text-gray-600">Famílias</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-purple-600">
                {mentorData.reduce((sum, m) => sum + m.assessments_count, 0)}
              </p>
              <p className="text-xs text-gray-600">Avaliações</p>
            </div>
          </div>

          {/* Ranking dos mentores */}
          <div className="space-y-2">
            {mentorData.slice(0, 10).map((mentor, index) => {
              const rank = getRankPosition(index);
              return (
                <div 
                  key={mentor.mentor_email}
                  className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${getBackgroundColor(mentor.avg_score)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${rank.color}`}>
                        {rank.icon}
                      </span>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {mentor.mentor_email.split('@')[0]}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {mentor.families_count} famílias • {mentor.assessments_count} avaliações
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${getPerformanceColor(mentor.avg_score)}`}>
                          {mentor.avg_score.toFixed(1)}/10
                        </span>
                        {mentor.success_rate >= 50 && (
                          <TrendingUp size={14} className="text-green-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {mentor.success_rate.toFixed(0)}% sucesso
                      </p>
                    </div>
                  </div>
                  
                  {/* Barra de progresso */}
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${(mentor.avg_score / 10) * 100}%`,
                        backgroundColor: mentor.avg_score >= 7 ? '#16A34A' : 
                                       mentor.avg_score >= 5 ? '#EAB308' : '#DC2626'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="flex justify-center gap-4 text-xs pt-2 border-t">
            <div className="flex items-center gap-1">
              <TrendingUp size={12} className="text-green-600" />
              <span className="text-green-800">≥50% sucesso</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle size={12} className="text-red-600" />
              <span className="text-red-800">&lt;50% sucesso</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
