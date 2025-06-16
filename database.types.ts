export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      chatrooms: {
        Row: {
          created_at: string
          id: string
          type: Database["public"]["Enums"]["chatroom_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          type: Database["public"]["Enums"]["chatroom_type"]
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["public"]["Enums"]["chatroom_type"]
        }
        Relationships: []
      }
      direct_chatrooms: {
        Row: {
          chatroom_id: string
          user1_id: string | null
          user2_id: string | null
        }
        Insert: {
          chatroom_id?: string
          user1_id?: string | null
          user2_id?: string | null
        }
        Update: {
          chatroom_id?: string
          user1_id?: string | null
          user2_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "direct_chatrooms_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: true
            referencedRelation: "chatrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_chatrooms_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: true
            referencedRelation: "chatrooms_preview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_chatrooms_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: true
            referencedRelation: "chatrooms_with_last_activity"
            referencedColumns: ["id"]
          },
        ]
      }
      group_chatrooms: {
        Row: {
          chatroom_id: string
          description: string | null
          name: string
        }
        Insert: {
          chatroom_id?: string
          description?: string | null
          name: string
        }
        Update: {
          chatroom_id?: string
          description?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_chatrooms_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: true
            referencedRelation: "chatrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_chatrooms_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: true
            referencedRelation: "chatrooms_preview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_chatrooms_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: true
            referencedRelation: "chatrooms_with_last_activity"
            referencedColumns: ["id"]
          },
        ]
      }
      group_invitations: {
        Row: {
          as_role: Database["public"]["Enums"]["chatroom_role"]
          chatroom_id: string
          created_at: string
          id: string
          invitee_id: string
          invitor_id: string
        }
        Insert: {
          as_role: Database["public"]["Enums"]["chatroom_role"]
          chatroom_id: string
          created_at?: string
          id?: string
          invitee_id: string
          invitor_id?: string
        }
        Update: {
          as_role?: Database["public"]["Enums"]["chatroom_role"]
          chatroom_id?: string
          created_at?: string
          id?: string
          invitee_id?: string
          invitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_invitations_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "group_chatrooms"
            referencedColumns: ["chatroom_id"]
          },
          {
            foreignKeyName: "group_invitations_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "group_chatrooms_last_activity_current_role"
            referencedColumns: ["chatroom_id"]
          },
        ]
      }
      messages: {
        Row: {
          chatroom_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          chatroom_id: string
          content: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Update: {
          chatroom_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatrooms_preview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatrooms_with_last_activity"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          description: string | null
          displayname: string | null
          user_id: string
          username: string
        }
        Insert: {
          description?: string | null
          displayname?: string | null
          user_id: string
          username: string
        }
        Update: {
          description?: string | null
          displayname?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      user_to_abstract_chatroom: {
        Row: {
          chatroom_id: string
          last_inside: string
          user_id: string
        }
        Insert: {
          chatroom_id: string
          last_inside?: string
          user_id?: string
        }
        Update: {
          chatroom_id?: string
          last_inside?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_to_abstract_chatroom_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_to_abstract_chatroom_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatrooms_preview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_to_abstract_chatroom_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatrooms_with_last_activity"
            referencedColumns: ["id"]
          },
        ]
      }
      user_to_group: {
        Row: {
          chatroom_id: string
          role: Database["public"]["Enums"]["chatroom_role"]
          user_id: string
        }
        Insert: {
          chatroom_id: string
          role: Database["public"]["Enums"]["chatroom_role"]
          user_id?: string
        }
        Update: {
          chatroom_id?: string
          role?: Database["public"]["Enums"]["chatroom_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_to_group_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "group_chatrooms"
            referencedColumns: ["chatroom_id"]
          },
          {
            foreignKeyName: "user_to_group_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "group_chatrooms_last_activity_current_role"
            referencedColumns: ["chatroom_id"]
          },
        ]
      }
    }
    Views: {
      chatrooms_preview: {
        Row: {
          current_user_role: Database["public"]["Enums"]["chatroom_role"] | null
          id: string | null
          last_activity: string | null
          last_message: string | null
          name: string | null
          number_new_messages: number | null
          other_user_id: string | null
          type: Database["public"]["Enums"]["chatroom_type"] | null
        }
        Relationships: []
      }
      chatrooms_with_last_activity: {
        Row: {
          created_at: string | null
          id: string | null
          last_activity: string | null
          type: Database["public"]["Enums"]["chatroom_type"] | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          last_activity?: never
          type?: Database["public"]["Enums"]["chatroom_type"] | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          last_activity?: never
          type?: Database["public"]["Enums"]["chatroom_type"] | null
        }
        Relationships: []
      }
      group_chatroom_members: {
        Row: {
          chatroom_id: string | null
          description: string | null
          name: string | null
          role: Database["public"]["Enums"]["chatroom_role"] | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_to_group_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "group_chatrooms"
            referencedColumns: ["chatroom_id"]
          },
          {
            foreignKeyName: "user_to_group_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "group_chatrooms_last_activity_current_role"
            referencedColumns: ["chatroom_id"]
          },
        ]
      }
      group_chatrooms_last_activity_current_role: {
        Row: {
          chatroom_id: string | null
          current_user_role: Database["public"]["Enums"]["chatroom_role"] | null
          description: string | null
          last_activity: string | null
          name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_chatrooms_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: true
            referencedRelation: "chatrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_chatrooms_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: true
            referencedRelation: "chatrooms_preview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_chatrooms_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: true
            referencedRelation: "chatrooms_with_last_activity"
            referencedColumns: ["id"]
          },
        ]
      }
      group_invitations_preview: {
        Row: {
          as_role: Database["public"]["Enums"]["chatroom_role"] | null
          chatroom_id: string | null
          created_at: string | null
          group_name: string | null
          id: string | null
          invitee_id: string | null
          invitee_username: string | null
          invitor_id: string | null
          invitor_username: string | null
        }
        Insert: {
          as_role?: Database["public"]["Enums"]["chatroom_role"] | null
          chatroom_id?: string | null
          created_at?: string | null
          group_name?: never
          id?: string | null
          invitee_id?: string | null
          invitee_username?: never
          invitor_id?: string | null
          invitor_username?: never
        }
        Update: {
          as_role?: Database["public"]["Enums"]["chatroom_role"] | null
          chatroom_id?: string | null
          created_at?: string | null
          group_name?: never
          id?: string | null
          invitee_id?: string | null
          invitee_username?: never
          invitor_id?: string | null
          invitor_username?: never
        }
        Relationships: [
          {
            foreignKeyName: "group_invitations_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "group_chatrooms"
            referencedColumns: ["chatroom_id"]
          },
          {
            foreignKeyName: "group_invitations_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "group_chatrooms_last_activity_current_role"
            referencedColumns: ["chatroom_id"]
          },
        ]
      }
      messages_view: {
        Row: {
          chatroom_id: string | null
          content: string | null
          created_at: string | null
          id: string | null
          is_own: boolean | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatrooms_preview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_chatroom_id_fkey"
            columns: ["chatroom_id"]
            isOneToOne: false
            referencedRelation: "chatrooms_with_last_activity"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      leave_chatroom: {
        Args: { cid: string }
        Returns: undefined
      }
      search_users: {
        Args: {
          p_term: string
          p_excluded_ids?: string[]
          p_exclude_group_id?: string
          p_exclude_invitations_to_group?: string
        }
        Returns: {
          user_id: string
          username: string
          displayname: string
        }[]
      }
      update_last_inside_chatroom: {
        Args: { cid: string }
        Returns: undefined
      }
    }
    Enums: {
      chatroom_role: "admin" | "mod" | "member" | "viewer"
      chatroom_type: "direct" | "group"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      chatroom_role: ["admin", "mod", "member", "viewer"],
      chatroom_type: ["direct", "group"],
    },
  },
} as const

