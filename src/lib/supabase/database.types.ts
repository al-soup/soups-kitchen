export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      action: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          level: number | null;
          name: string | null;
          type: number | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          level?: number | null;
          name?: string | null;
          type?: number | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          level?: number | null;
          name?: string | null;
          type?: number | null;
        };
        Relationships: [];
      };
      habit: {
        Row: {
          action_id: number;
          completed_at: string | null;
          created_at: string;
          id: number;
          note: string | null;
        };
        Insert: {
          action_id: number;
          completed_at?: string | null;
          created_at?: string;
          id?: number;
          note?: string | null;
        };
        Update: {
          action_id?: number;
          completed_at?: string | null;
          created_at?: string;
          id?: number;
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "habit_action_id_fkey";
            columns: ["action_id"];
            isOneToOne: false;
            referencedRelation: "action";
            referencedColumns: ["id"];
          },
        ];
      };
      knowledge: {
        Row: {
          created_at: string | null;
          detail: string | null;
          id: string;
          question: string;
          search_vector: unknown;
          summary: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          detail?: string | null;
          id?: string;
          question: string;
          search_vector?: unknown;
          summary: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          detail?: string | null;
          id?: string;
          question?: string;
          search_vector?: unknown;
          summary?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      knowledge_tags: {
        Row: {
          knowledge_id: string;
          tag_id: string;
        };
        Insert: {
          knowledge_id: string;
          tag_id: string;
        };
        Update: {
          knowledge_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "knowledge_tags_knowledge_id_fkey";
            columns: ["knowledge_id"];
            isOneToOne: false;
            referencedRelation: "knowledge";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "knowledge_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      resources: {
        Row: {
          bucket: string;
          filename: string | null;
          id: string;
          knowledge_id: string | null;
          label: string | null;
          mime_type: string | null;
          storage_path: string;
        };
        Insert: {
          bucket: string;
          filename?: string | null;
          id?: string;
          knowledge_id?: string | null;
          label?: string | null;
          mime_type?: string | null;
          storage_path: string;
        };
        Update: {
          bucket?: string;
          filename?: string | null;
          id?: string;
          knowledge_id?: string | null;
          label?: string | null;
          mime_type?: string | null;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resources_knowledge_id_fkey";
            columns: ["knowledge_id"];
            isOneToOne: false;
            referencedRelation: "knowledge";
            referencedColumns: ["id"];
          },
        ];
      };
      strava_rides: {
        Row: {
          average_speed_kmh: number;
          created_at: string | null;
          distance_km: number;
          elevation_gain_m: number;
          id: number;
          raw_response: Json;
          ride_date: string;
          strava_activity_id: number;
        };
        Insert: {
          average_speed_kmh: number;
          created_at?: string | null;
          distance_km: number;
          elevation_gain_m: number;
          id?: number;
          raw_response: Json;
          ride_date: string;
          strava_activity_id: number;
        };
        Update: {
          average_speed_kmh?: number;
          created_at?: string | null;
          distance_km?: number;
          elevation_gain_m?: number;
          id?: number;
          raw_response?: Json;
          ride_date?: string;
          strava_activity_id?: number;
        };
        Relationships: [];
      };
      strava_tokens: {
        Row: {
          access_token: string;
          athlete_id: number;
          created_at: string | null;
          expires_at: number;
          id: number;
          refresh_token: string;
          updated_at: string | null;
        };
        Insert: {
          access_token: string;
          athlete_id: number;
          created_at?: string | null;
          expires_at: number;
          id?: never;
          refresh_token: string;
          updated_at?: string | null;
        };
        Update: {
          access_token?: string;
          athlete_id?: number;
          created_at?: string | null;
          expires_at?: number;
          id?: never;
          refresh_token?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          type: Database["public"]["Enums"]["tag_type"];
        };
        Insert: {
          id?: string;
          name: string;
          type?: Database["public"]["Enums"]["tag_type"];
        };
        Update: {
          id?: string;
          name?: string;
          type?: Database["public"]["Enums"]["tag_type"];
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string | null;
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          table_name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          table_name: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          table_name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      custom_access_token_hook: { Args: { event: Json }; Returns: Json };
      get_daily_habit_scores: {
        Args: { action_type: number; start_date?: string };
        Returns: {
          completed_date: string;
          habit_ids: number[];
          total_score: number;
        }[];
      };
      get_user_role: {
        Args: { target_table: string };
        Returns: Database["public"]["Enums"]["user_role"];
      };
      is_global_admin: { Args: never; Returns: boolean };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
    };
    Enums: {
      tag_type: "topic" | "concept";
      user_role: "admin" | "manager" | "viewer";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      tag_type: ["topic", "concept"],
      user_role: ["admin", "manager", "viewer"],
    },
  },
} as const;
