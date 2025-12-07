import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Lock, DollarSign } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PaymentDialog } from './PaymentDialog';

interface PostCardProps {
  creator: {
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
  };
  content: {
    text: string;
    image?: string;
  };
  timestamp: string;
  isBlurred?: boolean;
  price?: number;
  onCreatorClick?: (creator: any) => void;
}

export function PostCard({ creator, content, timestamp, isBlurred = false, price, onCreatorClick }: PostCardProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const handleUnlock = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (price) {
      setShowPaymentDialog(true);
    } else {
      setIsUnlocked(true);
    }
  };

  const handlePaymentSuccess = () => {
    setIsUnlocked(true);
    setShowPaymentDialog(false);
  };

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCreatorClick) {
      onCreatorClick(creator);
    }
  };

  const shouldShowBlur = isBlurred && !isUnlocked;

  return (
    <Card className="bg-card border-border mb-6">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleCreatorClick}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={creator.avatar} alt={creator.name} />
              <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-card-foreground hover:text-primary transition-colors">{creator.name}</span>
                {creator.verified && (
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">✓</span>
                  </div>
                )}
              </div>
              <span className="text-sm text-muted-foreground">@{creator.username}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {price && (
              <span className="text-sm font-medium text-primary">${price}</span>
            )}
            <span className="text-sm text-muted-foreground">{timestamp}</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-card-foreground mb-4">{content.text}</p>
          {content.image && (
            <div className="relative rounded-lg overflow-hidden">
              <ImageWithFallback
                src={content.image}
                alt="Post content"
                className={`w-full max-h-96 object-cover transition-all duration-300 ${
                  shouldShowBlur ? 'blur-lg scale-105' : ''
                }`}
              />
              {shouldShowBlur && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 flex flex-col items-center justify-center">
                  {/* Lock Icon with Glow Effect */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg animate-pulse"></div>
                    <div className="relative bg-black/80 backdrop-blur-sm rounded-full p-4 border border-white/20">
                      <Lock className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Price Display */}
                  {price && (
                    <div className="text-center mb-6">
                      <div className="text-white text-3xl font-bold mb-1 drop-shadow-lg">
                        ${price}
                      </div>
                      <div className="text-white/80 text-sm">프리미엄 콘텐츠</div>
                    </div>
                  )}
                  
                  {/* Unlock Button */}
                  <Button 
                    onClick={handleUnlock}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 px-8 py-3"
                  >
                    <DollarSign className="h-5 w-5 mr-2" />
                    ${price} 결제하고 보기
                  </Button>
                  
                  {/* Additional Info */}
                  <div className="text-white/60 text-xs mt-4 text-center">
                    일회성 결제로 영구 접근
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-red-500">
              <Heart className="h-5 w-5" />
              좋아요
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-card-foreground">
              <MessageCircle className="h-5 w-5" />
              댓글달기
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-card-foreground"
            onClick={(e) => {
              e.stopPropagation();
              // 컬렉션 저장 기능이 추가될 예정
              console.log('컬렉션에 저장');
            }}
          >
            <Bookmark className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
      
      {/* Payment Dialog */}
      {price && (
        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          creator={creator}
          price={price}
          contentPreview={content.text}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </Card>
  );
}