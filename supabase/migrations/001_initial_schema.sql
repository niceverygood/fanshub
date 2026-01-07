-- FansHub Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  cover_url TEXT,
  bio TEXT,
  is_creator BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_email ON public.users(email);

-- ============================================
-- SUBSCRIPTION TIERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscription_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  benefits TEXT[],
  tier_level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscription_tiers_creator ON public.subscription_tiers(creator_id);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES public.subscription_tiers(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscriber_id, creator_id)
);

CREATE INDEX idx_subscriptions_subscriber ON public.subscriptions(subscriber_id);
CREATE INDEX idx_subscriptions_creator ON public.subscriptions(creator_id);

-- ============================================
-- FEEDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.feeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content_text TEXT,
  media_urls TEXT[],
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  is_premium BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2),
  required_tier_level INTEGER,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feeds_creator ON public.feeds(creator_id);
CREATE INDEX idx_feeds_created_at ON public.feeds(created_at DESC);

-- ============================================
-- FEED LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.feed_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_id UUID REFERENCES public.feeds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feed_id, user_id)
);

CREATE INDEX idx_feed_likes_feed ON public.feed_likes(feed_id);
CREATE INDEX idx_feed_likes_user ON public.feed_likes(user_id);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_id UUID REFERENCES public.feeds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_feed ON public.comments(feed_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);

-- ============================================
-- BOOKMARKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  feed_id UUID REFERENCES public.feeds(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feed_id)
);

CREATE INDEX idx_bookmarks_user ON public.bookmarks(user_id);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_conversation ON public.messages(sender_id, receiver_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'subscription', 'message', 'tip', 'new_post')),
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE is_read = FALSE;

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'tip', 'purchase')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  feed_id UUID REFERENCES public.feeds(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_creator ON public.payments(creator_id);

-- ============================================
-- PAYMENT CARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.payment_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  last4 TEXT NOT NULL,
  brand TEXT NOT NULL,
  exp_month INTEGER NOT NULL,
  exp_year INTEGER NOT NULL,
  cardholder_name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_cards_user ON public.payment_cards(user_id);

-- ============================================
-- CONTENT PURCHASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.content_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  feed_id UUID REFERENCES public.feeds(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feed_id)
);

CREATE INDEX idx_content_purchases_user ON public.content_purchases(user_id);

-- ============================================
-- CREATOR STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.creator_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  total_subscribers INTEGER DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  this_month_earnings DECIMAL(10, 2) DEFAULT 0,
  total_feeds INTEGER DEFAULT 0,
  total_media INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_stats ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Subscription tiers policies
CREATE POLICY "Anyone can view active tiers" ON public.subscription_tiers FOR SELECT USING (is_active = true);
CREATE POLICY "Creators can manage own tiers" ON public.subscription_tiers FOR ALL USING (auth.uid() = creator_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT 
  USING (auth.uid() = subscriber_id OR auth.uid() = creator_id);
CREATE POLICY "Users can create subscriptions" ON public.subscriptions FOR INSERT 
  WITH CHECK (auth.uid() = subscriber_id);

-- Feeds policies
CREATE POLICY "Anyone can view non-premium feeds" ON public.feeds FOR SELECT 
  USING (is_premium = false OR creator_id = auth.uid());
CREATE POLICY "Creators can manage own feeds" ON public.feeds FOR ALL USING (auth.uid() = creator_id);

-- Feed likes policies
CREATE POLICY "Anyone can view likes" ON public.feed_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON public.feed_likes FOR ALL USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = creator_id);

-- Payment cards policies
CREATE POLICY "Users can manage own cards" ON public.payment_cards FOR ALL USING (auth.uid() = user_id);

-- Content purchases policies
CREATE POLICY "Users can view own purchases" ON public.content_purchases FOR SELECT USING (auth.uid() = user_id);

-- Creator stats policies
CREATE POLICY "Creators can view own stats" ON public.creator_stats FOR SELECT USING (auth.uid() = creator_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update like count
CREATE OR REPLACE FUNCTION update_feed_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feeds SET like_count = like_count + 1 WHERE id = NEW.feed_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feeds SET like_count = like_count - 1 WHERE id = OLD.feed_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for like count
CREATE TRIGGER feed_like_count_trigger
AFTER INSERT OR DELETE ON public.feed_likes
FOR EACH ROW EXECUTE FUNCTION update_feed_like_count();

-- Function to update comment count
CREATE OR REPLACE FUNCTION update_feed_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feeds SET comment_count = comment_count + 1 WHERE id = NEW.feed_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feeds SET comment_count = comment_count - 1 WHERE id = OLD.feed_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment count
CREATE TRIGGER feed_comment_count_trigger
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION update_feed_comment_count();

-- Function to update creator stats
CREATE OR REPLACE FUNCTION update_creator_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update subscriber count
  UPDATE public.creator_stats 
  SET total_subscribers = (
    SELECT COUNT(*) FROM public.subscriptions 
    WHERE creator_id = NEW.creator_id AND status = 'active'
  ),
  updated_at = NOW()
  WHERE creator_id = NEW.creator_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for creator stats
CREATE TRIGGER subscription_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION update_creator_stats();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feeds_updated_at
BEFORE UPDATE ON public.feeds
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();




