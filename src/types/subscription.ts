export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  description: string;
  benefits: string[];
  color: string;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 4.99,
    description: '기본 콘텐츠에 접근',
    benefits: ['기본 포스트 접근', '좋아요 및 댓글'],
    color: '#64748b'
  },
  {
    id: 'silver',
    name: 'Silver',
    price: 9.99,
    description: '더 많은 콘텐츠와 상호작용',
    benefits: ['기본 + 실버 전용 콘텐츠', '라이브 채팅 참여', '월 1회 DM'],
    color: '#94a3b8'
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 19.99,
    description: '프리미엄 콘텐츠 접근',
    benefits: ['실버 + 골드 전용 콘텐츠', '무제한 DM', '맞춤 콘텐츠 요청'],
    color: '#fbbf24'
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 39.99,
    description: 'VIP 대우와 모든 콘텐츠 접근',
    benefits: ['모든 콘텐츠 접근', '1:1 영상통화', '개인 맞춤 콘텐츠', '우선 응답'],
    color: '#a855f7'
  }
];

export type PostVisibility = 'free' | 'basic' | 'silver' | 'gold' | 'platinum' | 'paid';

export interface PostSettings {
  visibility: PostVisibility;
  price?: number; // 별도 과금용
  title?: string;
  description?: string;
}