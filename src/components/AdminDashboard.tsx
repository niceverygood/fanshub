import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  ArrowLeft, 
  Users, 
  DollarSign, 
  Image as ImageIcon,
  Eye,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Download,
  RefreshCw,
  Loader2,
  BarChart3,
  Calendar,
  Shield,
  Lock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from './ui/dialog';

// 하드코딩된 관리자 계정
const ADMIN_CREDENTIALS = {
  username: 'niceverygood',
  password: 'Woqjf123!'
};

interface AdminDashboardProps {
  onBack: () => void;
}

interface Creator {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar_url?: string;
  paypal_email?: string;
  is_verified: boolean;
  created_at: string;
  total_feeds: number;
  total_views: number;
  total_earnings: number;
  pending_payout: number;
}

interface PayoutRequest {
  id: string;
  creator_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  paypal_email: string;
  status: string;
  created_at: string;
  creator?: {
    name: string;
    username: string;
    avatar_url?: string;
  };
}

interface Settlement {
  id: string;
  creator_id: string;
  year_month: string;
  total_earnings: number;
  subscription_earnings: number;
  content_earnings: number;
  tip_earnings: number;
  platform_fee: number;
  net_amount: number;
  status: string;
  creator?: {
    name: string;
    username: string;
    avatar_url?: string;
    paypal_email?: string;
  };
}

interface DashboardStats {
  totalCreators: number;
  totalUsers: number;
  totalFeeds: number;
  totalRevenue: number;
  platformFees: number;
  pendingPayouts: number;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // 세션 스토리지에서 로그인 상태 확인
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
      loadDashboardData();
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (loginUsername === ADMIN_CREDENTIALS.username && loginPassword === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      toast.success('관리자 로그인 성공!');
      loadDashboardData();
    } else {
      setLoginError('아이디 또는 비밀번호가 올바르지 않습니다.');
      toast.error('로그인 실패');
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    toast.info('관리자 로그아웃 되었습니다.');
  };
  
  const [stats, setStats] = useState<DashboardStats>({
    totalCreators: 0,
    totalUsers: 0,
    totalFeeds: 0,
    totalRevenue: 0,
    platformFees: 0,
    pendingPayouts: 0,
  });
  
  const [creators, setCreators] = useState<Creator[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // 통계 데이터
      const [
        { count: creatorsCount },
        { count: usersCount },
        { count: feedsCount },
        { data: payments },
        { data: pendingPayoutsData },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_creator', true),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('feeds').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('amount, platform_fee').eq('status', 'completed'),
        supabase.from('payouts').select('net_amount').eq('status', 'pending'),
      ]);

      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const platformFees = payments?.reduce((sum, p) => sum + (p.platform_fee || 0), 0) || 0;
      const pendingPayouts = pendingPayoutsData?.reduce((sum, p) => sum + (p.net_amount || 0), 0) || 0;

      setStats({
        totalCreators: creatorsCount || 0,
        totalUsers: usersCount || 0,
        totalFeeds: feedsCount || 0,
        totalRevenue,
        platformFees,
        pendingPayouts,
      });

      // 크리에이터 목록
      const { data: creatorsData } = await supabase
        .from('users')
        .select('*')
        .eq('is_creator', true)
        .order('created_at', { ascending: false });

      // 각 크리에이터별 통계 가져오기
      const creatorsWithStats = await Promise.all(
        (creatorsData || []).map(async (creator) => {
          const [
            { count: feedCount },
            { data: creatorPayments },
            { data: creatorPayouts },
          ] = await Promise.all([
            supabase.from('feeds').select('*', { count: 'exact', head: true }).eq('creator_id', creator.id),
            supabase.from('payments').select('creator_amount').eq('creator_id', creator.id).eq('status', 'completed'),
            supabase.from('payouts').select('net_amount').eq('creator_id', creator.id).eq('status', 'pending'),
          ]);

          return {
            ...creator,
            total_feeds: feedCount || 0,
            total_views: Math.floor(Math.random() * 10000), // TODO: 실제 조회수 구현
            total_earnings: creatorPayments?.reduce((sum, p) => sum + (p.creator_amount || 0), 0) || 0,
            pending_payout: creatorPayouts?.reduce((sum, p) => sum + (p.net_amount || 0), 0) || 0,
          };
        })
      );

      setCreators(creatorsWithStats);

      // 정산 요청 목록
      const { data: payoutsData } = await supabase
        .from('payouts')
        .select(`
          *,
          creator:users!creator_id (name, username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      setPayouts(payoutsData || []);

      // 월정산 목록
      const { data: settlementsData } = await supabase
        .from('monthly_settlements')
        .select(`
          *,
          creator:users!creator_id (name, username, avatar_url, paypal_email)
        `)
        .order('year_month', { ascending: false });

      setSettlements(settlementsData || []);

    } catch (error) {
      console.error('Dashboard load error:', error);
      toast.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePayout = async (payoutId: string) => {
    setProcessingId(payoutId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-payout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ payoutId }),
        }
      );

      const result = await response.json();
      
      if (result.success) {
        toast.success('정산이 승인되었습니다.');
        loadDashboardData();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || '정산 승인에 실패했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectPayout = async (payoutId: string) => {
    setProcessingId(payoutId);
    try {
      await supabase
        .from('payouts')
        .update({ 
          status: 'cancelled', 
          error_message: '관리자에 의해 거부됨',
          processed_at: new Date().toISOString()
        })
        .eq('id', payoutId);

      toast.success('정산이 거부되었습니다.');
      loadDashboardData();
    } catch (error) {
      toast.error('정산 거부에 실패했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleGenerateSettlements = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monthly-settlement`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'generate' }),
        }
      );

      const result = await response.json();
      
      if (result.success) {
        toast.success(`${result.month} 월정산이 생성되었습니다.`);
        loadDashboardData();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || '월정산 생성에 실패했습니다.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="h-3 w-3 mr-1" />완료</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400"><Clock className="h-3 w-3 mr-1" />대기</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/20 text-blue-400"><Loader2 className="h-3 w-3 mr-1 animate-spin" />처리중</Badge>;
      case 'failed':
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400"><XCircle className="h-3 w-3 mr-1" />실패</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredCreators = creators.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 관리자 로그인 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl">관리자 로그인</CardTitle>
            <p className="text-sm text-muted-foreground">
              관리자 계정으로 로그인해주세요.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-username">아이디</Label>
                <Input
                  id="admin-username"
                  type="text"
                  placeholder="관리자 아이디"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">비밀번호</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="비밀번호"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              {loginError && (
                <p className="text-sm text-red-500 text-center">{loginError}</p>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
                  취소
                </Button>
                <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
                  <Lock className="h-4 w-4 mr-2" />
                  로그인
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">관리자 대시보드</h1>
              <p className="text-sm text-muted-foreground">FansHub 관리</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={loadDashboardData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
            <Button onClick={handleAdminLogout} variant="destructive" size="sm">
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs">크리에이터</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalCreators}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs">전체 유저</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <ImageIcon className="h-4 w-4" />
                <span className="text-xs">총 피드</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalFeeds}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">총 매출</span>
              </div>
              <p className="text-2xl font-bold text-green-500">{formatCurrency(stats.totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">플랫폼 수익</span>
              </div>
              <p className="text-2xl font-bold text-primary">{formatCurrency(stats.platformFees)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs">대기 정산</span>
              </div>
              <p className="text-2xl font-bold text-yellow-500">{formatCurrency(stats.pendingPayouts)}</p>
            </CardContent>
          </Card>
        </div>

        {/* 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="creators">크리에이터 관리</TabsTrigger>
            <TabsTrigger value="payouts">정산 요청</TabsTrigger>
            <TabsTrigger value="settlements">월정산</TabsTrigger>
          </TabsList>

          {/* 크리에이터 관리 */}
          <TabsContent value="creators" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="크리에이터 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr className="text-left text-sm text-muted-foreground">
                        <th className="p-4">크리에이터</th>
                        <th className="p-4">피드</th>
                        <th className="p-4">조회수</th>
                        <th className="p-4">총 수익</th>
                        <th className="p-4">대기 정산</th>
                        <th className="p-4">PayPal</th>
                        <th className="p-4">가입일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCreators.map((creator) => (
                        <tr 
                          key={creator.id} 
                          className="border-b border-border hover:bg-muted/30 cursor-pointer"
                          onClick={() => setSelectedCreator(creator)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={creator.avatar_url} />
                                <AvatarFallback>{creator.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{creator.name}</p>
                                <p className="text-sm text-muted-foreground">@{creator.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">{creator.total_feeds}</td>
                          <td className="p-4">{creator.total_views.toLocaleString()}</td>
                          <td className="p-4 text-green-500">{formatCurrency(creator.total_earnings)}</td>
                          <td className="p-4 text-yellow-500">{formatCurrency(creator.pending_payout)}</td>
                          <td className="p-4">
                            {creator.paypal_email ? (
                              <Badge className="bg-green-500/20 text-green-400">연동됨</Badge>
                            ) : (
                              <Badge variant="secondary">미연동</Badge>
                            )}
                          </td>
                          <td className="p-4 text-muted-foreground">{formatDate(creator.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 정산 요청 */}
          <TabsContent value="payouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>정산 요청 목록</span>
                  <Badge variant="secondary">
                    {payouts.filter(p => p.status === 'pending').length}건 대기중
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr className="text-left text-sm text-muted-foreground">
                        <th className="p-4">크리에이터</th>
                        <th className="p-4">요청 금액</th>
                        <th className="p-4">정산 금액</th>
                        <th className="p-4">PayPal</th>
                        <th className="p-4">상태</th>
                        <th className="p-4">요청일</th>
                        <th className="p-4">액션</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((payout) => (
                        <tr key={payout.id} className="border-b border-border">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={payout.creator?.avatar_url} />
                                <AvatarFallback>{payout.creator?.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{payout.creator?.name}</p>
                                <p className="text-xs text-muted-foreground">@{payout.creator?.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">{formatCurrency(payout.amount)}</td>
                          <td className="p-4 font-medium">{formatCurrency(payout.net_amount)}</td>
                          <td className="p-4 text-sm text-muted-foreground">{payout.paypal_email}</td>
                          <td className="p-4">{getStatusBadge(payout.status)}</td>
                          <td className="p-4 text-muted-foreground">{formatDate(payout.created_at)}</td>
                          <td className="p-4">
                            {payout.status === 'pending' && (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprovePayout(payout.id)}
                                  disabled={processingId === payout.id}
                                >
                                  {processingId === payout.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectPayout(payout.id)}
                                  disabled={processingId === payout.id}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 월정산 */}
          <TabsContent value="settlements" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">월정산 관리</h3>
              <Button onClick={handleGenerateSettlements}>
                <Calendar className="h-4 w-4 mr-2" />
                월정산 생성
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr className="text-left text-sm text-muted-foreground">
                        <th className="p-4">크리에이터</th>
                        <th className="p-4">정산월</th>
                        <th className="p-4">구독</th>
                        <th className="p-4">콘텐츠</th>
                        <th className="p-4">팁</th>
                        <th className="p-4">총 수익</th>
                        <th className="p-4">플랫폼 수수료</th>
                        <th className="p-4">정산 금액</th>
                        <th className="p-4">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlements.map((settlement) => (
                        <tr key={settlement.id} className="border-b border-border">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={settlement.creator?.avatar_url} />
                                <AvatarFallback>{settlement.creator?.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{settlement.creator?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {settlement.creator?.paypal_email || '미연동'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-medium">{settlement.year_month}</td>
                          <td className="p-4">{formatCurrency(settlement.subscription_earnings)}</td>
                          <td className="p-4">{formatCurrency(settlement.content_earnings)}</td>
                          <td className="p-4">{formatCurrency(settlement.tip_earnings)}</td>
                          <td className="p-4">{formatCurrency(settlement.total_earnings)}</td>
                          <td className="p-4 text-primary">{formatCurrency(settlement.platform_fee)}</td>
                          <td className="p-4 font-medium text-green-500">{formatCurrency(settlement.net_amount)}</td>
                          <td className="p-4">{getStatusBadge(settlement.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 크리에이터 상세 다이얼로그 */}
      <Dialog open={!!selectedCreator} onOpenChange={() => setSelectedCreator(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>크리에이터 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedCreator && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedCreator.avatar_url} />
                  <AvatarFallback className="text-xl">{selectedCreator.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedCreator.name}</h3>
                  <p className="text-muted-foreground">@{selectedCreator.username}</p>
                  <p className="text-sm text-muted-foreground">{selectedCreator.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{selectedCreator.total_feeds}</p>
                    <p className="text-sm text-muted-foreground">피드</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{selectedCreator.total_views.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">조회수</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-500">{formatCurrency(selectedCreator.total_earnings)}</p>
                    <p className="text-sm text-muted-foreground">총 수익</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-500">{formatCurrency(selectedCreator.pending_payout)}</p>
                    <p className="text-sm text-muted-foreground">대기 정산</p>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">PayPal 정보</h4>
                {selectedCreator.paypal_email ? (
                  <p className="text-sm">{selectedCreator.paypal_email}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">PayPal 계정이 연동되지 않았습니다.</p>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                가입일: {formatDate(selectedCreator.created_at)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

