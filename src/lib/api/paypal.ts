import { supabase } from '../supabase';
import { calculatePlatformFee, calculateCreatorEarnings, PayoutRecord, PayoutStatus } from '../paypal';

// Edge Function 호출을 위한 베이스 URL
const getEdgeFunctionUrl = (functionName: string) => {
  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  return `${supabaseUrl}/functions/v1/${functionName}`;
};

// 크리에이터 PayPal 계정 연동
export async function linkPayPalAccount(userId: string, paypalEmail: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ 
      paypal_email: paypalEmail,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 크리에이터 PayPal 계정 연동 해제
export async function unlinkPayPalAccount(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ 
      paypal_email: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 크리에이터 수익 조회
export async function getCreatorEarnings(creatorId: string) {
  // 총 수익 (구독 + 콘텐츠 판매 + 팁)
  const { data: payments, error } = await supabase
    .from('payments')
    .select('amount, type, status, created_at')
    .eq('creator_id', creatorId)
    .eq('status', 'completed');

  if (error) throw error;

  const totalEarnings = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const platformFee = calculatePlatformFee(totalEarnings);
  const netEarnings = calculateCreatorEarnings(totalEarnings);

  // 정산 완료 금액
  const { data: payouts } = await supabase
    .from('payouts')
    .select('net_amount')
    .eq('creator_id', creatorId)
    .eq('status', 'completed');

  const paidOut = payouts?.reduce((sum, p) => sum + (p.net_amount || 0), 0) || 0;
  const pendingBalance = netEarnings - paidOut;

  return {
    totalEarnings,
    platformFee,
    netEarnings,
    paidOut,
    pendingBalance,
    payments: payments || [],
  };
}

// 정산 요청
export async function requestPayout(creatorId: string, amount: number) {
  // 크리에이터 정보 조회
  const { data: creator, error: creatorError } = await supabase
    .from('users')
    .select('paypal_email')
    .eq('id', creatorId)
    .single();

  if (creatorError) throw creatorError;
  if (!creator?.paypal_email) {
    throw new Error('PayPal 계정이 연동되지 않았습니다.');
  }

  // 최소 정산 금액 확인
  if (amount < 10) {
    throw new Error('최소 정산 금액은 $10입니다.');
  }

  // 정산 가능 금액 확인
  const earnings = await getCreatorEarnings(creatorId);
  if (amount > earnings.pendingBalance) {
    throw new Error('정산 가능 금액을 초과했습니다.');
  }

  const fee = calculatePlatformFee(amount);
  const netAmount = amount - fee;

  // 정산 요청 생성
  const { data, error } = await supabase
    .from('payouts')
    .insert({
      creator_id: creatorId,
      amount,
      fee,
      net_amount: netAmount,
      paypal_email: creator.paypal_email,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 정산 내역 조회
export async function getPayoutHistory(creatorId: string): Promise<PayoutRecord[]> {
  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return (data || []).map(p => ({
    id: p.id,
    creatorId: p.creator_id,
    amount: p.amount,
    fee: p.fee,
    netAmount: p.net_amount,
    paypalEmail: p.paypal_email,
    status: p.status as PayoutStatus,
    paypalBatchId: p.paypal_batch_id,
    createdAt: p.created_at,
    processedAt: p.processed_at,
    errorMessage: p.error_message,
  }));
}

// 정산 상태 업데이트 (관리자용)
export async function updatePayoutStatus(
  payoutId: string, 
  status: PayoutStatus, 
  paypalBatchId?: string,
  errorMessage?: string
) {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'completed' || status === 'failed') {
    updateData.processed_at = new Date().toISOString();
  }

  if (paypalBatchId) {
    updateData.paypal_batch_id = paypalBatchId;
  }

  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  const { data, error } = await supabase
    .from('payouts')
    .update(updateData)
    .eq('id', payoutId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 월별 수익 통계
export async function getMonthlyEarningsStats(creatorId: string, months: number = 6) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const { data, error } = await supabase
    .from('payments')
    .select('amount, type, created_at')
    .eq('creator_id', creatorId)
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString());

  if (error) throw error;

  // 월별로 그룹화
  const monthlyStats: Record<string, { subscriptions: number; content: number; tips: number }> = {};
  
  (data || []).forEach(payment => {
    const date = new Date(payment.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyStats[monthKey]) {
      monthlyStats[monthKey] = { subscriptions: 0, content: 0, tips: 0 };
    }

    if (payment.type === 'subscription') {
      monthlyStats[monthKey].subscriptions += payment.amount;
    } else if (payment.type === 'content') {
      monthlyStats[monthKey].content += payment.amount;
    } else if (payment.type === 'tip') {
      monthlyStats[monthKey].tips += payment.amount;
    }
  });

  return monthlyStats;
}

// ============================================
// Edge Function 호출 (관리자용)
// ============================================

// 정산 처리 (PayPal로 송금)
export async function processPayout(payoutId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('인증이 필요합니다.');
  }

  const response = await fetch(getEdgeFunctionUrl('process-payout'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payoutId }),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || '정산 처리에 실패했습니다.');
  }

  return result;
}

// 관리자: 대기중인 정산 목록 조회
export async function getAdminPayoutList() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('인증이 필요합니다.');
  }

  const response = await fetch(getEdgeFunctionUrl('admin-payout'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'list' }),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || '목록 조회에 실패했습니다.');
  }

  return result.payouts;
}

// 관리자: 정산 승인
export async function approveAdminPayout(payoutId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('인증이 필요합니다.');
  }

  const response = await fetch(getEdgeFunctionUrl('admin-payout'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'approve', payoutId }),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || '정산 승인에 실패했습니다.');
  }

  return result;
}

// 관리자: 정산 거부
export async function rejectAdminPayout(payoutId: string, reason?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('인증이 필요합니다.');
  }

  const response = await fetch(getEdgeFunctionUrl('admin-payout'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'reject', payoutId, reason }),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || '정산 거부에 실패했습니다.');
  }

  return result;
}

// 관리자: 정산 통계 조회
export async function getAdminPayoutStats() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('인증이 필요합니다.');
  }

  const response = await fetch(getEdgeFunctionUrl('admin-payout'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'stats' }),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || '통계 조회에 실패했습니다.');
  }

  return result.stats;
}
