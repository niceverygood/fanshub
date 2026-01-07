-- PayPal 정산 시스템 테이블

-- users 테이블에 paypal_email 컬럼 추가
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS paypal_email TEXT;

-- 정산(Payouts) 테이블
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL, -- 요청 금액
  fee DECIMAL(10,2) NOT NULL DEFAULT 0, -- 플랫폼 수수료
  net_amount DECIMAL(10,2) NOT NULL, -- 실 정산 금액
  paypal_email TEXT NOT NULL, -- 정산 받을 PayPal 이메일
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  paypal_batch_id TEXT, -- PayPal Payout Batch ID
  error_message TEXT, -- 실패 시 에러 메시지
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_payouts_creator_id ON public.payouts(creator_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created_at ON public.payouts(created_at);

-- payments 테이블에 creator_id 컬럼 추가 (없는 경우)
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES public.users(id);

-- payments 테이블에 type 컬럼 추가 (없는 경우)
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'content' CHECK (type IN ('subscription', 'content', 'tip'));

-- RLS 활성화
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- 정산 RLS 정책
-- 크리에이터는 자신의 정산 내역만 조회 가능
CREATE POLICY "Creators can view own payouts"
  ON public.payouts FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

-- 크리에이터는 정산 요청 생성 가능
CREATE POLICY "Creators can create payout requests"
  ON public.payouts FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

-- 정산 상태 업데이트는 service_role만 가능 (Edge Function에서 처리)

-- users 테이블 paypal_email 업데이트 정책
CREATE POLICY "Users can update own paypal_email"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 크리에이터 수익 통계 뷰
CREATE OR REPLACE VIEW public.creator_earnings_summary AS
SELECT 
  u.id as creator_id,
  u.username,
  u.name,
  u.paypal_email,
  COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as total_earnings,
  COALESCE(SUM(CASE WHEN p.status = 'completed' AND p.type = 'subscription' THEN p.amount ELSE 0 END), 0) as subscription_earnings,
  COALESCE(SUM(CASE WHEN p.status = 'completed' AND p.type = 'content' THEN p.amount ELSE 0 END), 0) as content_earnings,
  COALESCE(SUM(CASE WHEN p.status = 'completed' AND p.type = 'tip' THEN p.amount ELSE 0 END), 0) as tip_earnings,
  COALESCE((SELECT SUM(net_amount) FROM public.payouts WHERE creator_id = u.id AND status = 'completed'), 0) as total_paid_out
FROM public.users u
LEFT JOIN public.payments p ON p.creator_id = u.id
WHERE u.is_creator = true
GROUP BY u.id, u.username, u.name, u.paypal_email;

