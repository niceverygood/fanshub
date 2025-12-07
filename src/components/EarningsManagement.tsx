import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  ArrowLeft, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner@2.0.3';

interface EarningsManagementProps {
  onBack: () => void;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  accountType: 'checking' | 'savings';
  isDefault: boolean;
  addedAt: string;
}

interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'fee';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  from?: string;
}

export function EarningsManagement({ onBack }: EarningsManagementProps) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      bankName: '신한은행',
      accountNumber: '110-123-****56',
      accountHolder: '홍길동',
      accountType: 'checking',
      isDefault: true,
      addedAt: '2024-01-15'
    }
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'earning',
      amount: 50000,
      description: 'Fina님 구독료',
      date: '2024-09-24',
      status: 'completed',
      from: 'soofina'
    },
    {
      id: '2',
      type: 'earning',
      amount: 25000,
      description: '유료 콘텐츠 구매',
      date: '2024-09-23',
      status: 'completed',
      from: 'earthlyworm'
    },
    {
      id: '3',
      type: 'withdrawal',
      amount: -60000,
      description: '출금',
      date: '2024-09-20',
      status: 'completed'
    },
    {
      id: '4',
      type: 'fee',
      amount: -5000,
      description: '플랫폼 수수료',
      date: '2024-09-20',
      status: 'completed'
    }
  ]);

  const [newAccount, setNewAccount] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    accountType: 'checking' as const
  });

  const [showAccountNumbers, setShowAccountNumbers] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');

  const totalEarnings = transactions
    .filter(t => t.type === 'earning')
    .reduce((sum, t) => sum + t.amount, 0);

  const availableBalance = totalEarnings - Math.abs(transactions
    .filter(t => t.type === 'withdrawal' || t.type === 'fee')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0));

  const handleAddBankAccount = () => {
    if (!newAccount.bankName || !newAccount.accountNumber || !newAccount.accountHolder) {
      toast.error('모든 필드를 입력해주세요');
      return;
    }

    const account: BankAccount = {
      id: Date.now().toString(),
      ...newAccount,
      accountNumber: newAccount.accountNumber.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-****$3'),
      isDefault: bankAccounts.length === 0,
      addedAt: new Date().toISOString().split('T')[0]
    };

    setBankAccounts(prev => [...prev, account]);
    setNewAccount({
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      accountType: 'checking'
    });
    setIsAddingAccount(false);
    toast.success('계좌가 성공적으로 추가되었습니다');
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawalAmount);
    if (!amount || amount <= 0) {
      toast.error('올바른 금액을 입력해주세요');
      return;
    }
    
    if (amount > availableBalance) {
      toast.error('출금 가능 금액을 초과했습니다');
      return;
    }

    if (bankAccounts.length === 0) {
      toast.error('출금할 계좌를 먼저 등록해주세요');
      return;
    }

    // 실제로는 출금 요청 API 호출
    toast.success('출금 요청이 접수되었습니다. 1-3 영업일 내에 처리됩니다.');
    setWithdrawalAmount('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">완료</Badge>;
      case 'pending':
        return <Badge variant="secondary">처리중</Badge>;
      case 'failed':
        return <Badge variant="destructive">실패</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <Download className="h-4 w-4 text-blue-500" />;
      case 'fee':
        return <CreditCard className="h-4 w-4 text-orange-500" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

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
              <div className="text-2xl font-bold text-green-500">{formatCurrency(totalEarnings)}</div>
              <p className="text-xs text-muted-foreground mt-1">전체 누적 수익</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                출금 가능 금액
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(availableBalance)}</div>
              <p className="text-xs text-muted-foreground mt-1">수수료 차감 후</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                이번 달 수익
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(75000)}</div>
              <p className="text-xs text-green-500 mt-1">+12% 전월 대비</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">거래 내역</TabsTrigger>
            <TabsTrigger value="withdrawal">출금</TabsTrigger>
            <TabsTrigger value="banking">계좌 관리</TabsTrigger>
          </TabsList>

          {/* 거래 내역 탭 */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>최근 거래 내역</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <p className={`font-medium ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                          </p>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 출금 탭 */}
          <TabsContent value="withdrawal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>출금 신청</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">출금 금액</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="출금할 금액을 입력하세요"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    출금 가능 금액: {formatCurrency(availableBalance)}
                  </p>
                </div>

                <div>
                  <Label>출금 계좌</Label>
                  <div className="mt-1">
                    {bankAccounts.length > 0 ? (
                      <div className="p-3 border border-border rounded-lg">
                        <p className="font-medium">{bankAccounts[0].bankName}</p>
                        <p className="text-sm text-muted-foreground">{bankAccounts[0].accountNumber}</p>
                        <p className="text-sm text-muted-foreground">{bankAccounts[0].accountHolder}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">등록된 계좌가 없습니다. 계좌 관리에서 계좌를 추가해주세요.</p>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleWithdraw} 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={!withdrawalAmount || bankAccounts.length === 0}
                >
                  출금 신청
                </Button>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• 출금 수수료: 무료</p>
                  <p>• 처리 시간: 1-3 영업일</p>
                  <p>• 최소 출금 금액: 10,000원</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 계좌 관리 탭 */}
          <TabsContent value="banking" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>등록된 계좌</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAccountNumbers(!showAccountNumbers)}
                    >
                      {showAccountNumbers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Dialog open={isAddingAccount} onOpenChange={setIsAddingAccount}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          계좌 추가
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>새 계좌 추가</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="bankName">은행명</Label>
                            <Select value={newAccount.bankName} onValueChange={(value) => setNewAccount(prev => ({ ...prev, bankName: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="은행을 선택하세요" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="신한은행">신한은행</SelectItem>
                                <SelectItem value="국민은행">국민은행</SelectItem>
                                <SelectItem value="우리은행">우리은행</SelectItem>
                                <SelectItem value="하나은행">하나은행</SelectItem>
                                <SelectItem value="농협은행">농협은행</SelectItem>
                                <SelectItem value="카카오뱅크">카카오뱅크</SelectItem>
                                <SelectItem value="토스뱅크">토스뱅크</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="accountNumber">계좌번호</Label>
                            <Input
                              id="accountNumber"
                              placeholder="계좌번호를 입력하세요"
                              value={newAccount.accountNumber}
                              onChange={(e) => setNewAccount(prev => ({ ...prev, accountNumber: e.target.value }))}
                            />
                          </div>

                          <div>
                            <Label htmlFor="accountHolder">예금주명</Label>
                            <Input
                              id="accountHolder"
                              placeholder="예금주명을 입력하세요"
                              value={newAccount.accountHolder}
                              onChange={(e) => setNewAccount(prev => ({ ...prev, accountHolder: e.target.value }))}
                            />
                          </div>

                          <div>
                            <Label htmlFor="accountType">계좌 종류</Label>
                            <Select value={newAccount.accountType} onValueChange={(value: 'checking' | 'savings') => setNewAccount(prev => ({ ...prev, accountType: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="checking">입출금통장</SelectItem>
                                <SelectItem value="savings">예금통장</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button onClick={handleAddBankAccount} className="w-full">
                            계좌 추가
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {bankAccounts.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">등록된 계좌가 없습니다</p>
                    <p className="text-sm text-muted-foreground mt-1">출금을 위해 계좌를 추가해주세요</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bankAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{account.bankName}</p>
                              {account.isDefault && <Badge variant="outline" className="text-xs">기본</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {showAccountNumbers ? account.accountNumber.replace('****', '') : account.accountNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">{account.accountHolder}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
    </div>
  );
}