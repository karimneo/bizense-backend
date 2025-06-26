export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      campaign_daily_stats: {
        Row: {
          amount_spent: number | null
          campaign_name: string
          confirmed_leads: number | null
          created_at: string | null
          date: string
          delivered_orders: number | null
          id: string
          impressions: number | null
          leads: number | null
          platform: string
          product_name: string
          reach: number | null
          revenue: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_spent?: number | null
          campaign_name: string
          confirmed_leads?: number | null
          created_at?: string | null
          date: string
          delivered_orders?: number | null
          id?: string
          impressions?: number | null
          leads?: number | null
          platform: string
          product_name: string
          reach?: number | null
          revenue?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_spent?: number | null
          campaign_name?: string
          confirmed_leads?: number | null
          created_at?: string | null
          date?: string
          delivered_orders?: number | null
          id?: string
          impressions?: number | null
          leads?: number | null
          platform?: string
          product_name?: string
          reach?: number | null
          revenue?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      campaign_reports: {
        Row: {
          amount_spent: number | null
          campaign_date: string | null
          campaign_name: string | null
          clicks: number | null
          confirmed_leads: number | null
          conversions: number | null
          delivered_orders: number | null
          file_name: string
          id: number
          impressions: number | null
          leads: number | null
          platform: string
          product_extracted: string | null
          product_name: string | null
          raw_data: Json | null
          reach: number | null
          revenue: number | null
          upload_date: string | null
          user_id: string | null
        }
        Insert: {
          amount_spent?: number | null
          campaign_date?: string | null
          campaign_name?: string | null
          clicks?: number | null
          confirmed_leads?: number | null
          conversions?: number | null
          delivered_orders?: number | null
          file_name: string
          id?: number
          impressions?: number | null
          leads?: number | null
          platform: string
          product_extracted?: string | null
          product_name?: string | null
          raw_data?: Json | null
          reach?: number | null
          revenue?: number | null
          upload_date?: string | null
          user_id?: string | null
        }
        Update: {
          amount_spent?: number | null
          campaign_date?: string | null
          campaign_name?: string | null
          clicks?: number | null
          confirmed_leads?: number | null
          conversions?: number | null
          delivered_orders?: number | null
          file_name?: string
          id?: number
          impressions?: number | null
          leads?: number | null
          platform?: string
          product_extracted?: string | null
          product_name?: string | null
          raw_data?: Json | null
          reach?: number | null
          revenue?: number | null
          upload_date?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      product_metrics: {
        Row: {
          cod_fee_percentage: number | null
          created_at: string | null
          id: number
          manual_confirmed_leads: number | null
          manual_leads: number | null
          product_id: number | null
          selling_price: number | null
          service_fee_per_delivery: number | null
          service_fee_per_lead: number | null
          stock_purchased: number | null
          unit_cost: number | null
          units_delivered: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cod_fee_percentage?: number | null
          created_at?: string | null
          id?: number
          manual_confirmed_leads?: number | null
          manual_leads?: number | null
          product_id?: number | null
          selling_price?: number | null
          service_fee_per_delivery?: number | null
          service_fee_per_lead?: number | null
          stock_purchased?: number | null
          unit_cost?: number | null
          units_delivered?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cod_fee_percentage?: number | null
          created_at?: string | null
          id?: number
          manual_confirmed_leads?: number | null
          manual_leads?: number | null
          product_id?: number | null
          selling_price?: number | null
          service_fee_per_delivery?: number | null
          service_fee_per_lead?: number | null
          stock_purchased?: number | null
          unit_cost?: number | null
          units_delivered?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_metrics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          id: number
          product_name: string
          revenue_per_conversion: number | null
          selling_price: number | null
          stock_purchased: number | null
          total_confirmed_leads: number | null
          total_leads: number | null
          unit_cost: number | null
          units_delivered: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          product_name: string
          revenue_per_conversion?: number | null
          selling_price?: number | null
          stock_purchased?: number | null
          total_confirmed_leads?: number | null
          total_leads?: number | null
          unit_cost?: number | null
          units_delivered?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          product_name?: string
          revenue_per_conversion?: number | null
          selling_price?: number | null
          stock_purchased?: number | null
          total_confirmed_leads?: number | null
          total_leads?: number | null
          unit_cost?: number | null
          units_delivered?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      upload_history: {
        Row: {
          file_name: string
          id: number
          platform: string
          rows_processed: number | null
          status: string | null
          upload_date: string | null
          user_id: string | null
        }
        Insert: {
          file_name: string
          id?: number
          platform: string
          rows_processed?: number | null
          status?: string | null
          upload_date?: string | null
          user_id?: string | null
        }
        Update: {
          file_name?: string
          id?: number
          platform?: string
          rows_processed?: number | null
          status?: string | null
          upload_date?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_cod_fees: {
        Args: { cash_collected: number; fee_percentage?: number }
        Returns: number
      }
      calculate_service_fees: {
        Args: {
          delivered_orders: number
          total_leads: number
          fee_per_delivery?: number
          fee_per_lead?: number
        }
        Returns: number
      }
      extract_product_from_campaign: {
        Args: { campaign_name: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
