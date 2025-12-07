import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Check, X } from 'lucide-react';

interface SubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  creator: {
    name: string;
    username: string;
    avatar: string;
  };
  subscriptionPrice: number;
  onSubscribe?: () => void;
}

export function SubscriptionDialog({ isOpen, onClose, creator, subscriptionPrice, onSubscribe }: SubscriptionDialogProps) {
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    // 실제 결제 로직이 들어갈 곳
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubscribing(false);
    onSubscribe?.();
    onClose();
  };

  const benefits = [
    "이 사용자의 콘텐츠에 대한 전체 액세스 권한",
    "이 사용자와 모든 메시지 주고받기",
    "언제든지 구독을 취소하시오"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-end mb-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={creator.avatar} alt={creator.name} />
              <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div>
              <DialogTitle className="text-foreground mb-1">{creator.name}</DialogTitle>
              <p className="text-muted-foreground text-sm">@{creator.username}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-foreground mb-4">구독하고 고급한 선물 혜택을 받아보세요.</p>
            
            <div className="space-y-3 text-left">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center mt-0.5">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <span className="text-foreground text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-foreground">월 구독료</span>
              <span className="text-foreground font-semibold">${subscriptionPrice}</span>
            </div>
            <p className="text-muted-foreground text-xs">언제든지 취소 가능</p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleSubscribe}
              disabled={isSubscribing}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubscribing ? '처리 중...' : `$${subscriptionPrice}/월로 구독하기`}
            </Button>
            
            <div className="text-center">
              <Button variant="link" className="text-primary text-sm">
                결제 카드를 추가하시오
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-xs">
              구독하여 세뱀버 야긌 무게 보기
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}