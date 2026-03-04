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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      factories: {
        Row: {
          capacity: number | null
          certifications: string[] | null
          contact_person: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          specialties: string[] | null
          status: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          certifications?: string[] | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          specialties?: string[] | null
          status?: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          certifications?: string[] | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          specialties?: string[] | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          created_date: string
          delivery_date: string | null
          factory_id: string | null
          id: string
          notes: string | null
          project_id: string
          quantity: number
          reference: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_value: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_date?: string
          delivery_date?: string | null
          factory_id?: string | null
          id?: string
          notes?: string | null
          project_id: string
          quantity: number
          reference?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_value?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_date?: string
          delivery_date?: string | null
          factory_id?: string | null
          id?: string
          notes?: string | null
          project_id?: string
          quantity?: number
          reference?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "factories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_users: {
        Row: {
          email: string
          expires_at: string
          id: string
          invited_at: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          email: string
          expires_at?: string
          id?: string
          invited_at?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          email?: string
          expires_at?: string
          id?: string
          invited_at?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      product_progress: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          progress: number | null
          project_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          progress?: number | null
          project_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          progress?: number | null
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_progress_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "project_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_progress_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          compact_view: boolean | null
          company: string | null
          created_at: string
          currency: string | null
          dark_mode: boolean | null
          email: string
          full_name: string | null
          id: string
          language: string | null
          login_alerts_enabled: boolean | null
          notifications_email: boolean | null
          notifications_orders: boolean | null
          notifications_projects: boolean | null
          notifications_quality: boolean | null
          phone: string | null
          timezone: string | null
          two_factor_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          compact_view?: boolean | null
          company?: string | null
          created_at?: string
          currency?: string | null
          dark_mode?: boolean | null
          email: string
          full_name?: string | null
          id: string
          language?: string | null
          login_alerts_enabled?: boolean | null
          notifications_email?: boolean | null
          notifications_orders?: boolean | null
          notifications_projects?: boolean | null
          notifications_quality?: boolean | null
          phone?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          compact_view?: boolean | null
          company?: string | null
          created_at?: string
          currency?: string | null
          dark_mode?: boolean | null
          email?: string
          full_name?: string | null
          id?: string
          language?: string | null
          login_alerts_enabled?: boolean | null
          notifications_email?: boolean | null
          notifications_orders?: boolean | null
          notifications_projects?: boolean | null
          notifications_quality?: boolean | null
          phone?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      project_attachments: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          project_id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          project_id: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          project_id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_attachments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_products: {
        Row: {
          created_at: string
          custom_type: string | null
          garment_type: string
          id: string
          project_id: string
          quantity: number
          reference: string | null
        }
        Insert: {
          created_at?: string
          custom_type?: string | null
          garment_type: string
          id?: string
          project_id: string
          quantity: number
          reference?: string | null
        }
        Update: {
          created_at?: string
          custom_type?: string | null
          garment_type?: string
          id?: string
          project_id?: string
          quantity?: number
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_products_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_steps: {
        Row: {
          actual_duration_days: number | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          estimated_duration_days: number | null
          id: string
          name: string
          order_index: number
          product_id: string | null
          project_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["production_step_status"]
          updated_at: string
        }
        Insert: {
          actual_duration_days?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          estimated_duration_days?: number | null
          id?: string
          name: string
          order_index?: number
          product_id?: string | null
          project_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["production_step_status"]
          updated_at?: string
        }
        Update: {
          actual_duration_days?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          estimated_duration_days?: number | null
          id?: string
          name?: string
          order_index?: number
          product_id?: string | null
          project_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["production_step_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_steps_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_steps_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "project_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_steps_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_team: {
        Row: {
          assigned_at: string
          id: string
          profile_id: string
          project_id: string
          role: string | null
        }
        Insert: {
          assigned_at?: string
          id?: string
          profile_id: string
          project_id: string
          role?: string | null
        }
        Update: {
          assigned_at?: string
          id?: string
          profile_id?: string
          project_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_team_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_team_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          end_date: string | null
          estimated_cost: number | null
          factory_id: string | null
          id: string
          name: string
          priority: Database["public"]["Enums"]["project_priority"]
          progress: number
          quantity: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          type: Database["public"]["Enums"]["project_type"]
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          end_date?: string | null
          estimated_cost?: number | null
          factory_id?: string | null
          id?: string
          name: string
          priority?: Database["public"]["Enums"]["project_priority"]
          progress?: number
          quantity?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          type?: Database["public"]["Enums"]["project_type"]
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          end_date?: string | null
          estimated_cost?: number | null
          factory_id?: string | null
          id?: string
          name?: string
          priority?: Database["public"]["Enums"]["project_priority"]
          progress?: number
          quantity?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          type?: Database["public"]["Enums"]["project_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "factories"
            referencedColumns: ["id"]
          },
        ]
      }
      samples: {
        Row: {
          color: string | null
          created_at: string
          created_date: string
          factory_id: string | null
          id: string
          image_url: string | null
          material: string | null
          name: string
          notes: string | null
          project_id: string | null
          size: string | null
          status: Database["public"]["Enums"]["sample_status"]
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_date?: string
          factory_id?: string | null
          id?: string
          image_url?: string | null
          material?: string | null
          name: string
          notes?: string | null
          project_id?: string | null
          size?: string | null
          status?: Database["public"]["Enums"]["sample_status"]
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_date?: string
          factory_id?: string | null
          id?: string
          image_url?: string | null
          material?: string | null
          name?: string
          notes?: string | null
          project_id?: string | null
          size?: string | null
          status?: Database["public"]["Enums"]["sample_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "samples_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "factories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "samples_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
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
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
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
      order_status:
        | "pending"
        | "in_production"
        | "quality_check"
        | "shipped"
        | "delivered"
        | "cancelled"
      production_step_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "blocked"
        | "cancelled"
      project_priority: "low" | "medium" | "high" | "urgent"
      project_status:
        | "draft"
        | "planning"
        | "in_progress"
        | "review"
        | "delayed"
        | "on_hold"
        | "completed"
        | "cancelled"
      project_type: "BULK" | "SAMPLE"
      sample_status:
        | "requested"
        | "in_development"
        | "review"
        | "approved"
        | "rejected"
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
      order_status: [
        "pending",
        "in_production",
        "quality_check",
        "shipped",
        "delivered",
        "cancelled",
      ],
      production_step_status: [
        "pending",
        "in_progress",
        "completed",
        "blocked",
        "cancelled",
      ],
      project_priority: ["low", "medium", "high", "urgent"],
      project_status: [
        "draft",
        "planning",
        "in_progress",
        "review",
        "delayed",
        "on_hold",
        "completed",
        "cancelled",
      ],
      project_type: ["BULK", "SAMPLE"],
      sample_status: [
        "requested",
        "in_development",
        "review",
        "approved",
        "rejected",
      ],
    },
  },
} as const
