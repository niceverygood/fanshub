import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '../types/database';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
}

interface Conversation {
  partner: User;
  lastMessage: Message;
  unreadCount: number;
}

// Mock data
const mockConversations: Conversation[] = [
  {
    partner: {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'fina@example.com',
      username: 'soofina',
      name: 'Fina',
      avatar_url: 'https://images.unsplash.com/photo-1551929175-f82f676827b8?w=400',
      cover_url: null,
      bio: '가라지어 록음니다 🎸',
      is_creator: true,
      is_verified: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    lastMessage: {
      id: 'msg1',
      sender_id: '11111111-1111-1111-1111-111111111111',
      receiver_id: 'current-user',
      content: '안녕하세요! 구독해주셔서 감사합니다 💕',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    unreadCount: 2,
  },
  {
    partner: {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'earthly@example.com',
      username: 'earthlyworm',
      name: 'EARTHLY ALIEN',
      avatar_url: 'https://images.unsplash.com/photo-1624948456761-0f2660d3dc5f?w=400',
      cover_url: null,
      bio: '외계에서 온 지구인 👽',
      is_creator: true,
      is_verified: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    lastMessage: {
      id: 'msg2',
      sender_id: 'current-user',
      receiver_id: '22222222-2222-2222-2222-222222222222',
      content: '새 일러스트 너무 예뻐요!',
      is_read: true,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    unreadCount: 0,
  },
];

export function useMessages(userId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchConversations = useCallback(async () => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      if (!isSupabaseConfigured()) {
        setConversations(mockConversations);
        setUnreadCount(mockConversations.reduce((sum, c) => sum + c.unreadCount, 0));
        return;
      }

      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(*),
          receiver:users!receiver_id(*)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation partner
      const conversationsMap = new Map<string, Conversation>();
      let totalUnread = 0;

      messages?.forEach(msg => {
        const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        const isUnread = msg.receiver_id === userId && !msg.is_read;

        if (!conversationsMap.has(partnerId)) {
          conversationsMap.set(partnerId, {
            partner: msg.sender_id === userId ? msg.receiver : msg.sender,
            lastMessage: msg,
            unreadCount: isUnread ? 1 : 0,
          });
        } else if (isUnread) {
          const conv = conversationsMap.get(partnerId)!;
          conv.unreadCount++;
        }

        if (isUnread) totalUnread++;
      });

      setConversations(Array.from(conversationsMap.values()));
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations(mockConversations);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Real-time subscription
  useEffect(() => {
    if (!userId || !isSupabaseConfigured()) return;

    const channel = supabase
      .channel(`messages:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchConversations]);

  return {
    conversations,
    loading,
    unreadCount,
    refresh: fetchConversations,
  };
}

export function useConversation(userId?: string, partnerId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!userId || !partnerId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      if (!isSupabaseConfigured()) {
        // Mock messages
        setMessages([
          {
            id: 'msg1',
            sender_id: partnerId,
            receiver_id: userId,
            content: '안녕하세요! 구독해주셔서 감사합니다 💕',
            is_read: true,
            created_at: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: 'msg2',
            sender_id: userId,
            receiver_id: partnerId,
            content: '안녕하세요! 항상 응원합니다!',
            is_read: true,
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
        ]);
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', userId)
        .eq('sender_id', partnerId)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, partnerId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = async (content: string) => {
    if (!userId || !partnerId) {
      toast.error('메시지를 보낼 수 없습니다');
      return false;
    }

    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender_id: userId,
        receiver_id: partnerId,
        content,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      // Optimistic update
      setMessages(prev => [...prev, newMessage]);

      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('messages').insert({
          sender_id: userId,
          receiver_id: partnerId,
          content,
        });

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('메시지 전송에 실패했습니다');
      return false;
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    refresh: fetchMessages,
  };
}

