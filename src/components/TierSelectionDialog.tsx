import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Check, X, Crown, Star, Diamond, Zap } from 'lucide-react';
import { SubscriptionTier, SUBSCRIPTION_TIERS } from '../types/subscription';

interface TierSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  creator: {
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
  };
  availableTiers: SubscriptionTier[];
  onSubscribe: (tier: SubscriptionTier) => void;
}

export function TierSelectionDialog({ 
  isOpen, 
  onClose, 
  creator, 
  availableTiers, 
  onSubscribe 
}: TierSelectionDialogProps) {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const getTierIcon = (tierId: string) => {
    const iconProps = { className: "h-5 w-5" };
    
    switch (tierId) {
      case 'basic':
        return <Zap {...iconProps} />;
      case 'silver':
        return <Star {...iconProps} />;
      case 'gold':
        return <Crown {...iconProps} />;
      case 'platinum':
        return <Diamond {...iconProps} />;
      default:
        return <Star {...iconProps} />;
    }
  };

  const handleTierSelect = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
  };

  const handleSubscribe = async () => {
    if (!selectedTier) return;
    
    setIsSubscribing(true);
    // 실제 결제 로직이 들어갈 곳
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubscribing(false);
    onSubscribe(selectedTier);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={creator.avatar} alt={creator.name} />
                <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-foreground">{creator.name}</DialogTitle>
                  {creator.verified && (
                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">@{creator.username}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">구독 등급을 선택하세요</h3>
            <p className="text-muted-foreground text-sm">
              등급에 따라 다른 콘텐츠와 혜택을 받을 수 있습니다.
            </p>
          </div>

          {/* Tier Selection */}
          <div className="grid gap-4">
            {availableTiers.map((tier) => (
              <Card 
                key={tier.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedTier?.id === tier.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleTierSelect(tier)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-full"
                        style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
                      >
                        {getTierIcon(tier.id)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{tier.name}</h4>
                          <Badge 
                            style={{ backgroundColor: tier.color, color: 'white' }}
                          >
                            ${tier.price}/월
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">{tier.description}</p>
                      </div>
                    </div>
                    {selectedTier?.id === tier.id && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2">
                    {tier.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5" 
                             style={{ backgroundColor: `${tier.color}20` }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tier.color }}></div>
                        </div>
                        <span className="text-foreground text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Tier Summary */}
          {selectedTier && (
            <Card className="bg-muted/50 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground font-medium">선택된 등급</span>
                  <div className="flex items-center gap-2">
                    <span style={{ color: selectedTier.color }} className="font-semibold">
                      {selectedTier.name}
                    </span>
                    <Badge style={{ backgroundColor: selectedTier.color, color: 'white' }}>
                      ${selectedTier.price}/월
                    </Badge>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  언제든지 등급을 변경하거나 구독을 취소할 수 있습니다.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleSubscribe}
              disabled={!selectedTier || isSubscribing}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubscribing 
                ? '처리 중...' 
                : selectedTier 
                  ? `${selectedTier.name} 등급으로 구독하기 ($${selectedTier.price}/월)`
                  : '등급을 선택하세요'
              }
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full border-border text-foreground hover:bg-muted"
            >
              취소
            </Button>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-xs">
              구독 시 자동 갱신되며, 설정에서 언제든지 취소할 수 있습니다.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}