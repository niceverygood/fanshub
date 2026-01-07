import { supabase } from '../supabase';
import type { MessageWithUsers } from '../../types/database';

// Get conversations list
export async function getConversations(userId: string) {
  // Get unique conversation partners
  const { data, error } = await supabase
    .rpc('get_conversations', { user_id: userId });

  if (error) {
    // Fallback if RPC doesn't exist
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(*),
        receiver:users!receiver_id(*)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (msgError) throw msgError;

    // Group by conversation partner
    const conversationsMap = new Map();
    messages?.forEach(msg => {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partner: msg.sender_id === userId ? msg.receiver : msg.sender,
          lastMessage: msg,
          unreadCount: msg.receiver_id === userId && !msg.is_read ? 1 : 0,
        });
      } else if (msg.receiver_id === userId && !msg.is_read) {
        conversationsMap.get(partnerId).unreadCount++;
      }
    });

    return Array.from(conversationsMap.values());
  }

  return data;
}

// Get messages with a specific user
export async function getMessages(userId: string, partnerId: string, page = 0, limit = 50) {
  const offset = page * limit;

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users!sender_id(*),
      receiver:users!receiver_id(*)
    `)
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data as MessageWithUsers[];
}

// Send a message
export async function sendMessage(senderId: string, receiverId: string, content: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content,
    })
    .select(`
      *,
      sender:users!sender_id(*),
      receiver:users!receiver_id(*)
    `)
    .single();

  if (error) throw error;
  return data as MessageWithUsers;
}

// Mark messages as read
export async function markMessagesAsRead(userId: string, senderId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('receiver_id', userId)
    .eq('sender_id', senderId)
    .eq('is_read', false);

  if (error) throw error;
}

// Get unread messages count
export async function getUnreadCount(userId: string) {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
}

// Subscribe to new messages (realtime)
export function subscribeToMessages(userId: string, callback: (message: MessageWithUsers) => void) {
  return supabase
    .channel(`messages:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      },
      async (payload) => {
        // Fetch full message with user info
        const { data } = await supabase
          .from('messages')
          .select(`
            *,
            sender:users!sender_id(*),
            receiver:users!receiver_id(*)
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          callback(data as MessageWithUsers);
        }
      }
    )
    .subscribe();
}




