import { supabase } from '../supabase';
import type { Payment, PaymentCard } from '../../types/database';

// Get user's payment cards
export async function getPaymentCards(userId: string) {
  const { data, error } = await supabase
    .from('payment_cards')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Add payment card
export async function addPaymentCard(card: Omit<PaymentCard, 'id' | 'created_at'>) {
  // If this is the first card, make it default
  const { count } = await supabase
    .from('payment_cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', card.user_id);

  const { data, error } = await supabase
    .from('payment_cards')
    .insert({
      ...card,
      is_default: count === 0 ? true : card.is_default,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Remove payment card
export async function removePaymentCard(cardId: string, userId: string) {
  const { error } = await supabase
    .from('payment_cards')
    .delete()
    .eq('id', cardId)
    .eq('user_id', userId);

  if (error) throw error;
}

// Set default card
export async function setDefaultCard(cardId: string, userId: string) {
  // First, unset all defaults
  await supabase
    .from('payment_cards')
    .update({ is_default: false })
    .eq('user_id', userId);

  // Set the new default
  const { error } = await supabase
    .from('payment_cards')
    .update({ is_default: true })
    .eq('id', cardId)
    .eq('user_id', userId);

  if (error) throw error;
}

// Create payment record
export async function createPayment(payment: Omit<Payment, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get user's payment history
export async function getPaymentHistory(userId: string, page = 0, limit = 20) {
  const offset = page * limit;

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      creator:users!creator_id(*),
      feed:feeds(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

// Get creator's earnings
export async function getCreatorEarnings(creatorId: string, startDate?: string, endDate?: string) {
  let query = supabase
    .from('payments')
    .select('*')
    .eq('creator_id', creatorId)
    .eq('status', 'completed');

  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;

  // Calculate totals
  const totals = data?.reduce(
    (acc, payment) => {
      acc.total += payment.amount;
      acc[payment.type] = (acc[payment.type] || 0) + payment.amount;
      return acc;
    },
    { total: 0, subscription: 0, tip: 0, purchase: 0 }
  );

  return { payments: data, totals };
}

// Purchase content
export async function purchaseContent(
  userId: string,
  feedId: string,
  creatorId: string,
  amount: number,
  paymentMethod?: string
) {
  // Create payment record
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      creator_id: creatorId,
      amount,
      type: 'purchase',
      status: 'completed', // In production, this would be 'pending' until payment processor confirms
      feed_id: feedId,
      payment_method: paymentMethod,
    })
    .select()
    .single();

  if (paymentError) throw paymentError;

  // Create content purchase record
  const { error: purchaseError } = await supabase
    .from('content_purchases')
    .insert({
      user_id: userId,
      feed_id: feedId,
      payment_id: payment.id,
    });

  if (purchaseError) throw purchaseError;

  return payment;
}

// Check if user has purchased content
export async function hasUserPurchasedContent(userId: string, feedId: string) {
  const { data, error } = await supabase
    .from('content_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('feed_id', feedId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

// Send tip
export async function sendTip(
  userId: string,
  creatorId: string,
  amount: number,
  message?: string,
  paymentMethod?: string
) {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      creator_id: creatorId,
      amount,
      type: 'tip',
      status: 'completed',
      payment_method: paymentMethod,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

