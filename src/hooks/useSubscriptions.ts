import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Subscription, SubscriptionTier, User } from '../types/database';
import { toast } from 'sonner';

interface SubscriptionWithDetails extends Subscription {
  creator: User;
  tier?: SubscriptionTier;
}

// Mock data
const mockSubscriptions: SubscriptionWithDetails[] = [];

const mockTiers: SubscriptionTier[] = [
  {
    id: 'tier-basic',
    creator_id: '11111111-1111-1111-1111-111111111111',
    name: 'Basic',
    price: 4.99,
    description: '기본 구독',
    benefits: ['모든 일반 피드 접근', '댓글 작성 가능', '월간 뉴스레터'],
    tier_level: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tier-silver',
    creator_id: '11111111-1111-1111-1111-111111111111',
    name: 'Silver',
    price: 9.99,
    description: '실버 구독',
    benefits: ['Basic 혜택 모두 포함', '실버 전용 콘텐츠', '주간 비하인드 스토리'],
    tier_level: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tier-gold',
    creator_id: '11111111-1111-1111-1111-111111111111',
    name: 'Gold',
    price: 19.99,
    description: '골드 구독',
    benefits: ['Silver 혜택 모두 포함', '골드 전용 콘텐츠', '1:1 DM 가능', '라이브 참여권'],
    tier_level: 3,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tier-platinum',
    creator_id: '11111111-1111-1111-1111-111111111111',
    name: 'Platinum',
    price: 49.99,
    description: '플래티넘 구독',
    benefits: ['Gold 혜택 모두 포함', '플래티넘 전용 콘텐츠', '개인 영상 메시지', 'VIP 이벤트 초대'],
    tier_level: 4,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export function useSubscriptions(userId?: string) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    if (!userId) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      if (!isSupabaseConfigured()) {
        setSubscriptions(mockSubscriptions);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          creator:users!creator_id(*),
          tier:subscription_tiers(*)
        `)
        .eq('subscriber_id', userId)
        .eq('status', 'active');

      if (error) throw error;
      setSubscriptions(data as SubscriptionWithDetails[]);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setSubscriptions(mockSubscriptions);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const subscribe = async (creatorId: string, tierId?: string) => {
    if (!userId) {
      toast.error('로그인이 필요합니다');
      return false;
    }

    try {
      if (isSupabaseConfigured()) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            subscriber_id: userId,
            creator_id: creatorId,
            tier_id: tierId,
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
          });

        if (error) throw error;
      }

      toast.success('구독이 완료되었습니다!');
      await fetchSubscriptions();
      return true;
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('구독 처리 중 오류가 발생했습니다');
      return false;
    }
  };

  const unsubscribe = async (subscriptionId: string) => {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('id', subscriptionId);

        if (error) throw error;
      }

      toast.success('구독이 취소되었습니다');
      await fetchSubscriptions();
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('구독 취소 중 오류가 발생했습니다');
      return false;
    }
  };

  const isSubscribed = (creatorId: string) => {
    return subscriptions.some(sub => sub.creator_id === creatorId && sub.status === 'active');
  };

  const getSubscriptionTier = (creatorId: string) => {
    const subscription = subscriptions.find(sub => sub.creator_id === creatorId);
    return subscription?.tier;
  };

  return {
    subscriptions,
    loading,
    subscribe,
    unsubscribe,
    isSubscribed,
    getSubscriptionTier,
    refresh: fetchSubscriptions,
  };
}

export function useCreatorTiers(creatorId?: string) {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!creatorId) {
      setTiers([]);
      setLoading(false);
      return;
    }

    const fetchTiers = async () => {
      try {
        if (!isSupabaseConfigured()) {
          setTiers(mockTiers.filter(t => t.creator_id === creatorId));
          return;
        }

        const { data, error } = await supabase
          .from('subscription_tiers')
          .select('*')
          .eq('creator_id', creatorId)
          .eq('is_active', true)
          .order('tier_level', { ascending: true });

        if (error) throw error;
        setTiers(data);
      } catch (error) {
        console.error('Error fetching tiers:', error);
        setTiers(mockTiers.filter(t => t.creator_id === creatorId));
      } finally {
        setLoading(false);
      }
    };

    fetchTiers();
  }, [creatorId]);

  return { tiers, loading };
}

