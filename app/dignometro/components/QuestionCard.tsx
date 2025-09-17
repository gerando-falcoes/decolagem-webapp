"use client";

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { DiagnosticoQuestion } from '@/lib/types';

interface QuestionCardProps {
  question: DiagnosticoQuestion;
  onAnswer: (questionId: string, answer: boolean) => void;
  selectedValue?: boolean;
}

export function QuestionCard({ question, onAnswer, selectedValue }: QuestionCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Badge 
            variant="secondary" 
            className="bg-blue-100 text-blue-800 font-medium px-3 py-1"
          >
            {question.dimensao}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-lg font-medium text-gray-900 leading-relaxed">
          {question.pergunta}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Button
            onClick={() => onAnswer(question.id, true)}
            variant={selectedValue === true ? "default" : "outline"}
            className={`flex-1 py-6 text-lg font-medium transition-all duration-200 ${
              selectedValue === true
                ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                : 'border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400'
            }`}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Sim
          </Button>
          
          <Button
            onClick={() => onAnswer(question.id, false)}
            variant={selectedValue === false ? "default" : "outline"}
            className={`flex-1 py-6 text-lg font-medium transition-all duration-200 ${
              selectedValue === false
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                : 'border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400'
            }`}
          >
            <XCircle className="w-5 h-5 mr-2" />
            Não
          </Button>
        </div>
        
        {selectedValue !== undefined && (
          <div className="flex items-center justify-center mt-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              selectedValue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {selectedValue ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                Resposta: {selectedValue ? 'Sim' : 'Não'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
