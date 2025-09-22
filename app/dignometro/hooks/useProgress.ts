"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import { diagnosticoQuestions, DiagnosticoService } from '@/lib/diagnostico';

export function useProgress() {
  const [currentStep, setCurrentStep] = useState<number>(() => 
    DiagnosticoService.loadCurrentStep()
  );

  const totalSteps = useMemo(() => diagnosticoQuestions.length, []);

  // Salvar no localStorage sempre que currentStep mudar
  useEffect(() => {
    DiagnosticoService.saveCurrentStep(currentStep);
  }, [currentStep]);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => {
      const next = Math.min(prev + 1, totalSteps - 1);
      DiagnosticoService.saveCurrentStep(next);
      return next;
    });
  }, [totalSteps]);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => {
      const previous = Math.max(prev - 1, 0);
      DiagnosticoService.saveCurrentStep(previous);
      return previous;
    });
  }, []);

  const goToStep = useCallback((step: number) => {
    const validStep = Math.max(0, Math.min(step, totalSteps - 1));
    setCurrentStep(validStep);
    DiagnosticoService.saveCurrentStep(validStep);
  }, [totalSteps]);

  const canGoNext = useMemo(() => currentStep < totalSteps - 1, [currentStep, totalSteps]);
  const canGoPrevious = useMemo(() => currentStep > 0, [currentStep]);

  const currentQuestion = useMemo(() => 
    diagnosticoQuestions[currentStep], 
    [currentStep]
  );

  const resetProgress = useCallback(() => {
    setCurrentStep(0);
    DiagnosticoService.saveCurrentStep(0);
  }, []);

  return {
    currentStep,
    totalSteps,
    nextStep,
    previousStep,
    goToStep,
    canGoNext,
    canGoPrevious,
    currentQuestion,
    resetProgress
  };
}
