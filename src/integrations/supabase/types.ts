export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          admin_id: string
          created_at: string | null
          id: string
          password_hash: string
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          id?: string
          password_hash: string
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          id?: string
          password_hash?: string
        }
        Relationships: []
      }
      home_slides: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          order_index: number
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          order_index?: number
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          order_index?: number
          title?: string
        }
        Relationships: []
      }
      match_sets: {
        Row: {
          created_at: string | null
          id: string
          match_id: string | null
          set_number: number
          team1_men1_score: number | null
          team1_men2_score: number | null
          team1_women1_score: number | null
          team1_women2_score: number | null
          team2_men1_score: number | null
          team2_men2_score: number | null
          team2_women1_score: number | null
          team2_women2_score: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id?: string | null
          set_number: number
          team1_men1_score?: number | null
          team1_men2_score?: number | null
          team1_women1_score?: number | null
          team1_women2_score?: number | null
          team2_men1_score?: number | null
          team2_men2_score?: number | null
          team2_women1_score?: number | null
          team2_women2_score?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string | null
          set_number?: number
          team1_men1_score?: number | null
          team1_men2_score?: number | null
          team1_women1_score?: number | null
          team1_women2_score?: number | null
          team2_men1_score?: number | null
          team2_men2_score?: number | null
          team2_women1_score?: number | null
          team2_women2_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_sets_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          date: string
          day: string
          first_match: boolean | null
          group_name: string
          id: string
          match_number: number
          match_time: string | null
          status: string | null
          team1_leader: string
          team1_name: string
          team1_player1_department: string | null
          team1_player1_name: string
          team1_player1_photo: string | null
          team1_player1_score: number | null
          team1_player1_scores: Json | null
          team1_player1_unit: string | null
          team1_player2_department: string | null
          team1_player2_name: string
          team1_player2_photo: string | null
          team1_player2_score: number | null
          team1_player2_scores: Json | null
          team1_player2_unit: string | null
          team1_score: number | null
          team2_leader: string
          team2_name: string
          team2_player1_department: string | null
          team2_player1_name: string
          team2_player1_photo: string | null
          team2_player1_score: number | null
          team2_player1_scores: Json | null
          team2_player1_unit: string | null
          team2_player2_department: string | null
          team2_player2_name: string
          team2_player2_photo: string | null
          team2_player2_score: number | null
          team2_player2_scores: Json | null
          team2_player2_unit: string | null
          team2_score: number | null
          updated_at: string | null
          venue: string
          winner: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          day: string
          first_match?: boolean | null
          group_name: string
          id?: string
          match_number?: never
          match_time?: string | null
          status?: string | null
          team1_leader: string
          team1_name: string
          team1_player1_department?: string | null
          team1_player1_name: string
          team1_player1_photo?: string | null
          team1_player1_score?: number | null
          team1_player1_scores?: Json | null
          team1_player1_unit?: string | null
          team1_player2_department?: string | null
          team1_player2_name: string
          team1_player2_photo?: string | null
          team1_player2_score?: number | null
          team1_player2_scores?: Json | null
          team1_player2_unit?: string | null
          team1_score?: number | null
          team2_leader: string
          team2_name: string
          team2_player1_department?: string | null
          team2_player1_name: string
          team2_player1_photo?: string | null
          team2_player1_score?: number | null
          team2_player1_scores?: Json | null
          team2_player1_unit?: string | null
          team2_player2_department?: string | null
          team2_player2_name: string
          team2_player2_photo?: string | null
          team2_player2_score?: number | null
          team2_player2_scores?: Json | null
          team2_player2_unit?: string | null
          team2_score?: number | null
          updated_at?: string | null
          venue: string
          winner?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          day?: string
          first_match?: boolean | null
          group_name?: string
          id?: string
          match_number?: never
          match_time?: string | null
          status?: string | null
          team1_leader?: string
          team1_name?: string
          team1_player1_department?: string | null
          team1_player1_name?: string
          team1_player1_photo?: string | null
          team1_player1_score?: number | null
          team1_player1_scores?: Json | null
          team1_player1_unit?: string | null
          team1_player2_department?: string | null
          team1_player2_name?: string
          team1_player2_photo?: string | null
          team1_player2_score?: number | null
          team1_player2_scores?: Json | null
          team1_player2_unit?: string | null
          team1_score?: number | null
          team2_leader?: string
          team2_name?: string
          team2_player1_department?: string | null
          team2_player1_name?: string
          team2_player1_photo?: string | null
          team2_player1_score?: number | null
          team2_player1_scores?: Json | null
          team2_player1_unit?: string | null
          team2_player2_department?: string | null
          team2_player2_name?: string
          team2_player2_photo?: string | null
          team2_player2_score?: number | null
          team2_player2_scores?: Json | null
          team2_player2_unit?: string | null
          team2_score?: number | null
          updated_at?: string | null
          venue?: string
          winner?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          created_at: string | null
          department: string | null
          id: string
          matches_lost: number | null
          matches_played: number | null
          matches_won: number | null
          name: string
          photo: string | null
          total_score: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          id?: string
          matches_lost?: number | null
          matches_played?: number | null
          matches_won?: number | null
          name: string
          photo?: string | null
          total_score?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          id?: string
          matches_lost?: number | null
          matches_played?: number | null
          matches_won?: number | null
          name?: string
          photo?: string | null
          total_score?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
