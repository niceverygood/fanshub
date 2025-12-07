import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Lock, DollarSign, Gift, BarChart3, Play, Video, Share2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PaymentDialog } from './PaymentDialog';
import { TipGiftDialog } from './TipGiftDialog';
import { PollQuizDialog } from './PollQuizDialog';
import { toast } from 'sonner';

interface FeedCardProps {
  creator: {
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
  };
  content: {
    text: string;
    image?: string;
    video?: string;
    mediaType?: 'image' | 'video';
  };
  timestamp: string;
  isBlurred?: boolean;
  price?: number;
  onCreatorClick?: (creator: any) => void;
  onFeedClick?: (feed: any) => void;
  onBookmark?: (feed: any) => void;
}

export function FeedCard({ creator, content, timestamp, isBlurred = false, price, onCreatorClick, onFeedClick, onBookmark }: FeedCardProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [showPollDialog, setShowPollDialog] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 100) + 10);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentCount] = useState(Math.floor(Math.random() * 30) + 1);

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

  const handleFeedClick = () => {
    if (onFeedClick) {
      onFeedClick({
        creator,
        content,
        timestamp,
        isBlurred,
        price
      });
    }
  };

  const handleTipSent = (type: 'tip' | 'gift', amount: number, message?: string, giftType?: string) => {
    console.log(`${type} sent:`, { amount, message, giftType, creator: creator.name });
    toast.success(`${creator.name}님에게 ${type === 'tip' ? '팁' : '선물'}을 보냈습니다!`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    if (!isLiked) {
      toast.success('좋아요를 눌렀습니다!');
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    if (!isBookmarked) {
      toast.success('컬렉션에 저장되었습니다!');
      onBookmark?.({ creator, content, timestamp, isBlurred, price });
    } else {
      toast.success('컬렉션에서 제거되었습니다.');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `${creator.name}의 피드`,
        text: content.text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('링크가 클립보드에 복사되었습니다!');
    }
  };

  const shouldShowBlur = isBlurred && !isUnlocked;

  return (
    <Card className="bg-card border-border mb-6 cursor-pointer hover:bg-card/80 transition-colors" onClick={handleFeedClick}>
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
          {(content.image || content.video) && (
            <div className="relative rounded-lg overflow-hidden">
              {content.video || content.mediaType === 'video' ? (
                <div className="relative">
                  <video
                    src={content.video || content.image}
                    className={`w-full max-h-96 object-cover transition-all duration-300 ${
                      shouldShowBlur ? 'blur-lg scale-105' : ''
                    }`}
                    controls={!shouldShowBlur}
                    muted
                    preload="metadata"
                  />
                  {!shouldShowBlur && (
                    <div className="absolute bottom-3 left-3">
                      <div className="bg-black/60 backdrop-blur-sm rounded-full p-2">
                        <Video className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ImageWithFallback
                  src={content.image}
                  alt="Feed content"
                  className={`w-full max-h-96 object-cover transition-all duration-300 ${
                    shouldShowBlur ? 'blur-lg scale-105' : ''
                  }`}
                />
              )}
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
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`gap-1.5 ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
              onClick={handleLike}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{likeCount}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1.5 text-muted-foreground hover:text-card-foreground"
              onClick={(e) => {
                e.stopPropagation();
                handleFeedClick();
              }}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm">{commentCount}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1.5 text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                setShowTipDialog(true);
              }}
            >
              <Gift className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-blue-500"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`${isBookmarked ? 'text-primary' : 'text-muted-foreground hover:text-card-foreground'}`}
            onClick={handleBookmark}
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
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
      
      {/* Tip/Gift Dialog */}
      <TipGiftDialog
        isOpen={showTipDialog}
        onClose={() => setShowTipDialog(false)}
        creatorName={creator.name}
        onSend={handleTipSent}
      />
      
      {/* Poll/Quiz Dialog */}
      <PollQuizDialog
        isOpen={showPollDialog}
        onClose={() => setShowPollDialog(false)}
        creatorName={creator.name}
      />
    </Card>
  );
}