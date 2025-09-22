"use client";

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, BarChart3, RefreshCw, Home } from 'lucide-react';
import { diagnosticoQuestions, DiagnosticoService } from '@/lib/diagnostico';

interface ResultCardProps {
  result: {
    score: number;
    responses: Record<string, boolean>;
  };
  onRestart: () => void;
  onGoToDashboard: () => void;
}

export function ResultCard({ result, onRestart, onGoToDashboard }: ResultCardProps) {
  const povertyLevel = DiagnosticoService.getPovertyLevel(result.score);
  
  const getPovertyLevelColor = (level: string) => {
    switch (level) {
      case "quebra de ciclo da pobreza":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "prosperidade em desenvolvimento":
        return "bg-green-100 text-green-800 border-green-200";
      case "dignidade":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pobreza":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pobreza extrema":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.0) return "text-emerald-600";
    if (score >= 6.0) return "text-green-600";
    if (score >= 4.0) return "text-blue-600";
    if (score >= 2.0) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader className="text-center pb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              Diagnóstico Concluído!
            </h2>
          </div>
          
          <div className="space-y-3">
            <div className={`text-6xl font-bold ${getScoreColor(result.score)}`}>
              {result.score.toFixed(1)}
            </div>
            
            <Badge 
              variant="outline" 
              className={`text-lg px-4 py-2 font-medium ${getPovertyLevelColor(povertyLevel)}`}
            >
              {povertyLevel}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Respostas por Dimensão
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diagnosticoQuestions.map((question) => {
              const answer = result.responses[question.id];
              return (
                <div 
                  key={question.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    answer 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {answer ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <span className="font-medium text-gray-900">
                      {question.dimensao}
                    </span>
                  </div>
                  
                  <Badge 
                    variant="outline"
                    className={`${
                      answer 
                        ? 'bg-green-100 text-green-800 border-green-300' 
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}
                  >
                    {answer ? 'Sim' : 'Não'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onGoToDashboard}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
            >
              <Home className="w-5 h-5" />
              <span>Ir para Dashboard</span>
            </Button>
            
            <Button
              onClick={onRestart}
              variant="outline"
              className="flex items-center space-x-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refazer Diagnóstico</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
