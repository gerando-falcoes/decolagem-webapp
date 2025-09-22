export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          role: string
          phone: Json | null
          created_at: string
          updated_at: string
          email: Json | null
          status_aprovacao: string | null
          aprovado_por: string | null
          data_aprovacao: string | null
          cpf_responsavel: string | null
          cpf: string | null
          senha: string | null
        }
        Insert: {
          id: string
          name?: string | null
          role?: string
          phone?: Json | null
          created_at?: string
          updated_at?: string
          email?: Json | null
          status_aprovacao?: string | null
          aprovado_por?: string | null
          data_aprovacao?: string | null
          cpf_responsavel?: string | null
          cpf?: string | null
          senha?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          role?: string
          phone?: Json | null
          created_at?: string
          updated_at?: string
          email?: Json | null
          status_aprovacao?: string | null
          aprovado_por?: string | null
          data_aprovacao?: string | null
          cpf_responsavel?: string | null
          cpf?: string | null
          senha?: string | null
        }
      }
      families: {
        Row: {
          id: string
          name: string
          phone: string | null
          whatsapp: string | null
          email: Json | null
          street: string | null
          neighborhood: string | null
          city: string | null
          state: string | null
          reference_point: Json | null
          income_range: string | null
          family_size: number | null
          children_count: number | null
          status: string
          created_at: string
          updated_at: string
          mentor_email: Json | null
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          whatsapp?: string | null
          email?: Json | null
          street?: string | null
          neighborhood?: string | null
          city?: string | null
          state?: string | null
          reference_point?: Json | null
          income_range?: string | null
          family_size?: number | null
          children_count?: number | null
          status?: string
          created_at?: string
          updated_at?: string
          mentor_email?: Json | null
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          whatsapp?: string | null
          email?: Json | null
          street?: string | null
          neighborhood?: string | null
          city?: string | null
          state?: string | null
          reference_point?: Json | null
          income_range?: string | null
          family_size?: number | null
          children_count?: number | null
          status?: string
          created_at?: string
          updated_at?: string
          mentor_email?: Json | null
        }
      }
      family_members: {
        Row: {
          id: string
          family_id: string
          name: string
          birth_date: string | null
          relation: string | null
          documents_json: Json
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          birth_date?: string | null
          relation?: string | null
          documents_json?: Json
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          birth_date?: string | null
          relation?: string | null
          documents_json?: Json
        }
      }
      assessments: {
        Row: {
          id: string
          family_id: string
          answers: Json
          poverty_score: number
          poverty_level: string
          dimension_scores: Json
          assessment_date: string
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          answers: Json
          poverty_score: number
          poverty_level: string
          dimension_scores: Json
          assessment_date: string
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          answers?: Json
          poverty_score?: number
          poverty_level?: string
          dimension_scores?: Json
          assessment_date?: string
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          family_id: string
          assessment_id: string | null
          goal_title: string
          goal_category: string
          target_date: string | null
          current_status: string
          progress_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          assessment_id?: string | null
          goal_title: string
          goal_category: string
          target_date?: string | null
          current_status?: string
          progress_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          assessment_id?: string | null
          goal_title?: string
          goal_category?: string
          target_date?: string | null
          current_status?: string
          progress_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
      followups: {
        Row: {
          id: string
          goal_id: string
          note: string | null
          next_reminder_at: string | null
        }
        Insert: {
          id?: string
          goal_id: string
          note?: string | null
          next_reminder_at?: string | null
        }
        Update: {
          id?: string
          goal_id?: string
          note?: string | null
          next_reminder_at?: string | null
        }
      }
      alerts: {
        Row: {
          id: string
          family_id: string
          type: string
          message: string
          severity: string
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          family_id: string
          type: string
          message: string
          severity?: string
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          type?: string
          message?: string
          severity?: string
          created_at?: string
          resolved_at?: string | null
        }
      }
      attachments: {
        Row: {
          id: string
          family_id: string
          url: string
          title: string | null
          mime_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          url: string
          title?: string | null
          mime_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          url?: string
          title?: string | null
          mime_type?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          entity: string
          entity_id: string | null
          action: string
          diff_json: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          entity: string
          entity_id?: string | null
          action: string
          diff_json?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          entity?: string
          entity_id?: string | null
          action?: string
          diff_json?: Json | null
          created_at?: string
        }
      }
      dignometro_dimensions: {
        Row: {
          id: string
          key: string
          label: string
          description: string | null
          order_index: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          label: string
          description?: string | null
          order_index?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          label?: string
          description?: string | null
          order_index?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      dignometro_questions: {
        Row: {
          id: string
          dimension_id: string
          key: string
          text: string
          order_index: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dimension_id: string
          key: string
          text: string
          order_index?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dimension_id?: string
          key?: string
          text?: string
          order_index?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      dignometro_responses: {
        Row: {
          id: string
          family_id: string
          question_id: string
          answer: string
          answered_at: string
          source: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          question_id: string
          answer: string
          answered_at?: string
          source?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          question_id?: string
          answer?: string
          answered_at?: string
          source?: string
          created_at?: string
          updated_at?: string
        }
      }
      goal_templates: {
        Row: {
          id: string
          dimension_id: string
          question_id: string | null
          title: string
          description: string | null
          default_due_days: number | null
          priority: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dimension_id: string
          question_id?: string | null
          title: string
          description?: string | null
          default_due_days?: number | null
          priority?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dimension_id?: string
          question_id?: string | null
          title?: string
          description?: string | null
          default_due_days?: number | null
          priority?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      family_goals: {
        Row: {
          id: string
          family_id: string
          dimension_id: string
          template_id: string | null
          title: string
          description: string | null
          status: string
          due_date: string | null
          created_by: string | null
          source: string
          progress: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          dimension_id: string
          template_id?: string | null
          title: string
          description?: string | null
          status?: string
          due_date?: string | null
          created_by?: string | null
          source?: string
          progress?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          dimension_id?: string
          template_id?: string | null
          title?: string
          description?: string | null
          status?: string
          due_date?: string | null
          created_by?: string | null
          source?: string
          progress?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      family_goal_events: {
        Row: {
          id: string
          goal_id: string
          type: string
          payload: Json
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          type: string
          payload?: Json
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          type?: string
          payload?: Json
          created_by?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
