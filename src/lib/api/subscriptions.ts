import { supabase } from '../supabase';
import type { Subscription, SubscriptionTier } from '../../types/database';

// Get subscription tiers for a creator
export async function getCreatorTiers(creatorId: string) {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('creator_id', creatorId)
    .eq('is_active', true)
    .order('tier_level', { ascending: true });

  if (error) throw error;
  return data;
}

// Check if user is subscribed to a creator
export async function checkSubscription(subscriberId: string, creatorId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      tier:subscription_tiers(*)
    `)
    .eq('subscriber_id', subscriberId)
    .eq('creator_id', creatorId)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data;
}

// Subscribe to a creator
export async function subscribe(subscriberId: string, creatorId: string, tierId?: string) {
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  const { data, error } = await supabase
    .from('subscriptions')
    .upsert({
      subscriber_id: subscriberId,
      creator_id: creatorId,
      tier_id: tierId,
      status: 'active',
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get user's subscriptions
export async function getUserSubscriptions(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      creator:users(*),
      tier:subscription_tiers(*)
    `)
    .eq('subscriber_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Get creator's subscribers
export async function getCreatorSubscribers(creatorId: string, page = 0, limit = 20) {
  const offset = page * limit;

  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      subscriber:users(*),
      tier:subscription_tiers(*)
    `)
    .eq('creator_id', creatorId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
}

// Create subscription tier
export async function createTier(tier: Omit<SubscriptionTier, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .insert(tier)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update subscription tier
export async function updateTier(tierId: string, updates: Partial<SubscriptionTier>) {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .update(updates)
    .eq('id', tierId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete subscription tier
export async function deleteTier(tierId: string) {
  const { error } = await supabase
    .from('subscription_tiers')
    .update({ is_active: false })
    .eq('id', tierId);

  if (error) throw error;
}




