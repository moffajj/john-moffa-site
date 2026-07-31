export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: { id: string; email: string; role: string; created_at: string }
        Insert: { id: string; email: string; role?: string; created_at?: string }
        Update: { id?: string; email?: string; role?: string }
        Relationships: []
      }
      teams: {
        Row: { id: string; user_id: string | null; name: string; team_code: string; manager_email: string | null; draft_cap: number; fa_budget: number; created_at: string }
        Insert: { id?: string; user_id?: string | null; name: string; team_code: string; manager_email?: string | null; draft_cap?: number; fa_budget?: number; created_at?: string }
        Update: { id?: string; user_id?: string | null; name?: string; team_code?: string; manager_email?: string | null; draft_cap?: number; fa_budget?: number }
        Relationships: []
      }
      players: {
        Row: { id: string; name: string; position: string; nfl_team: string; created_at: string }
        Insert: { id?: string; name: string; position: string; nfl_team: string; created_at?: string }
        Update: { id?: string; name?: string; position?: string; nfl_team?: string }
        Relationships: []
      }
      contracts: {
        Row: { id: string; player_id: string; team_id: string; start_year: number; length: number; salary_by_year: number[]; origin: string; status: string; extension_eligible: boolean; extended_from_contract_id: string | null; created_at: string }
        Insert: { id?: string; player_id: string; team_id: string; start_year: number; length: number; salary_by_year: number[]; origin: string; status?: string; extension_eligible?: boolean; extended_from_contract_id?: string | null; created_at?: string }
        Update: { id?: string; player_id?: string; team_id?: string; start_year?: number; length?: number; salary_by_year?: number[]; origin?: string; status?: string; extension_eligible?: boolean; extended_from_contract_id?: string | null }
        Relationships: []
      }
      transaction_history: {
        Row: { id: string; player_name: string; nfl_team: string; position: string; transaction_type: string; fantasy_team: string; bid: number | null; transaction_date: string; week: number; created_at: string }
        Insert: { id?: string; player_name: string; nfl_team: string; position: string; transaction_type: string; fantasy_team: string; bid?: number | null; transaction_date: string; week: number; created_at?: string }
        Update: { id?: string; player_name?: string; nfl_team?: string; position?: string; transaction_type?: string; fantasy_team?: string; bid?: number | null; transaction_date?: string; week?: number }
        Relationships: []
      }
      cut_penalties: {
        Row: { id: string; contract_id: string; team_id: string; year_applied: number; amount: number; created_at: string }
        Insert: { id?: string; contract_id: string; team_id: string; year_applied: number; amount: number; created_at?: string }
        Update: { id?: string; contract_id?: string; team_id?: string; year_applied?: number; amount?: number }
        Relationships: []
      }
      team_history: {
        Row: { id: string; player_id: string; team_id: string; year_start: number; year_end: number | null; created_at: string }
        Insert: { id?: string; player_id: string; team_id: string; year_start: number; year_end?: number | null; created_at?: string }
        Update: { id?: string; player_id?: string; team_id?: string; year_start?: number; year_end?: number | null }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      current_user_role: { Args: Record<never, never>; Returns: string }
      current_user_team_id: { Args: Record<never, never>; Returns: string }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
