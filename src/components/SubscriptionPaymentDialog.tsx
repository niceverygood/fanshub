import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { PayPalButton } from './PayPalButton';
import { calculateCreatorEarnings } from '../lib/paypal';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Crown, Check } from 'lucide-react';
import { Badge } from './ui/badge';

interface SubscriptionPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  creator: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  tier: {
    id: string;
    name: string;
    price: number;
    benefits: string[];
  };
  onSuccess?: () => void;
}

export function SubscriptionPaymentDialog({ 
  isOpen, 
  onClose, 
  creator,
  tier,
  onSuccess 
}: SubscriptionPaymentDialogProps) {
  const creatorEarnings = calculateCreatorEarnings(tier.price);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            구독하기
          </DialogTitle>
          <DialogDescription>
            월 구독으로 크리에이터의 모든 콘텐츠를 즐기세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 크리에이터 정보 */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={creator.avatar} />
              <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{creator.name}</p>
              <p className="text-sm text-muted-foreground">@{creator.username}</p>
            </div>
          </div>

          {/* 구독 등급 정보 */}
          <div className="p-4 border border-primary/30 bg-primary/5 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                {tier.name}
              </Badge>
              <span className="text-2xl font-bold">${tier.price}/월</span>
            </div>
            
            <div className="space-y-2">
              {tier.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 수익 분배 정보 */}
          <div className="text-xs text-muted-foreground p-3 bg-muted/20 rounded-lg space-y-1">
            <div className="flex justify-between">
              <span>크리에이터 수익 (70%)</span>
              <span>${creatorEarnings.toFixed(2)}/월</span>
            </div>
            <div className="flex justify-between">
              <span>플랫폼 수수료 (30%)</span>
              <span>${(tier.price - creatorEarnings).toFixed(2)}/월</span>
            </div>
          </div>

          {/* PayPal 결제 버튼 */}
          <PayPalButton
            item={{
              id: tier.id,
              type: 'subscription',
              creatorId: creator.id,
              amount: tier.price,
              description: `${creator.name} - ${tier.name} 월 구독`,
            }}
            onSuccess={() => {
              onSuccess?.();
              onClose();
            }}
            onCancel={onClose}
          />

          <p className="text-xs text-center text-muted-foreground">
            구독은 매월 자동 갱신됩니다. 언제든지 취소할 수 있습니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

