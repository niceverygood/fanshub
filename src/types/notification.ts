export interface NotificationUser {
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
}

export type NotificationType = 
  | 'like' 
  | 'comment' 
  | 'mention' 
  | 'subscribe' 
  | 'tip' 
  | 'message' 
  | 'promotion'
  | 'tag';

export interface FeedData {
  creator: {
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
  };
  content: {
    text: string;
    image?: string;
    video?: string;
  };
  timestamp: string;
  isBlurred?: boolean;
  price?: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  user: NotificationUser;
  message: string;
  timestamp: string;
  isRead: boolean;
  postImage?: string;
  amount?: number; // for tips
  subscriptionTier?: string; // for subscriptions
  feedId?: string; // 피드 ID (게시물 관련 알림용)
  feedData?: FeedData; // 피드 상세 데이터 (네비게이션용)
}

export const NOTIFICATION_TABS = [
  { id: 'all', label: '모두' },
  { id: 'tag', label: '태그' },
  { id: 'comment', label: '댓글' },
  { id: 'mention', label: '멘션' },
  { id: 'subscribe', label: '구독' },
  { id: 'promotion', label: '프로모션' }
] as const;

export type NotificationTab = typeof NOTIFICATION_TABS[number]['id'];