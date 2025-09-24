export interface DashboardFamily {
    family_id: string;
    family_name: string;
    city: string;
    state: string;
    mentor_email: string | null;
    status_aprovacao: string;
    family_size: number;
    children_count: number;
    income_range: string;
    assessment_id: string | null;
    answers: Record<string, boolean> | null;
    poverty_score: number | null;
    poverty_level: string | null;
    dimension_scores: Record<string, number> | null;
    assessment_date: string | null;
    assessment_created_at: string | null;
    poverty_level_numeric: number;
    positive_answers: number;
    days_since_assessment: number | null;
  }
  
  export interface WeeklyTimeline {
    week_start: string;
    assessments_count: number;
    avg_score: number;
    quebra_ciclo_count: number;
    prosperidade_count: number;
    dignidade_count: number;
    pobreza_count: number;
    pobreza_extrema_count: number;
  }
  