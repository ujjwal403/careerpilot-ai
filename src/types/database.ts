export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18'
  }
  public: {
    Tables: {
      applications: {
        Row: {
          ai_match_reasons: Json | null
          ai_match_score: number | null
          applied_at: string | null
          cover_letter: string | null
          created_at: string
          id: string
          interview_at: string | null
          job_id: string
          last_activity_at: string
          notes: string | null
          offer_received_at: string | null
          resume_id: string | null
          status: Database['public']['Enums']['application_status_enum']
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_match_reasons?: Json | null
          ai_match_score?: number | null
          applied_at?: string | null
          cover_letter?: string | null
          created_at?: string
          id?: string
          interview_at?: string | null
          job_id: string
          last_activity_at?: string
          notes?: string | null
          offer_received_at?: string | null
          resume_id?: string | null
          status?: Database['public']['Enums']['application_status_enum']
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_match_reasons?: Json | null
          ai_match_score?: number | null
          applied_at?: string | null
          cover_letter?: string | null
          created_at?: string
          id?: string
          interview_at?: string | null
          job_id?: string
          last_activity_at?: string
          notes?: string | null
          offer_received_at?: string | null
          resume_id?: string | null
          status?: Database['public']['Enums']['application_status_enum']
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'applications_job_id_fkey'
            columns: ['job_id']
            isOneToOne: false
            referencedRelation: 'jobs'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'applications_resume_id_fkey'
            columns: ['resume_id']
            isOneToOne: false
            referencedRelation: 'resumes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'applications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      jobs: {
        Row: {
          benefits: string | null
          company: string
          company_logo_url: string | null
          created_at: string
          description: string | null
          experience_level:
            | Database['public']['Enums']['experience_level_enum']
            | null
          expires_at: string | null
          id: string
          is_active: boolean
          is_remote: boolean
          job_type: Database['public']['Enums']['job_type_enum'] | null
          location: string | null
          posted_at: string | null
          requirements: string | null
          salary_currency: string
          salary_max: number | null
          salary_min: number | null
          skills_required: string[]
          source: string | null
          source_job_id: string | null
          source_url: string | null
          title: string
          views_count: number
        }
        Insert: {
          benefits?: string | null
          company: string
          company_logo_url?: string | null
          created_at?: string
          description?: string | null
          experience_level?:
            | Database['public']['Enums']['experience_level_enum']
            | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_remote?: boolean
          job_type?: Database['public']['Enums']['job_type_enum'] | null
          location?: string | null
          posted_at?: string | null
          requirements?: string | null
          salary_currency?: string
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[]
          source?: string | null
          source_job_id?: string | null
          source_url?: string | null
          title: string
          views_count?: number
        }
        Update: {
          benefits?: string | null
          company?: string
          company_logo_url?: string | null
          created_at?: string
          description?: string | null
          experience_level?:
            | Database['public']['Enums']['experience_level_enum']
            | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_remote?: boolean
          job_type?: Database['public']['Enums']['job_type_enum'] | null
          location?: string | null
          posted_at?: string | null
          requirements?: string | null
          salary_currency?: string
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[]
          source?: string | null
          source_job_id?: string | null
          source_url?: string | null
          title?: string
          views_count?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          title: string
          type: Database['public']['Enums']['notification_type_enum']
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          title: string
          type: Database['public']['Enums']['notification_type_enum']
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          title?: string
          type?: Database['public']['Enums']['notification_type_enum']
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          cgpa: string | null
          college_name: string | null
          country: string | null
          state: string | null
          city: string | null
          created_at: string
          degree: string | null
          desired_locations: string[]
          desired_roles: string[]
          desired_salary_max: number | null
          desired_salary_min: number | null
          field_of_study: string | null
          github_url: string | null
          headline: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          open_to_work: boolean
          passing_year: number | null
          phone: string | null
          portfolio_url: string | null
          profile_complete: number
          skills: string[]
          updated_at: string
          user_id: string
          website_url: string | null
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          cgpa?: string | null
          college_name?: string | null
          country?: string | null
          state?: string | null
          city?: string | null
          created_at?: string
          degree?: string | null
          desired_locations?: string[]
          desired_roles?: string[]
          desired_salary_max?: number | null
          desired_salary_min?: number | null
          field_of_study?: string | null
          github_url?: string | null
          headline?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          open_to_work?: boolean
          passing_year?: number | null
          phone?: string | null
          portfolio_url?: string | null
          profile_complete?: number
          skills?: string[]
          updated_at?: string
          user_id: string
          website_url?: string | null
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          cgpa?: string | null
          college_name?: string | null
          country?: string | null
          state?: string | null
          city?: string | null
          created_at?: string
          degree?: string | null
          desired_locations?: string[]
          desired_roles?: string[]
          desired_salary_max?: number | null
          desired_salary_min?: number | null
          field_of_study?: string | null
          github_url?: string | null
          headline?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          open_to_work?: boolean
          passing_year?: number | null
          phone?: string | null
          portfolio_url?: string | null
          profile_complete?: number
          skills?: string[]
          updated_at?: string
          user_id?: string
          website_url?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      resumes: {
        Row: {
          ai_analyzed_at: string | null
          ai_feedback: Json | null
          ai_keywords: string[]
          ai_score: number | null
          content: string | null
          created_at: string
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_primary: boolean
          mime_type: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analyzed_at?: string | null
          ai_feedback?: Json | null
          ai_keywords?: string[]
          ai_score?: number | null
          content?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_primary?: boolean
          mime_type?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analyzed_at?: string | null
          ai_feedback?: Json | null
          ai_keywords?: string[]
          ai_score?: number | null
          content?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_primary?: boolean
          mime_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'resumes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          last_sign_in: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          last_sign_in?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_sign_in?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { '': string }; Returns: string[] }
      unaccent: { Args: { '': string }; Returns: string }
    }
    Enums: {
      application_status_enum:
        | 'saved'
        | 'applied'
        | 'screening'
        | 'interview'
        | 'offer'
        | 'rejected'
        | 'withdrawn'
      experience_level_enum: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
      job_type_enum:
        | 'full-time'
        | 'part-time'
        | 'contract'
        | 'internship'
        | 'freelance'
      notification_type_enum:
        | 'job_match'
        | 'application_update'
        | 'resume_feedback'
        | 'interview_reminder'
        | 'offer_received'
        | 'system'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience Row types
export type User = Database['public']['Tables']['users']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Resume = Database['public']['Tables']['resumes']['Row']
export type Job = Database['public']['Tables']['jobs']['Row']
export type Application = Database['public']['Tables']['applications']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
