// Supabase Edge Function - PayPal Payout Processing
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// PayPal API 설정
const PAYPAL_API_BASE = Deno.env.get('PAYPAL_MODE') === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com'

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')!
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET')!

// PayPal Access Token 발급
async function getPayPalAccessToken(): Promise<string> {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal auth failed: ${error}`)
  }

  const data = await response.json()
  return data.access_token
}

// PayPal Payout 실행
async function executePayPalPayout(
  accessToken: string,
  payoutId: string,
  email: string,
  amount: number,
  currency: string = 'USD'
): Promise<{ batchId: string; status: string }> {
  const senderBatchId = `payout_${payoutId}_${Date.now()}`
  
  const payoutData = {
    sender_batch_header: {
      sender_batch_id: senderBatchId,
      email_subject: 'FansHub 수익금 정산',
      email_message: 'FansHub에서 수익금이 정산되었습니다.',
    },
    items: [
      {
        recipient_type: 'EMAIL',
        amount: {
          value: amount.toFixed(2),
          currency: currency,
        },
        receiver: email,
        note: `FansHub Payout - ${payoutId}`,
        sender_item_id: payoutId,
      },
    ],
  }

  const response = await fetch(`${PAYPAL_API_BASE}/v1/payments/payouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payoutData),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('PayPal Payout Error:', error)
    throw new Error(error.message || error.details?.[0]?.issue || 'PayPal payout failed')
  }

  const result = await response.json()
  return {
    batchId: result.batch_header.payout_batch_id,
    status: result.batch_header.batch_status,
  }
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabase 클라이언트 생성
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 요청 본문 파싱
    const { payoutId, action } = await req.json()

    if (!payoutId) {
      throw new Error('payoutId is required')
    }

    // 정산 요청 조회
    const { data: payout, error: fetchError } = await supabaseClient
      .from('payouts')
      .select('*')
      .eq('id', payoutId)
      .single()

    if (fetchError || !payout) {
      throw new Error('Payout not found')
    }

    // 이미 처리된 정산인지 확인
    if (payout.status === 'completed') {
      return new Response(
        JSON.stringify({ success: false, error: 'Payout already completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (payout.status === 'processing') {
      return new Response(
        JSON.stringify({ success: false, error: 'Payout is being processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 정산 상태를 'processing'으로 업데이트
    await supabaseClient
      .from('payouts')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', payoutId)

    try {
      // PayPal Access Token 발급
      const accessToken = await getPayPalAccessToken()

      // PayPal Payout 실행
      const result = await executePayPalPayout(
        accessToken,
        payoutId,
        payout.paypal_email,
        payout.net_amount
      )

      // 성공 시 상태 업데이트
      await supabaseClient
        .from('payouts')
        .update({
          status: 'completed',
          paypal_batch_id: result.batchId,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', payoutId)

      return new Response(
        JSON.stringify({
          success: true,
          batchId: result.batchId,
          status: result.status,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (paypalError: any) {
      // PayPal 오류 시 상태를 'failed'로 업데이트
      await supabaseClient
        .from('payouts')
        .update({
          status: 'failed',
          error_message: paypalError.message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payoutId)

      throw paypalError
    }
  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

