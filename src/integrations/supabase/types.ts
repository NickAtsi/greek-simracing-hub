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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievement_badges: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          requirement: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name: string
          requirement?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          requirement?: string | null
        }
        Relationships: []
      }
      article_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      article_comments: {
        Row: {
          article_id: string
          author_id: string
          content: string
          created_at: string
          id: string
        }
        Insert: {
          article_id: string
          author_id: string
          content: string
          created_at?: string
          id?: string
        }
        Update: {
          article_id?: string
          author_id?: string
          content?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_likes: {
        Row: {
          article_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string
          category_id: string | null
          content: string
          cover_url: string | null
          created_at: string
          id: string
          pinned: boolean | null
          published: boolean | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          author_id: string
          category_id?: string | null
          content: string
          cover_url?: string | null
          created_at?: string
          id?: string
          pinned?: boolean | null
          published?: boolean | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          author_id?: string
          category_id?: string | null
          content?: string
          cover_url?: string | null
          created_at?: string
          id?: string
          pinned?: boolean | null
          published?: boolean | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "article_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      championships: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          participants: number
          races_completed: number
          races_total: number
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          participants?: number
          races_completed?: number
          races_total?: number
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          participants?: number
          races_completed?: number
          races_total?: number
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      driver_of_month_nominations: {
        Row: {
          created_at: string
          driver_name: string
          driver_user_id: string | null
          id: string
          month_year: string
          nominated_by: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          driver_name: string
          driver_user_id?: string | null
          id?: string
          month_year: string
          nominated_by: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          driver_name?: string
          driver_user_id?: string | null
          id?: string
          month_year?: string
          nominated_by?: string
          reason?: string | null
        }
        Relationships: []
      }
      driver_of_month_votes: {
        Row: {
          created_at: string
          id: string
          month_year: string
          nomination_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          month_year: string
          nomination_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          month_year?: string
          nomination_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_of_month_votes_nomination_id_fkey"
            columns: ["nomination_id"]
            isOneToOne: false
            referencedRelation: "driver_of_month_nominations"
            referencedColumns: ["id"]
          },
        ]
      }
      fantasy_categories: {
        Row: {
          budget_cap: number
          created_at: string
          description: string | null
          icon: string | null
          id: string
          max_drivers_per_team: number
          name: string
          slug: string
        }
        Insert: {
          budget_cap?: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          max_drivers_per_team?: number
          name: string
          slug: string
        }
        Update: {
          budget_cap?: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          max_drivers_per_team?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      fantasy_drivers: {
        Row: {
          avatar_url: string | null
          category_id: string
          created_at: string
          id: string
          name: string
          number: number | null
          points: number
          price: number
          team_name: string | null
        }
        Insert: {
          avatar_url?: string | null
          category_id: string
          created_at?: string
          id?: string
          name: string
          number?: number | null
          points?: number
          price?: number
          team_name?: string | null
        }
        Update: {
          avatar_url?: string | null
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          number?: number | null
          points?: number
          price?: number
          team_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_drivers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "fantasy_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      fantasy_team_drivers: {
        Row: {
          created_at: string
          driver_id: string
          id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          driver_id: string
          id?: string
          team_id: string
        }
        Update: {
          created_at?: string
          driver_id?: string
          id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_team_drivers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "fantasy_drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fantasy_team_drivers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "fantasy_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      fantasy_teams: {
        Row: {
          budget_remaining: number
          category_id: string
          created_at: string
          id: string
          team_name: string
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_remaining?: number
          category_id: string
          created_at?: string
          id?: string
          team_name: string
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_remaining?: number
          category_id?: string
          created_at?: string
          id?: string
          team_name?: string
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fantasy_teams_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "fantasy_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
          status: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
          status?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
          status?: string
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          thread_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          thread_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads: {
        Row: {
          author_id: string
          category_id: string
          content: string
          created_at: string
          id: string
          locked: boolean | null
          pinned: boolean | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          author_id: string
          category_id: string
          content: string
          created_at?: string
          id?: string
          locked?: boolean | null
          pinned?: boolean | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          author_id?: string
          category_id?: string
          content?: string
          created_at?: string
          id?: string
          locked?: boolean | null
          pinned?: boolean | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_threads_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_reports: {
        Row: {
          admin_notes: string | null
          championship_id: string | null
          created_at: string
          description: string
          drivers_involved: string[] | null
          id: string
          race_name: string | null
          reporter_id: string
          status: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          admin_notes?: string | null
          championship_id?: string | null
          created_at?: string
          description: string
          drivers_involved?: string[] | null
          id?: string
          race_name?: string | null
          reporter_id: string
          status?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          admin_notes?: string | null
          championship_id?: string | null
          created_at?: string
          description?: string
          drivers_involved?: string[] | null
          id?: string
          race_name?: string | null
          reporter_id?: string
          status?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_reports_championship_id_fkey"
            columns: ["championship_id"]
            isOneToOne: false
            referencedRelation: "championships"
            referencedColumns: ["id"]
          },
        ]
      }
      lap_times: {
        Row: {
          car_name: string
          conditions: string | null
          created_at: string
          id: string
          lap_time_ms: number
          screenshot_url: string | null
          sim_name: string
          track_name: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          car_name: string
          conditions?: string | null
          created_at?: string
          id?: string
          lap_time_ms: number
          screenshot_url?: string | null
          sim_name: string
          track_name: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          car_name?: string
          conditions?: string | null
          created_at?: string
          id?: string
          lap_time_ms?: number
          screenshot_url?: string | null
          sim_name?: string
          track_name?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          from_user_id: string | null
          id: string
          link: string | null
          message: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          from_user_id?: string | null
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          from_user_id?: string | null
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      podcast_episodes: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration: string | null
          episode_number: number | null
          host: string | null
          id: string
          published: boolean | null
          spotify_id: string | null
          spotify_url: string | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          episode_number?: number | null
          host?: string | null
          id?: string
          published?: boolean | null
          spotify_id?: string | null
          spotify_url?: string | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          episode_number?: number | null
          host?: string | null
          id?: string
          published?: boolean | null
          spotify_id?: string | null
          spotify_url?: string | null
          title?: string
        }
        Relationships: []
      }
      prediction_entries: {
        Row: {
          created_at: string
          event_id: string
          id: string
          points_earned: number | null
          predictions: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          points_earned?: number | null
          predictions: Json
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          points_earned?: number | null
          predictions?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_entries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "prediction_events"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_events: {
        Row: {
          championship_id: string | null
          created_at: string
          deadline: string
          description: string | null
          event_date: string | null
          id: string
          results: Json | null
          status: string
          title: string
        }
        Insert: {
          championship_id?: string | null
          created_at?: string
          deadline: string
          description?: string | null
          event_date?: string | null
          id?: string
          results?: Json | null
          status?: string
          title: string
        }
        Update: {
          championship_id?: string | null
          created_at?: string
          deadline?: string
          description?: string | null
          event_date?: string | null
          id?: string
          results?: Json | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_events_championship_id_fkey"
            columns: ["championship_id"]
            isOneToOne: false
            referencedRelation: "championships"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          profile_user_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          profile_user_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          profile_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_likes: {
        Row: {
          created_at: string
          id: string
          profile_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          discord_username: string | null
          display_name: string | null
          favorite_sim: string | null
          favorite_track: string | null
          id: string
          is_approved: boolean
          last_seen: string | null
          location: string | null
          nationality: string | null
          setup_type: string | null
          show_online: boolean
          social_links: Json | null
          updated_at: string
          user_id: string
          username: string | null
          website_url: string | null
          years_simracing: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          discord_username?: string | null
          display_name?: string | null
          favorite_sim?: string | null
          favorite_track?: string | null
          id?: string
          is_approved?: boolean
          last_seen?: string | null
          location?: string | null
          nationality?: string | null
          setup_type?: string | null
          show_online?: boolean
          social_links?: Json | null
          updated_at?: string
          user_id: string
          username?: string | null
          website_url?: string | null
          years_simracing?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          discord_username?: string | null
          display_name?: string | null
          favorite_sim?: string | null
          favorite_track?: string | null
          id?: string
          is_approved?: boolean
          last_seen?: string | null
          location?: string | null
          nationality?: string | null
          setup_type?: string | null
          show_online?: boolean
          social_links?: Json | null
          updated_at?: string
          user_id?: string
          username?: string | null
          website_url?: string | null
          years_simracing?: string | null
        }
        Relationships: []
      }
      reaction_scores: {
        Row: {
          created_at: string
          id: string
          reaction_time: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_time: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_time?: number
          user_id?: string
        }
        Relationships: []
      }
      shop_order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          size: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity?: number
          size?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_orders: {
        Row: {
          address: string
          city: string
          created_at: string
          email: string
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          postal_code: string
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          postal_code: string
          status?: string
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shop_products: {
        Row: {
          active: boolean
          badge: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          original_price: number | null
          price: number
          sizes: string[] | null
          stock: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          badge?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          original_price?: number | null
          price?: number
          sizes?: string[] | null
          stock?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          badge?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          original_price?: number | null
          price?: number
          sizes?: string[] | null
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_admin: boolean
          sender_id: string
          ticket_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_admin?: boolean
          sender_id: string
          ticket_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_admin?: boolean
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          tag: string | null
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          tag?: string | null
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          tag?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          awarded_at: string
          awarded_by: string | null
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          awarded_by?: string | null
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          awarded_by?: string | null
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "achievement_badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
