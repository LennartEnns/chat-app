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
          id: string
          type: Database["public"]["Enums"]["chatroom_type"]
        }
        Insert: {
          id?: string
          type: Database["public"]["Enums"]["chatroom_type"]
        }
        Update: {
          id?: string
          type?: Database["public"]["Enums"]["chatroom_type"]
        }
        Relationships: []
      }
      direct_chatrooms: {
        Row: {
          chatroom_id: string
          user1_id: string | null
          user2_accepted: boolean | null
          user2_id: string | null
        }
        Insert: {
          chatroom_id: string
          user1_id?: string | null
          user2_accepted?: boolean | null
          user2_id?: string | null
        }
        Update: {
          chatroom_id?: string
          user1_id?: string | null
          user2_accepted?: boolean | null
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
      user_to_group: {
        Row: {
          chatroom_id: string
          role: Database["public"]["Enums"]["chatroom_role"]
          user_id: string
        }
        Insert: {
          chatroom_id: string
          role: Database["public"]["Enums"]["chatroom_role"]
          user_id: string
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
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_filename_as_uuid: {
        Args: { filename_with_extension: string }
        Returns: string
      }
      get_role_in_chatroom: {
        Args: { uid: string; cid: string }
        Returns: Database["public"]["Enums"]["chatroom_role"]
      }
      get_role_in_invitation: {
        Args: { uid: string; cid: string }
        Returns: Database["public"]["Enums"]["chatroom_role"]
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

