export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          name: string
          avatar_url: string | null
          cover_url: string | null
          bio: string | null
          is_creator: boolean
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          name: string
          avatar_url?: string | null
          cover_url?: string | null
          bio?: string | null
          is_creator?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          name?: string
          avatar_url?: string | null
          cover_url?: string | null
          bio?: string | null
          is_creator?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscription_tiers: {
        Row: {
          id: string
          creator_id: string
          name: string
          price: number
          description: string | null
          benefits: string[] | null
          tier_level: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          name: string
          price: number
          description?: string | null
          benefits?: string[] | null
          tier_level?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          name?: string
          price?: number
          description?: string | null
          benefits?: string[] | null
          tier_level?: number
          is_active?: boolean
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          subscriber_id: string
          creator_id: string
          tier_id: string | null
          status: 'active' | 'cancelled' | 'expired'
          started_at: string
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subscriber_id: string
          creator_id: string
          tier_id?: string | null
          status?: 'active' | 'cancelled' | 'expired'
          started_at?: string
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          subscriber_id?: string
          creator_id?: string
          tier_id?: string | null
          status?: 'active' | 'cancelled' | 'expired'
          started_at?: string
          expires_at?: string | null
          created_at?: string
        }
      }
      feeds: {
        Row: {
          id: string
          creator_id: string
          content_text: string | null
          media_urls: string[] | null
          media_type: 'image' | 'video' | null
          is_premium: boolean
          price: number | null
          required_tier_level: number | null
          like_count: number
          comment_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          content_text?: string | null
          media_urls?: string[] | null
          media_type?: 'image' | 'video' | null
          is_premium?: boolean
          price?: number | null
          required_tier_level?: number | null
          like_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          content_text?: string | null
          media_urls?: string[] | null
          media_type?: 'image' | 'video' | null
          is_premium?: boolean
          price?: number | null
          required_tier_level?: number | null
          like_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      feed_likes: {
        Row: {
          id: string
          feed_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          feed_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          feed_id?: string
          user_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          feed_id: string
          user_id: string
          content: string
          parent_id: string | null
          like_count: number
          created_at: string
        }
        Insert: {
          id?: string
          feed_id: string
          user_id: string
          content: string
          parent_id?: string | null
          like_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          feed_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
          like_count?: number
          created_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          feed_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          feed_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          feed_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'like' | 'comment' | 'subscription' | 'message' | 'tip' | 'new_post'
          title: string
          body: string | null
          data: Json | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'like' | 'comment' | 'subscription' | 'message' | 'tip' | 'new_post'
          title: string
          body?: string | null
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'like' | 'comment' | 'subscription' | 'message' | 'tip' | 'new_post'
          title?: string
          body?: string | null
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          creator_id: string
          amount: number
          type: 'subscription' | 'tip' | 'purchase'
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          feed_id: string | null
          subscription_id: string | null
          payment_method: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          creator_id: string
          amount: number
          type: 'subscription' | 'tip' | 'purchase'
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          feed_id?: string | null
          subscription_id?: string | null
          payment_method?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          creator_id?: string
          amount?: number
          type?: 'subscription' | 'tip' | 'purchase'
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          feed_id?: string | null
          subscription_id?: string | null
          payment_method?: string | null
          created_at?: string
        }
      }
      payment_cards: {
        Row: {
          id: string
          user_id: string
          last4: string
          brand: string
          exp_month: number
          exp_year: number
          cardholder_name: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          last4: string
          brand: string
          exp_month: number
          exp_year: number
          cardholder_name: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          last4?: string
          brand?: string
          exp_month?: number
          exp_year?: number
          cardholder_name?: string
          is_default?: boolean
          created_at?: string
        }
      }
      content_purchases: {
        Row: {
          id: string
          user_id: string
          feed_id: string
          payment_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          feed_id: string
          payment_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          feed_id?: string
          payment_id?: string
          created_at?: string
        }
      }
      creator_stats: {
        Row: {
          id: string
          creator_id: string
          total_subscribers: number
          total_earnings: number
          this_month_earnings: number
          total_feeds: number
          total_media: number
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          total_subscribers?: number
          total_earnings?: number
          this_month_earnings?: number
          total_feeds?: number
          total_media?: number
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          total_subscribers?: number
          total_earnings?: number
          this_month_earnings?: number
          total_feeds?: number
          total_media?: number
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type User = Database['public']['Tables']['users']['Row']
export type Feed = Database['public']['Tables']['feeds']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type SubscriptionTier = Database['public']['Tables']['subscription_tiers']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type PaymentCard = Database['public']['Tables']['payment_cards']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Bookmark = Database['public']['Tables']['bookmarks']['Row']
export type FeedLike = Database['public']['Tables']['feed_likes']['Row']
export type ContentPurchase = Database['public']['Tables']['content_purchases']['Row']
export type CreatorStats = Database['public']['Tables']['creator_stats']['Row']

// Extended types with relations
export interface FeedWithCreator extends Feed {
  creator: User
  is_liked?: boolean
  is_bookmarked?: boolean
  is_purchased?: boolean
}

export interface MessageWithUsers extends Message {
  sender: User
  receiver: User
}

export interface NotificationWithData extends Notification {
  actor?: User
  feed?: Feed
}

