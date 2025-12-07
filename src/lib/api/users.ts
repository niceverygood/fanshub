import { supabase } from '../supabase';
import type { User } from '../../types/database';

// Get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

// Get user by ID
export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

// Get user by username
export async function getUserByUsername(username: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error) throw error;
  return data;
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get creator stats
export async function getCreatorStats(creatorId: string) {
  const { data, error } = await supabase
    .from('creator_stats')
    .select('*')
    .eq('creator_id', creatorId)
    .single();

  if (error) throw error;
  return data;
}

// Search users
export async function searchUsers(query: string, limit = 10) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .or(`username.ilike.%${query}%,name.ilike.%${query}%`)
    .limit(limit);

  if (error) throw error;
  return data;
}

// Get recommended creators
export async function getRecommendedCreators(limit = 10) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      creator_stats(total_subscribers)
    `)
    .eq('is_creator', true)
    .order('creator_stats(total_subscribers)', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

