import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { CreditCard, Lock, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creator: {
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
  };
  price: number;
  contentPreview: string;
  onPaymentSuccess: () => void;
}

export function PaymentDialog({ 
  open, 
  onOpenChange, 
  creator, 
  price, 
  contentPreview,
  onPaymentSuccess 
}: PaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // 결제 처리 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPaymentComplete(true);
      
      setTimeout(() => {
        onPaymentSuccess();
        toast.success('결제가 완료되었습니다!');
        onOpenChange(false);
        setPaymentComplete(false);
      }, 1500);
      
    } catch (error) {
      toast.error('결제 처리 중 오류가 발생했습니다');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        {paymentComplete ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">결제 완료!</h3>
            <p className="text-muted-foreground">콘텐츠가 잠금 해제되었습니다</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                프리미엄 콘텐츠
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Creator Info */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={creator.avatar} />
                  <AvatarFallback>{creator.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{creator.name}</span>
                    {creator.verified && (
                      <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">✓</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">@{creator.username}</span>
                </div>
              </div>

              {/* Content Preview */}
              <div className="text-center">
                <p className="text-muted-foreground mb-4">{contentPreview}</p>
                <div className="text-2xl font-bold text-primary">${price}</div>
                <p className="text-sm text-muted-foreground mt-1">일회성 결제</p>
              </div>

              {/* Payment Info */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-medium">결제 정보</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>콘텐츠 가격</span>
                    <span>${price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>수수료</span>
                    <span>무료</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>총 결제 금액</span>
                      <span>${price}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Note */}
              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>결제 시 크리에이터의 프리미엄 콘텐츠에 영구적으로 접근할 수 있습니다.</p>
                <p>결제는 안전하게 암호화되어 처리됩니다.</p>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="bg-primary hover:bg-primary/90 min-w-[120px] w-full"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    처리 중...
                  </div>
                ) : (
                  `$${price} 결제하기`
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}