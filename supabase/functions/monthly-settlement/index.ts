// 월정산 자동화 Edge Function
// Supabase Cron으로 매월 1일에 실행
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action } = await req.json()

    // 월정산 생성
    if (action === 'generate') {
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      const yearMonth = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`

      // 지난 달 결제 데이터 집계
      const { data: payments } = await supabase
        .from('payments')
        .select('creator_id, creator_amount, platform_fee, type')
        .eq('status', 'completed')
        .gte('created_at', `${yearMonth}-01`)
        .lt('created_at', `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`)

      // 크리에이터별 집계
      const creatorEarnings: Record<string, any> = {}
      
      for (const payment of payments || []) {
        if (!payment.creator_id) continue
        
        if (!creatorEarnings[payment.creator_id]) {
          creatorEarnings[payment.creator_id] = {
            total: 0, subscription: 0, content: 0, tip: 0, platformFee: 0
          }
        }
        
        creatorEarnings[payment.creator_id].total += payment.creator_amount || 0
        creatorEarnings[payment.creator_id].platformFee += payment.platform_fee || 0
        
        if (payment.type === 'subscription') {
          creatorEarnings[payment.creator_id].subscription += payment.creator_amount || 0
        } else if (payment.type === 'content') {
          creatorEarnings[payment.creator_id].content += payment.creator_amount || 0
        } else if (payment.type === 'tip') {
          creatorEarnings[payment.creator_id].tip += payment.creator_amount || 0
        }
      }

      // 월정산 레코드 생성
      for (const [creatorId, earnings] of Object.entries(creatorEarnings)) {
        await supabase.from('monthly_settlements').upsert({
          creator_id: creatorId,
          year_month: yearMonth,
          total_earnings: earnings.total,
          subscription_earnings: earnings.subscription,
          content_earnings: earnings.content,
          tip_earnings: earnings.tip,
          platform_fee: earnings.platformFee,
          net_amount: earnings.total,
          status: 'pending',
        }, { onConflict: 'creator_id,year_month' })
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: `${yearMonth} 월정산 생성 완료`,
        creators: Object.keys(creatorEarnings).length 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 자동 정산 실행 (PayPal 연동된 크리에이터만)
    if (action === 'process') {
      const { data: settlements } = await supabase
        .from('monthly_settlements')
        .select(`
          *,
          creator:users!creator_id (id, paypal_email, name)
        `)
        .eq('status', 'pending')
        .gt('net_amount', 10) // 최소 $10 이상

      let processed = 0
      let failed = 0

      for (const settlement of settlements || []) {
        if (!settlement.creator?.paypal_email) continue

        try {
          // 정산 요청 생성
          const { data: payout } = await supabase
            .from('payouts')
            .insert({
              creator_id: settlement.creator_id,
              amount: settlement.net_amount,
              fee: 0, // 월정산에서는 이미 수수료 차감됨
              net_amount: settlement.net_amount,
              paypal_email: settlement.creator.paypal_email,
              status: 'pending',
            })
            .select()
            .single()

          // 월정산 상태 업데이트
          await supabase
            .from('monthly_settlements')
            .update({ 
              status: 'processing', 
              payout_id: payout?.id 
            })
            .eq('id', settlement.id)

          processed++
        } catch (error) {
          console.error('Settlement error:', error)
          failed++
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        processed,
        failed 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 정산 현황 조회
    if (action === 'status') {
      const { year_month } = await req.json()
      
      const { data } = await supabase
        .from('monthly_settlements')
        .select(`
          *,
          creator:users!creator_id (id, name, username, avatar_url, paypal_email)
        `)
        .eq('year_month', year_month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)
        .order('net_amount', { ascending: false })

      const summary = {
        total: data?.length || 0,
        pending: data?.filter(s => s.status === 'pending').length || 0,
        completed: data?.filter(s => s.status === 'completed').length || 0,
        totalAmount: data?.reduce((sum, s) => sum + (s.net_amount || 0), 0) || 0,
      }

      return new Response(JSON.stringify({ 
        success: true, 
        settlements: data,
        summary 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    throw new Error('Unknown action')
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), 
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

