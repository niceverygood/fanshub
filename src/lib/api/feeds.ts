import { supabase } from '../supabase';
import type { Feed, FeedWithCreator } from '../../types/database';

// Get feed by ID with creator info
export async function getFeedById(feedId: string, userId?: string) {
  const { data: feed, error } = await supabase
    .from('feeds')
    .select(`
      *,
      creator:users(*)
    `)
    .eq('id', feedId)
    .single();

  if (error) throw error;

  // Check if user has liked and bookmarked
  if (userId && feed) {
    const [likeResult, bookmarkResult, purchaseResult] = await Promise.all([
      supabase.from('feed_likes').select('id').eq('feed_id', feedId).eq('user_id', userId).single(),
      supabase.from('bookmarks').select('id').eq('feed_id', feedId).eq('user_id', userId).single(),
      supabase.from('content_purchases').select('id').eq('feed_id', feedId).eq('user_id', userId).single(),
    ]);

    return {
      ...feed,
      is_liked: !!likeResult.data,
      is_bookmarked: !!bookmarkResult.data,
      is_purchased: !!purchaseResult.data,
    } as FeedWithCreator;
  }

  return feed as FeedWithCreator;
}

// Get feeds for home timeline
export async function getHomeFeeds(userId?: string, page = 0, limit = 10) {
  const offset = page * limit;

  const { data: feeds, error } = await supabase
    .from('feeds')
    .select(`
      *,
      creator:users(*)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Add like/bookmark status if user is logged in
  if (userId && feeds) {
    const feedIds = feeds.map(f => f.id);
    
    const [likesResult, bookmarksResult, purchasesResult] = await Promise.all([
      supabase.from('feed_likes').select('feed_id').eq('user_id', userId).in('feed_id', feedIds),
      supabase.from('bookmarks').select('feed_id').eq('user_id', userId).in('feed_id', feedIds),
      supabase.from('content_purchases').select('feed_id').eq('user_id', userId).in('feed_id', feedIds),
    ]);

    const likedFeedIds = new Set(likesResult.data?.map(l => l.feed_id) || []);
    const bookmarkedFeedIds = new Set(bookmarksResult.data?.map(b => b.feed_id) || []);
    const purchasedFeedIds = new Set(purchasesResult.data?.map(p => p.feed_id) || []);

    return feeds.map(feed => ({
      ...feed,
      is_liked: likedFeedIds.has(feed.id),
      is_bookmarked: bookmarkedFeedIds.has(feed.id),
      is_purchased: purchasedFeedIds.has(feed.id),
    })) as FeedWithCreator[];
  }

  return feeds as FeedWithCreator[];
}

// Get feeds by creator
export async function getCreatorFeeds(creatorId: string, userId?: string, page = 0, limit = 20) {
  const offset = page * limit;

  const { data: feeds, error } = await supabase
    .from('feeds')
    .select(`
      *,
      creator:users(*)
    `)
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return feeds as FeedWithCreator[];
}

// Create a new feed
export async function createFeed(feed: {
  creator_id: string;
  content_text?: string;
  media_urls?: string[];
  media_type?: 'image' | 'video';
  is_premium?: boolean;
  price?: number;
  required_tier_level?: number;
}) {
  const { data, error } = await supabase
    .from('feeds')
    .insert(feed)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update a feed
export async function updateFeed(feedId: string, updates: Partial<Feed>) {
  const { data, error } = await supabase
    .from('feeds')
    .update(updates)
    .eq('id', feedId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a feed
export async function deleteFeed(feedId: string) {
  const { error } = await supabase
    .from('feeds')
    .delete()
    .eq('id', feedId);

  if (error) throw error;
}

// Like a feed
export async function likeFeed(feedId: string, userId: string) {
  const { error } = await supabase
    .from('feed_likes')
    .insert({ feed_id: feedId, user_id: userId });

  if (error && error.code !== '23505') throw error; // Ignore duplicate key error
}

// Unlike a feed
export async function unlikeFeed(feedId: string, userId: string) {
  const { error } = await supabase
    .from('feed_likes')
    .delete()
    .eq('feed_id', feedId)
    .eq('user_id', userId);

  if (error) throw error;
}

// Bookmark a feed
export async function bookmarkFeed(feedId: string, userId: string) {
  const { error } = await supabase
    .from('bookmarks')
    .insert({ feed_id: feedId, user_id: userId });

  if (error && error.code !== '23505') throw error;
}

// Remove bookmark
export async function unbookmarkFeed(feedId: string, userId: string) {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('feed_id', feedId)
    .eq('user_id', userId);

  if (error) throw error;
}

// Get user's bookmarks
export async function getUserBookmarks(userId: string, page = 0, limit = 20) {
  const offset = page * limit;

  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      feed:feeds(
        *,
        creator:users(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data?.map(b => b.feed).filter(Boolean) as FeedWithCreator[];
}

// Search feeds
export async function searchFeeds(query: string, page = 0, limit = 20) {
  const offset = page * limit;

  const { data, error } = await supabase
    .from('feeds')
    .select(`
      *,
      creator:users(*)
    `)
    .or(`content_text.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data as FeedWithCreator[];
}

