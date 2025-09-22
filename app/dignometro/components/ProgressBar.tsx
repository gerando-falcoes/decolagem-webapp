"use client";

import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span className="font-medium">
          Pergunta {currentStep + 1} de {totalSteps}
        </span>
        <span className="text-blue-600 font-medium">
          {Math.round(progress)}% concluído
        </span>
      </div>
      
      <div className="w-full">
        <Progress 
          value={progress} 
          className="h-3 bg-gray-200"
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>Início</span>
        <span>Finalizar</span>
      </div>
    </div>
  );
}
