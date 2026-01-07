import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { PayPalButton } from './PayPalButton';
import { PAYPAL_CONFIG, calculateCreatorEarnings } from '../lib/paypal';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Lock, DollarSign } from 'lucide-react';

interface ContentPurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    id: string;
    creatorId: string;
    creatorName: string;
    creatorAvatar?: string;
    title: string;
    price: number;
    previewImage?: string;
  };
  onSuccess?: () => void;
}

export function ContentPurchaseDialog({ 
  isOpen, 
  onClose, 
  content,
  onSuccess 
}: ContentPurchaseDialogProps) {
  const creatorEarnings = calculateCreatorEarnings(content.price);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            콘텐츠 구매
          </DialogTitle>
          <DialogDescription>
            이 콘텐츠를 구매하면 영구적으로 접근할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 콘텐츠 미리보기 */}
          {content.previewImage && (
            <div className="relative rounded-lg overflow-hidden">
              <img 
                src={content.previewImage} 
                alt={content.title}
                className="w-full h-40 object-cover blur-lg"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>
          )}

          {/* 크리에이터 정보 */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={content.creatorAvatar} />
              <AvatarFallback>{content.creatorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{content.creatorName}</p>
              <p className="text-sm text-muted-foreground">{content.title}</p>
            </div>
          </div>

          {/* 가격 정보 */}
          <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">콘텐츠 가격</span>
              <span className="text-2xl font-bold">${content.price.toFixed(2)}</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>크리에이터 수익 (70%)</span>
                <span>${creatorEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>플랫폼 수수료 (30%)</span>
                <span>${(content.price - creatorEarnings).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* PayPal 결제 버튼 */}
          <PayPalButton
            item={{
              id: content.id,
              type: 'content',
              creatorId: content.creatorId,
              amount: content.price,
              description: `${content.creatorName} - ${content.title}`,
            }}
            onSuccess={() => {
              onSuccess?.();
              onClose();
            }}
            onCancel={onClose}
          />

          <p className="text-xs text-center text-muted-foreground">
            PayPal 또는 카드로 안전하게 결제됩니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

