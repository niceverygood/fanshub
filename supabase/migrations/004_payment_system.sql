-- 결제 시스템 스키마 업데이트

-- payments 테이블에 필요한 컬럼 추가
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS creator_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
ADD COLUMN IF NOT EXISTS paypal_payer_id TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- 콘텐츠 구매 기록 테이블
CREATE TABLE IF NOT EXISTS public.content_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  feed_id UUID REFERENCES public.feeds(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feed_id)
);

-- 구독 테이블 업데이트
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- 월정산 기록 테이블
CREATE TABLE IF NOT EXISTS public.monthly_settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL, -- '2024-01' 형식
  total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  subscription_earnings DECIMAL(10,2) DEFAULT 0,
  content_earnings DECIMAL(10,2) DEFAULT 0,
  tip_earnings DECIMAL(10,2) DEFAULT 0,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payout_id UUID REFERENCES public.payouts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  UNIQUE(creator_id, year_month)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_content_purchases_user ON public.content_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_content_purchases_feed ON public.content_purchases(feed_id);
CREATE INDEX IF NOT EXISTS idx_monthly_settlements_creator ON public.monthly_settlements(creator_id);
CREATE INDEX IF NOT EXISTS idx_monthly_settlements_month ON public.monthly_settlements(year_month);
CREATE INDEX IF NOT EXISTS idx_payments_creator ON public.payments(creator_id);
CREATE INDEX IF NOT EXISTS idx_payments_created ON public.payments(created_at);

-- RLS 정책
ALTER TABLE public.content_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_settlements ENABLE ROW LEVEL SECURITY;

-- 콘텐츠 구매 RLS
CREATE POLICY "Users can view own purchases"
  ON public.content_purchases FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert purchases"
  ON public.content_purchases FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 월정산 RLS
CREATE POLICY "Creators can view own settlements"
  ON public.monthly_settlements FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

-- 결제 RLS 업데이트
CREATE POLICY "Users can insert payments"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR creator_id = auth.uid());

-- 콘텐츠 구매 여부 확인 함수
CREATE OR REPLACE FUNCTION public.has_purchased_content(p_user_id UUID, p_feed_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.content_purchases 
    WHERE user_id = p_user_id AND feed_id = p_feed_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 구독 여부 확인 함수
CREATE OR REPLACE FUNCTION public.is_subscribed_to(p_user_id UUID, p_creator_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = p_user_id 
    AND creator_id = p_creator_id 
    AND status = 'active'
    AND current_period_end > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 월별 정산 생성 함수 (매월 1일 실행)
CREATE OR REPLACE FUNCTION public.generate_monthly_settlements()
RETURNS void AS $$
DECLARE
  last_month TEXT;
  creator RECORD;
BEGIN
  -- 지난 달 (YYYY-MM 형식)
  last_month := TO_CHAR(NOW() - INTERVAL '1 month', 'YYYY-MM');
  
  -- 모든 크리에이터에 대해 정산 생성
  FOR creator IN 
    SELECT DISTINCT creator_id FROM public.payments 
    WHERE status = 'completed' 
    AND TO_CHAR(created_at, 'YYYY-MM') = last_month
  LOOP
    INSERT INTO public.monthly_settlements (
      creator_id,
      year_month,
      total_earnings,
      subscription_earnings,
      content_earnings,
      tip_earnings,
      platform_fee,
      net_amount
    )
    SELECT 
      creator.creator_id,
      last_month,
      COALESCE(SUM(creator_amount), 0),
      COALESCE(SUM(CASE WHEN type = 'subscription' THEN creator_amount ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN type = 'content' THEN creator_amount ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN type = 'tip' THEN creator_amount ELSE 0 END), 0),
      COALESCE(SUM(platform_fee), 0),
      COALESCE(SUM(creator_amount), 0)
    FROM public.payments
    WHERE creator_id = creator.creator_id
    AND status = 'completed'
    AND TO_CHAR(created_at, 'YYYY-MM') = last_month
    ON CONFLICT (creator_id, year_month) DO UPDATE SET
      total_earnings = EXCLUDED.total_earnings,
      subscription_earnings = EXCLUDED.subscription_earnings,
      content_earnings = EXCLUDED.content_earnings,
      tip_earnings = EXCLUDED.tip_earnings,
      platform_fee = EXCLUDED.platform_fee,
      net_amount = EXCLUDED.net_amount;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

