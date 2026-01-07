import type { ProjectLink } from "./index";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          category: string;
          profile_owner: string;
          tags: string[];
          links: ProjectLink[];
          thumbnail_url: string | null;
          last_modified: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          category: string;
          profile_owner: string;
          tags?: string[];
          links?: ProjectLink[];
          thumbnail_url?: string | null;
          last_modified?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          category?: string;
          profile_owner?: string;
          tags?: string[];
          links?: ProjectLink[];
          thumbnail_url?: string | null;
          last_modified?: string;
          created_at?: string;
        };
      };
      match_history: {
        Row: {
          id: string;
          user_id: string;
          timestamp: number;
          requirements: string;
          client_name: string | null;
          recommendations: Json;
          selected_project_ids: string[];
          proposal: string | null;
          sender_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          timestamp?: number;
          requirements: string;
          client_name?: string | null;
          recommendations?: Json;
          selected_project_ids?: string[];
          proposal?: string | null;
          sender_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          timestamp?: number;
          requirements?: string;
          client_name?: string | null;
          recommendations?: Json;
          selected_project_ids?: string[];
          proposal?: string | null;
          sender_type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for database operations
export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export type MatchHistoryRow =
  Database["public"]["Tables"]["match_history"]["Row"];
export type MatchHistoryInsert =
  Database["public"]["Tables"]["match_history"]["Insert"];
export type MatchHistoryUpdate =
  Database["public"]["Tables"]["match_history"]["Update"];
