import { supabase } from '../supabase';
import type { Comment } from '../../types/database';

interface CommentWithUser extends Comment {
  user: {
    id: string;
    name: string;
    username: string;
    avatar_url: string | null;
    is_verified: boolean;
  };
}

// Get comments for a feed
export async function getFeedComments(feedId: string, page = 0, limit = 20) {
  const offset = page * limit;

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:users(id, name, username, avatar_url, is_verified)
    `)
    .eq('feed_id', feedId)
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data as CommentWithUser[];
}

// Get replies to a comment
export async function getCommentReplies(commentId: string, page = 0, limit = 10) {
  const offset = page * limit;

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:users(id, name, username, avatar_url, is_verified)
    `)
    .eq('parent_id', commentId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data as CommentWithUser[];
}

// Create a comment
export async function createComment(comment: {
  feed_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
}) {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select(`
      *,
      user:users(id, name, username, avatar_url, is_verified)
    `)
    .single();

  if (error) throw error;
  return data as CommentWithUser;
}

// Update a comment
export async function updateComment(commentId: string, content: string) {
  const { data, error } = await supabase
    .from('comments')
    .update({ content })
    .eq('id', commentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a comment
export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
}

// Like a comment
export async function likeComment(commentId: string) {
  const { error } = await supabase.rpc('increment_comment_likes', { comment_id: commentId });
  
  if (error) {
    // Fallback if RPC doesn't exist
    const { data: comment } = await supabase
      .from('comments')
      .select('like_count')
      .eq('id', commentId)
      .single();

    if (comment) {
      await supabase
        .from('comments')
        .update({ like_count: (comment.like_count || 0) + 1 })
        .eq('id', commentId);
    }
  }
}

// Unlike a comment
export async function unlikeComment(commentId: string) {
  const { error } = await supabase.rpc('decrement_comment_likes', { comment_id: commentId });
  
  if (error) {
    // Fallback if RPC doesn't exist
    const { data: comment } = await supabase
      .from('comments')
      .select('like_count')
      .eq('id', commentId)
      .single();

    if (comment && comment.like_count > 0) {
      await supabase
        .from('comments')
        .update({ like_count: comment.like_count - 1 })
        .eq('id', commentId);
    }
  }
}

