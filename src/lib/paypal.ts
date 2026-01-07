// PayPal Configuration
export const PAYPAL_CONFIG = {
  clientId: (import.meta as any).env?.VITE_PAYPAL_CLIENT_ID || '',
  // Sandbox or Live
  mode: (import.meta as any).env?.VITE_PAYPAL_MODE || 'sandbox',
  currency: 'USD',
  // 플랫폼 수수료 (30%) - 크리에이터 70%, FansHub 30%
  platformFeePercent: 30,
};

// 결제 타입
export type PaymentType = 'subscription' | 'content' | 'tip';

export interface PaymentItem {
  id: string;
  type: PaymentType;
  creatorId: string;
  amount: number;
  description: string;
}

// PayPal Script URL
export const getPayPalScriptUrl = () => {
  const baseUrl = 'https://www.paypal.com/sdk/js';
  const params = new URLSearchParams({
    'client-id': PAYPAL_CONFIG.clientId,
    currency: PAYPAL_CONFIG.currency,
    intent: 'capture',
  });
  return `${baseUrl}?${params.toString()}`;
};

// 플랫폼 수수료 계산
export const calculatePlatformFee = (amount: number): number => {
  return Number((amount * (PAYPAL_CONFIG.platformFeePercent / 100)).toFixed(2));
};

// 크리에이터 수익 계산
export const calculateCreatorEarnings = (amount: number): number => {
  const fee = calculatePlatformFee(amount);
  return Number((amount - fee).toFixed(2));
};

// PayPal 정산 상태
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface PayoutRecord {
  id: string;
  creatorId: string;
  amount: number;
  fee: number;
  netAmount: number;
  paypalEmail: string;
  status: PayoutStatus;
  paypalBatchId?: string;
  createdAt: string;
  processedAt?: string;
  errorMessage?: string;
}

