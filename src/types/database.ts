export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          taste_profile_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          taste_profile_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          title: string | null;
          description: string | null;
          thumbnail_url: string | null;
          platform: string | null;
          content_type: string | null;
          estimated_duration: number | null;
          rating: number;
          comment: string | null;
          category: string | null;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          url: string;
          title?: string | null;
          description?: string | null;
          thumbnail_url?: string | null;
          platform?: string | null;
          content_type?: string | null;
          estimated_duration?: number | null;
          rating: number;
          comment?: string | null;
          category?: string | null;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["posts"]["Insert"]>;
      };
      likes: {
        Row: { id: string; user_id: string; post_id: string; created_at: string };
        Insert: { id?: string; user_id: string; post_id: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["likes"]["Insert"]>;
      };
      bookmarks: {
        Row: { id: string; user_id: string; post_id: string; created_at: string };
        Insert: { id?: string; user_id: string; post_id: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["bookmarks"]["Insert"]>;
      };
      taste_dna: {
        Row: {
          user_id: string;
          knowledge: number;
          entertainment: number;
          practical: number;
          emotional: number;
          trend: number;
          longform: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          knowledge?: number;
          entertainment?: number;
          practical?: number;
          emotional?: number;
          trend?: number;
          longform?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["taste_dna"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
