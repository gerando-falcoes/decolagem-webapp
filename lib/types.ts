// Tipos para o sistema Dignômetro

export interface DiagnosticoQuestion {
  id: string;
  dimensao: string;
  pergunta: string;
}

export interface DiagnosticoResponse {
  id: string;
  userId: string;
  userEmail: string;
  familyId: string;
  responses: Record<string, boolean>;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DignometroAssessment {
  id: string;
  family_id: string;
  answers: Record<string, boolean>;
  poverty_score: number;
  poverty_level: string;
  dimension_scores: Record<string, number>;
  assessment_date: string;
  created_at: string;
}

export type PovertyLevel = 
  | "quebra de ciclo da pobreza"
  | "prosperidade em desenvolvimento" 
  | "dignidade"
  | "pobreza"
  | "pobreza extrema";
