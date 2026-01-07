import { useEffect, useRef, useState } from 'react';
import { PAYPAL_CONFIG, PaymentItem, calculateCreatorEarnings } from '../lib/paypal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface PayPalButtonProps {
  item: PaymentItem;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export function PayPalButton({ item, onSuccess, onError, onCancel }: PayPalButtonProps) {
  const { user } = useAuth();
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // PayPal SDK 로드
  useEffect(() => {
    if (window.paypal) {
      setIsScriptLoaded(true);
      setIsLoading(false);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CONFIG.clientId}&currency=${PAYPAL_CONFIG.currency}`;
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      setIsLoading(false);
    };
    script.onerror = () => {
      setIsLoading(false);
      onError?.('PayPal SDK 로드 실패');
    };
    document.body.appendChild(script);

    return () => {
      // 클린업 시 스크립트 제거하지 않음 (재사용)
    };
  }, []);

  // PayPal 버튼 렌더링
  useEffect(() => {
    if (!isScriptLoaded || !paypalRef.current || !window.paypal) return;

    // 기존 버튼 제거
    paypalRef.current.innerHTML = '';

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'pay',
        height: 45,
      },
      createOrder: (_data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            description: item.description,
            amount: {
              currency_code: PAYPAL_CONFIG.currency,
              value: item.amount.toFixed(2),
            },
          }],
        });
      },
      onApprove: async (_data: any, actions: any) => {
        try {
          const order = await actions.order.capture();
          
          // 결제 정보 DB 저장
          const creatorEarnings = calculateCreatorEarnings(item.amount);
          const platformFee = item.amount - creatorEarnings;

          const { data: payment, error } = await supabase
            .from('payments')
            .insert({
              user_id: user?.id,
              creator_id: item.creatorId,
              amount: item.amount,
              creator_amount: creatorEarnings,
              platform_fee: platformFee,
              type: item.type,
              status: 'completed',
              paypal_order_id: order.id,
              paypal_payer_id: order.payer?.payer_id,
              description: item.description,
            })
            .select()
            .single();

          if (error) throw error;

          // 콘텐츠 구매인 경우 content_purchases에도 기록
          if (item.type === 'content') {
            await supabase.from('content_purchases').insert({
              user_id: user?.id,
              feed_id: item.id,
              payment_id: payment.id,
            });
          }

          // 구독인 경우 subscriptions 테이블 업데이트
          if (item.type === 'subscription') {
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);
            
            await supabase.from('subscriptions').upsert({
              user_id: user?.id,
              creator_id: item.creatorId,
              tier_id: item.id,
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: endDate.toISOString(),
            });
          }

          toast.success('결제가 완료되었습니다!');
          onSuccess?.(payment.id);
        } catch (error: any) {
          console.error('Payment error:', error);
          toast.error('결제 처리 중 오류가 발생했습니다.');
          onError?.(error.message);
        }
      },
      onCancel: () => {
        toast.info('결제가 취소되었습니다.');
        onCancel?.();
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
        toast.error('결제 중 오류가 발생했습니다.');
        onError?.(err.message);
      },
    }).render(paypalRef.current);
  }, [isScriptLoaded, item, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <div ref={paypalRef} className="w-full" />;
}

