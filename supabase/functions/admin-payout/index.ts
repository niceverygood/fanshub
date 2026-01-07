// Supabase Edge Function - Admin Payout Management
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authorization 헤더에서 JWT 토큰 추출
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header required')
    }

    // Supabase 클라이언트 생성 (서비스 롤)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 사용자 인증 확인
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // 관리자 권한 확인 (users 테이블에 is_admin 컬럼 필요)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.is_admin) {
      throw new Error('Admin access required')
    }

    // 요청 본문 파싱
    const { action, payoutId } = await req.json()

    if (!action || !payoutId) {
      throw new Error('action and payoutId are required')
    }

    switch (action) {
      case 'list': {
        // 대기중인 정산 요청 목록 조회
        const { data: payouts, error } = await supabaseAdmin
          .from('payouts')
          .select(`
            *,
            creator:users!creator_id (
              id,
              username,
              name,
              email,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, payouts }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'approve': {
        // 정산 승인 - process-payout 함수 호출
        const processPayoutUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/process-payout`
        
        const response = await fetch(processPayoutUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ payoutId }),
        })

        const result = await response.json()
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'reject': {
        // 정산 거부
        const { reason } = await req.json()
        
        const { error } = await supabaseAdmin
          .from('payouts')
          .update({
            status: 'cancelled',
            error_message: reason || '관리자에 의해 거부됨',
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', payoutId)

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, message: 'Payout rejected' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'stats': {
        // 정산 통계
        const { data: stats } = await supabaseAdmin
          .from('payouts')
          .select('status, net_amount')

        const summary = {
          total: stats?.length || 0,
          pending: stats?.filter(p => p.status === 'pending').length || 0,
          processing: stats?.filter(p => p.status === 'processing').length || 0,
          completed: stats?.filter(p => p.status === 'completed').length || 0,
          failed: stats?.filter(p => p.status === 'failed').length || 0,
          totalPaidOut: stats
            ?.filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + (p.net_amount || 0), 0) || 0,
          pendingAmount: stats
            ?.filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + (p.net_amount || 0), 0) || 0,
        }

        return new Response(
          JSON.stringify({ success: true, stats: summary }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: error.message === 'Unauthorized' || error.message === 'Admin access required' ? 403 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

