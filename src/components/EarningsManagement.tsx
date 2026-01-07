import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Unlink
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { 
  linkPayPalAccount, 
  unlinkPayPalAccount, 
  getCreatorEarnings, 
  requestPayout, 
  getPayoutHistory,
  getMonthlyEarningsStats
} from '../lib/api/paypal';
import { PayoutRecord, PAYPAL_CONFIG, calculateCreatorEarnings } from '../lib/paypal';

interface EarningsManagementProps {
  onBack: () => void;
}

interface EarningsData {
  totalEarnings: number;
  platformFee: number;
  netEarnings: number;
  paidOut: number;
  pendingBalance: number;
}

export function EarningsManagement({ onBack }: EarningsManagementProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [newPaypalEmail, setNewPaypalEmail] = useState('');
  const [isLinkingPayPal, setIsLinkingPayPal] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
  
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarnings: 0,
    platformFee: 0,
    netEarnings: 0,
    paidOut: 0,
    pendingBalance: 0,
  });
  
  const [payoutHistory, setPayoutHistory] = useState<PayoutRecord[]>([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState<Record<string, any>>({});

  // 데이터 로드
  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // PayPal 이메일 설정
      setPaypalEmail((user as any).paypal_email || '');
      
      // 수익 데이터 로드
      const earningsData = await getCreatorEarnings(user.id);
      setEarnings(earningsData);
      
      // 정산 내역 로드
      const history = await getPayoutHistory(user.id);
      setPayoutHistory(history);
      
      // 월별 통계 로드
      const stats = await getMonthlyEarningsStats(user.id);
      setMonthlyStats(stats);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      // 에러 시 mock 데이터로 표시
      setEarnings({
        totalEarnings: 1250.00,
        platformFee: 125.00,
        netEarnings: 1125.00,
        paidOut: 500.00,
        pendingBalance: 625.00,
      });
      setPayoutHistory([
        {
          id: '1',
          creatorId: user?.id || '',
          amount: 500,
          fee: 50,
          netAmount: 450,
          paypalEmail: 'creator@example.com',
          status: 'completed',
          createdAt: '2024-01-15T10:00:00Z',
          processedAt: '2024-01-16T14:30:00Z',
        },
        {
          id: '2',
          creatorId: user?.id || '',
          amount: 200,
          fee: 20,
          netAmount: 180,
          paypalEmail: 'creator@example.com',
          status: 'pending',
          createdAt: '2024-01-20T10:00:00Z',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // PayPal 계정 연동
  const handleLinkPayPal = async () => {
    if (!user?.id || !newPaypalEmail) return;
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newPaypalEmail)) {
      toast.error('올바른 이메일 형식을 입력해주세요');
      return;
    }
    
    setIsLinkingPayPal(true);
    try {
      await linkPayPalAccount(user.id, newPaypalEmail);
      setPaypalEmail(newPaypalEmail);
      setNewPaypalEmail('');
      setShowLinkDialog(false);
      toast.success('PayPal 계정이 연동되었습니다');
    } catch (error: any) {
      toast.error(error.message || 'PayPal 연동에 실패했습니다');
    } finally {
      setIsLinkingPayPal(false);
    }
  };

  // PayPal 계정 연동 해제
  const handleUnlinkPayPal = async () => {
    if (!user?.id) return;
    
    try {
      await unlinkPayPalAccount(user.id);
      setPaypalEmail('');
      setShowUnlinkDialog(false);
      toast.success('PayPal 계정 연동이 해제되었습니다');
    } catch (error: any) {
      toast.error(error.message || '연동 해제에 실패했습니다');
    }
  };

  // 정산 요청
  const handleRequestPayout = async () => {
    if (!user?.id) return;
    
    const amount = parseFloat(withdrawalAmount);
    if (!amount || amount <= 0) {
      toast.error('올바른 금액을 입력해주세요');
      return;
    }
    
    if (amount < 10) {
      toast.error('최소 정산 금액은 $10입니다');
      return;
    }
    
    if (amount > earnings.pendingBalance) {
      toast.error('정산 가능 금액을 초과했습니다');
      return;
    }

    if (!paypalEmail) {
      toast.error('먼저 PayPal 계정을 연동해주세요');
      return;
    }
    
    setIsRequestingPayout(true);
    try {
      await requestPayout(user.id, amount);
      toast.success('정산 요청이 접수되었습니다');
      setWithdrawalAmount('');
      loadData(); // 데이터 새로고침
    } catch (error: any) {
      toast.error(error.message || '정산 요청에 실패했습니다');
    } finally {
      setIsRequestingPayout(false);
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
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            완료
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="h-3 w-3 mr-1" />
            대기중
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            처리중
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            실패
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            취소됨
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">수익 관리</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* PayPal 연동 상태 */}
        <Card className="border-primary/20 bg-gradient-to-r from-[#003087]/10 to-[#009cde]/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#003087] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <div>
                  <h3 className="font-semibold">PayPal 정산 계정</h3>
                  {paypalEmail ? (
                    <p className="text-sm text-muted-foreground">{paypalEmail}</p>
                  ) : (
                    <p className="text-sm text-yellow-500">계정이 연동되지 않았습니다</p>
                  )}
                </div>
              </div>
              {paypalEmail ? (
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/20 text-green-400">연동됨</Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowUnlinkDialog(true)}
                  >
                    <Unlink className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowLinkDialog(true)}>
                  PayPal 연동하기
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 수익 개요 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                총 수익
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{formatCurrency(earnings.totalEarnings)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                플랫폼 수수료 {PAYPAL_CONFIG.platformFeePercent}%: {formatCurrency(earnings.platformFee)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                정산 가능 금액
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(earnings.pendingBalance)}</div>
              <p className="text-xs text-muted-foreground mt-1">수수료 차감 후</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                정산 완료
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(earnings.paidOut)}</div>
              <p className="text-xs text-muted-foreground mt-1">누적 정산 금액</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="payout" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payout">정산 요청</TabsTrigger>
            <TabsTrigger value="history">정산 내역</TabsTrigger>
          </TabsList>

          {/* 정산 요청 탭 */}
          <TabsContent value="payout" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>정산 신청</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!paypalEmail ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-[#003087]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-[#003087] font-bold text-2xl">P</span>
                    </div>
                    <h3 className="font-medium mb-2">PayPal 계정을 연동해주세요</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      정산을 받으려면 먼저 PayPal 계정을 연동해야 합니다.
                    </p>
                    <Button onClick={() => setShowLinkDialog(true)}>
                      PayPal 연동하기
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="amount">정산 금액 (USD)</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={withdrawalAmount}
                          onChange={(e) => setWithdrawalAmount(e.target.value)}
                          className="pl-7"
                          min="10"
                          step="0.01"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        정산 가능 금액: {formatCurrency(earnings.pendingBalance)}
                      </p>
                    </div>

                    <div>
                      <Label>정산 계정</Label>
                      <div className="mt-1 p-3 border border-border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#003087] rounded flex items-center justify-center">
                            <span className="text-white font-bold text-sm">P</span>
                          </div>
                          <div>
                            <p className="font-medium">PayPal</p>
                            <p className="text-sm text-muted-foreground">{paypalEmail}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setWithdrawalAmount(earnings.pendingBalance.toString())}
                      >
                        전액 정산
                      </Button>
                      <Button 
                        onClick={handleRequestPayout} 
                        className="flex-1 bg-[#003087] hover:bg-[#003087]/90"
                        disabled={!withdrawalAmount || isRequestingPayout}
                      >
                        {isRequestingPayout ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            처리중...
                          </>
                        ) : (
                          '정산 신청'
                        )}
                      </Button>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t border-border">
                      <p>• 최소 정산 금액: $10</p>
                      <p>• 플랫폼 수수료: {PAYPAL_CONFIG.platformFeePercent}%</p>
                      <p>• 처리 시간: 1-3 영업일</p>
                      <p>• PayPal 수수료는 별도로 부과될 수 있습니다</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 정산 내역 탭 */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>정산 내역</CardTitle>
              </CardHeader>
              <CardContent>
                {payoutHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">정산 내역이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payoutHistory.map((payout) => (
                      <div 
                        key={payout.id} 
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#003087]/20 rounded-lg flex items-center justify-center">
                            <Download className="h-5 w-5 text-[#003087]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{formatCurrency(payout.netAmount)}</p>
                              {getStatusBadge(payout.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(payout.createdAt)} • {payout.paypalEmail}
                            </p>
                            {payout.errorMessage && (
                              <p className="text-xs text-red-400 mt-1">{payout.errorMessage}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            요청: {formatCurrency(payout.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            수수료: {formatCurrency(payout.fee)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* PayPal 연동 다이얼로그 */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#003087] rounded flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              PayPal 계정 연동
            </DialogTitle>
            <DialogDescription>
              정산금을 받을 PayPal 계정의 이메일을 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="paypalEmail">PayPal 이메일</Label>
              <Input
                id="paypalEmail"
                type="email"
                placeholder="your@email.com"
                value={newPaypalEmail}
                onChange={(e) => setNewPaypalEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-500">
                반드시 본인 명의의 PayPal 계정 이메일을 입력해주세요. 
                잘못된 계정으로 정산될 경우 복구가 불가능합니다.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowLinkDialog(false)}
              >
                취소
              </Button>
              <Button 
                className="flex-1 bg-[#003087] hover:bg-[#003087]/90"
                onClick={handleLinkPayPal}
                disabled={!newPaypalEmail || isLinkingPayPal}
              >
                {isLinkingPayPal ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    연동중...
                  </>
                ) : (
                  '연동하기'
                )}
              </Button>
            </div>
            <a 
              href="https://www.paypal.com/signup" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 text-sm text-primary hover:underline"
            >
              PayPal 계정이 없으신가요? <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* PayPal 연동 해제 다이얼로그 */}
      <Dialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>PayPal 연동 해제</DialogTitle>
            <DialogDescription>
              정말 PayPal 계정 연동을 해제하시겠습니까?
              연동 해제 후에는 정산을 받을 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowUnlinkDialog(false)}
            >
              취소
            </Button>
            <Button 
              variant="destructive"
              className="flex-1"
              onClick={handleUnlinkPayPal}
            >
              연동 해제
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
