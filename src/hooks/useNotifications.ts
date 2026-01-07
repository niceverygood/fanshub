import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Notification } from '../types/database';

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: 'notif1',
    user_id: 'current-user',
    type: 'like',
    title: 'Fina님이 좋아요를 눌렀습니다',
    body: '회원님의 댓글을 좋아합니다',
    data: { actor_id: '11111111-1111-1111-1111-111111111111' },
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'notif2',
    user_id: 'current-user',
    type: 'new_post',
    title: 'EARTHLY ALIEN님이 새 피드를 올렸습니다',
    body: '새로운 일러스트가 공개되었어요!',
    data: { creator_id: '22222222-2222-2222-2222-222222222222' },
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif3',
    user_id: 'current-user',
    type: 'comment',
    title: 'ash님이 댓글을 달았습니다',
    body: '멋진 사진이네요! 👏',
    data: { actor_id: '33333333-3333-3333-3333-333333333333' },
    is_read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      if (!isSupabaseConfigured()) {
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!userId || !isSupabaseConfigured()) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    // Optimistic update
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    if (isSupabaseConfigured()) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);

    if (isSupabaseConfigured()) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}




