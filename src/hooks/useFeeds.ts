import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { FeedWithCreator } from '../types/database';
import { toast } from 'sonner';

// Mock data for when Supabase is not configured
const mockFeeds: FeedWithCreator[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    creator_id: '11111111-1111-1111-1111-111111111111',
    content_text: "There's room for two in here. Consider this your invitation. 🎭",
    media_urls: ['https://images.unsplash.com/photo-1627808869239-e68ec6e9b63e?w=800'],
    media_type: 'image',
    is_premium: true,
    price: 15,
    required_tier_level: null,
    like_count: 108,
    comment_count: 27,
    created_at: '2024-09-12T00:00:00Z',
    updated_at: '2024-09-12T00:00:00Z',
    creator: {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'fina@example.com',
      username: 'soofina',
      name: 'Fina',
      avatar_url: 'https://images.unsplash.com/photo-1551929175-f82f676827b8?w=400',
      cover_url: 'https://images.unsplash.com/photo-1627808869239-e68ec6e9b63e?w=1200',
      bio: '가라지어 록음니다 🎸',
      is_creator: true,
      is_verified: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    is_liked: false,
    is_bookmarked: false,
    is_purchased: false,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    creator_id: '22222222-2222-2222-2222-222222222222',
    content_text: '새로운 포토세트가 준비되었어요 ✨ 특별한 순간들을 담았습니다',
    media_urls: ['https://images.unsplash.com/photo-1624948456761-0f2660d3dc5f?w=800'],
    media_type: 'image',
    is_premium: true,
    price: 25,
    required_tier_level: null,
    like_count: 89,
    comment_count: 15,
    created_at: '2024-09-20T00:00:00Z',
    updated_at: '2024-09-20T00:00:00Z',
    creator: {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'earthly@example.com',
      username: 'earthlyworm',
      name: 'EARTHLY ALIEN',
      avatar_url: 'https://images.unsplash.com/photo-1624948456761-0f2660d3dc5f?w=400',
      cover_url: 'https://images.unsplash.com/photo-1624948456761-0f2660d3dc5f?w=1200',
      bio: '외계에서 온 지구인 👽',
      is_creator: true,
      is_verified: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    is_liked: false,
    is_bookmarked: false,
    is_purchased: false,
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    creator_id: '11111111-1111-1111-1111-111111111111',
    content_text: '새로운 뮤직비디오 티저가 나왔어요! 🎵 어떤가요?',
    media_urls: ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'],
    media_type: 'video',
    is_premium: true,
    price: 12,
    required_tier_level: null,
    like_count: 156,
    comment_count: 42,
    created_at: '2024-09-23T00:00:00Z',
    updated_at: '2024-09-23T00:00:00Z',
    creator: {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'fina@example.com',
      username: 'soofina',
      name: 'Fina',
      avatar_url: 'https://images.unsplash.com/photo-1551929175-f82f676827b8?w=400',
      cover_url: 'https://images.unsplash.com/photo-1627808869239-e68ec6e9b63e?w=1200',
      bio: '가라지어 록음니다 🎸',
      is_creator: true,
      is_verified: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    is_liked: false,
    is_bookmarked: false,
    is_purchased: false,
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    creator_id: '11111111-1111-1111-1111-111111111111',
    content_text: 'Do you like this color on me? 👗',
    media_urls: null,
    media_type: null,
    is_premium: false,
    price: null,
    required_tier_level: null,
    like_count: 234,
    comment_count: 67,
    created_at: '2024-09-22T00:00:00Z',
    updated_at: '2024-09-22T00:00:00Z',
    creator: {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'fina@example.com',
      username: 'soofina',
      name: 'Fina',
      avatar_url: 'https://images.unsplash.com/photo-1551929175-f82f676827b8?w=400',
      cover_url: 'https://images.unsplash.com/photo-1627808869239-e68ec6e9b63e?w=1200',
      bio: '가라지어 록음니다 🎸',
      is_creator: true,
      is_verified: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    is_liked: false,
    is_bookmarked: false,
    is_purchased: false,
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    creator_id: '33333333-3333-3333-3333-333333333333',
    content_text: '촬영 현장 비하인드! 🎬 처음 공개하는 메이킹 영상이에요',
    media_urls: ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'],
    media_type: 'video',
    is_premium: true,
    price: 18,
    required_tier_level: null,
    like_count: 178,
    comment_count: 34,
    created_at: '2024-09-19T00:00:00Z',
    updated_at: '2024-09-19T00:00:00Z',
    creator: {
      id: '33333333-3333-3333-3333-333333333333',
      email: 'ash@example.com',
      username: 'ashtype',
      name: 'ash',
      avatar_url: 'https://images.unsplash.com/photo-1646528192559-c163a2803f52?w=400',
      cover_url: 'https://images.unsplash.com/photo-1646528192559-c163a2803f52?w=1200',
      bio: '모델 & 포토그래퍼 📸',
      is_creator: true,
      is_verified: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    is_liked: false,
    is_bookmarked: false,
    is_purchased: false,
  },
  {
    id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    creator_id: '33333333-3333-3333-3333-333333333333',
    content_text: 'Behind the scenes 🎬 이 사진들은 오직 여기서만!',
    media_urls: ['https://images.unsplash.com/photo-1646528192559-c163a2803f52?w=800'],
    media_type: 'image',
    is_premium: true,
    price: 10,
    required_tier_level: null,
    like_count: 92,
    comment_count: 18,
    created_at: '2024-09-18T00:00:00Z',
    updated_at: '2024-09-18T00:00:00Z',
    creator: {
      id: '33333333-3333-3333-3333-333333333333',
      email: 'ash@example.com',
      username: 'ashtype',
      name: 'ash',
      avatar_url: 'https://images.unsplash.com/photo-1646528192559-c163a2803f52?w=400',
      cover_url: 'https://images.unsplash.com/photo-1646528192559-c163a2803f52?w=1200',
      bio: '모델 & 포토그래퍼 📸',
      is_creator: true,
      is_verified: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    is_liked: false,
    is_bookmarked: false,
    is_purchased: false,
  },
];

export function useFeeds(userId?: string) {
  const [feeds, setFeeds] = useState<FeedWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFeeds = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!isSupabaseConfigured()) {
        // Use mock data
        setFeeds(mockFeeds);
        return;
      }

      const { data, error } = await supabase
        .from('feeds')
        .select(`
          *,
          creator:users(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add like/bookmark status if user is logged in
      if (userId && data) {
        const feedIds = data.map(f => f.id);
        
        const [likesResult, bookmarksResult, purchasesResult] = await Promise.all([
          supabase.from('feed_likes').select('feed_id').eq('user_id', userId).in('feed_id', feedIds),
          supabase.from('bookmarks').select('feed_id').eq('user_id', userId).in('feed_id', feedIds),
          supabase.from('content_purchases').select('feed_id').eq('user_id', userId).in('feed_id', feedIds),
        ]);

        const likedFeedIds = new Set(likesResult.data?.map(l => l.feed_id) || []);
        const bookmarkedFeedIds = new Set(bookmarksResult.data?.map(b => b.feed_id) || []);
        const purchasedFeedIds = new Set(purchasesResult.data?.map(p => p.feed_id) || []);

        setFeeds(data.map(feed => ({
          ...feed,
          is_liked: likedFeedIds.has(feed.id),
          is_bookmarked: bookmarkedFeedIds.has(feed.id),
          is_purchased: purchasedFeedIds.has(feed.id),
        })) as FeedWithCreator[]);
      } else {
        setFeeds(data as FeedWithCreator[]);
      }
    } catch (err) {
      setError(err as Error);
      // Fallback to mock data on error
      setFeeds(mockFeeds);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  const likeFeed = async (feedId: string) => {
    if (!userId) {
      toast.error('로그인이 필요합니다');
      return;
    }

    // Optimistic update
    setFeeds(prev => prev.map(feed => 
      feed.id === feedId 
        ? { ...feed, is_liked: true, like_count: feed.like_count + 1 }
        : feed
    ));

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('feed_likes')
        .insert({ feed_id: feedId, user_id: userId });

      if (error && error.code !== '23505') {
        // Revert on error
        setFeeds(prev => prev.map(feed => 
          feed.id === feedId 
            ? { ...feed, is_liked: false, like_count: feed.like_count - 1 }
            : feed
        ));
        toast.error('좋아요 실패');
      }
    }
    
    toast.success('좋아요를 눌렀습니다!');
  };

  const unlikeFeed = async (feedId: string) => {
    if (!userId) return;

    // Optimistic update
    setFeeds(prev => prev.map(feed => 
      feed.id === feedId 
        ? { ...feed, is_liked: false, like_count: Math.max(0, feed.like_count - 1) }
        : feed
    ));

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('feed_likes')
        .delete()
        .eq('feed_id', feedId)
        .eq('user_id', userId);

      if (error) {
        // Revert on error
        setFeeds(prev => prev.map(feed => 
          feed.id === feedId 
            ? { ...feed, is_liked: true, like_count: feed.like_count + 1 }
            : feed
        ));
      }
    }
  };

  const bookmarkFeed = async (feedId: string) => {
    if (!userId) {
      toast.error('로그인이 필요합니다');
      return;
    }

    // Optimistic update
    setFeeds(prev => prev.map(feed => 
      feed.id === feedId 
        ? { ...feed, is_bookmarked: true }
        : feed
    ));

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('bookmarks')
        .insert({ feed_id: feedId, user_id: userId });

      if (error && error.code !== '23505') {
        setFeeds(prev => prev.map(feed => 
          feed.id === feedId 
            ? { ...feed, is_bookmarked: false }
            : feed
        ));
        toast.error('북마크 실패');
        return;
      }
    }
    
    toast.success('컬렉션에 저장되었습니다!');
  };

  const unbookmarkFeed = async (feedId: string) => {
    if (!userId) return;

    setFeeds(prev => prev.map(feed => 
      feed.id === feedId 
        ? { ...feed, is_bookmarked: false }
        : feed
    ));

    if (isSupabaseConfigured()) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('feed_id', feedId)
        .eq('user_id', userId);
    }
    
    toast.success('컬렉션에서 제거되었습니다.');
  };

  return {
    feeds,
    loading,
    error,
    refresh: fetchFeeds,
    likeFeed,
    unlikeFeed,
    bookmarkFeed,
    unbookmarkFeed,
  };
}

