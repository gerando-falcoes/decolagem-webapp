"use client";

import { useState, useCallback, useEffect } from 'react';
import { DiagnosticoService } from '@/lib/diagnostico';

export function useDiagnostico() {
  const [responses, setResponses] = useState<Record<string, boolean>>(() => 
    DiagnosticoService.loadResponses()
  );

  // Atualizar localStorage sempre que responses mudar
  useEffect(() => {
    Object.keys(responses).forEach(questionId => {
      DiagnosticoService.saveResponse(questionId, responses[questionId]);
    });
  }, [responses]);

  const updateResponse = useCallback((questionId: string, answer: boolean) => {
    setResponses(prev => {
      const updated = { ...prev, [questionId]: answer };
      DiagnosticoService.saveResponse(questionId, answer);
      return updated;
    });
  }, []);

  const isAnswered = useCallback((questionId: string): boolean => {
    return responses[questionId] !== undefined;
  }, [responses]);

  const getResponse = useCallback((questionId: string): boolean | undefined => {
    return responses[questionId];
  }, [responses]);

  const clearResponses = useCallback(() => {
    setResponses({});
    DiagnosticoService.clearAll();
  }, []);

  const getTotalAnswered = useCallback((): number => {
    return Object.keys(responses).length;
  }, [responses]);

  return {
    responses,
    updateResponse,
    isAnswered,
    getResponse,
    clearResponses,
    getTotalAnswered
  };
}
