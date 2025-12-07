import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SubscriptionDialog } from './SubscriptionDialog';
import { TierSelectionDialog } from './TierSelectionDialog';
import { RequestSystem } from './RequestSystem';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '../types/subscription';
import { 
  ArrowLeft, 
  MoreHorizontal, 
  Heart, 
  MessageCircle, 
  Bookmark,
  Lock,
  Unlock,
  DollarSign,
  Mail,
  Star,
  Share2,
  MessageSquare
} from 'lucide-react';

interface CreatorProfileProps {
  creator: {
    name: string;
    username: string;
    avatar: string;
    coverImage: string;
    verified?: boolean;
    bio: string;
    stats: {
      feeds: number;
      media: number;
    };
    subscriptionPrice?: number;
    hasSubscriptionTiers?: boolean; // 등급별 구독 허용 여부
    availableTiers?: string[]; // 사용 가능한 등급 ID 배열
    isSubscribed?: boolean;
    onSubscribe?: (creator: any, tier?: any) => void;
  };
  onBack: () => void;
}

interface PostData {
  id: string;
  image: string;
  isLocked: boolean;
  price?: number;
  likes: number;
  timestamp: string;
  text?: string;
}

export function CreatorProfile({ creator, onBack }: CreatorProfileProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [unlockedPosts, setUnlockedPosts] = useState<Set<string>>(new Set());
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showTierSelectionDialog, setShowTierSelectionDialog] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(creator.isSubscribed || false);
  const [subscribedTier, setSubscribedTier] = useState<SubscriptionTier | null>(null);

  const mockPosts: PostData[] = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1611385104263-5a3b94951346?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb29sJTIwd2F0ZXIlMjB1bmRlcndhdGVyJTIwd29tYW58ZW58MXx8fHwxNzU4Njc1NDI2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      isLocked: false,
      likes: 147,
      timestamp: '9월 26, 2023',
      text: "let's get deep"
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1656103743123-b9990915d523?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbGlmZXN0eWxlJTIwcGhvdG98ZW58MXx8fHwxNzU4NTk0ODg0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      isLocked: true,
      price: 3,
      likes: 89,
      timestamp: '8월 31, 2023',
      text: "sneak peek 😘👀"
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1654370488609-02aa42d7a639?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBiZWFjaCUyMHdvbWFufGVufDF8fHx8MTc1ODY3NTQzMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      isLocked: false,
      likes: 234,
      timestamp: '11월 5, 2024',
      text: "Happy Monday 🌟"
    }
  ];

  const handleUnlockPost = (postId: string) => {
    setUnlockedPosts(prev => new Set([...prev, postId]));
  };

  const handleSubscribe = () => {
    if (creator.hasSubscriptionTiers) {
      // 등급별 구독을 지원하는 경우
      setShowTierSelectionDialog(true);
    } else if (creator.subscriptionPrice) {
      // 단일 구독만 지원하는 경우
      setShowSubscriptionDialog(true);
    }
  };

  const handleTierSubscription = (tier: SubscriptionTier) => {
    setIsSubscribed(true);
    setSubscribedTier(tier);
    creator.onSubscribe?.(creator, tier);
    console.log(`${tier.name} 등급으로 구독됨:`, tier);
  };

  const handleSimpleSubscription = () => {
    setIsSubscribed(true);
    creator.onSubscribe?.(creator);
    console.log('구독됨:', creator);
  };

  // 크리에이터가 허용하는 구독 등급 가져오기
  const getAvailableTiers = (): SubscriptionTier[] => {
    if (!creator.availableTiers) {
      return SUBSCRIPTION_TIERS; // 기본적으로 모든 등급 제공
    }
    return SUBSCRIPTION_TIERS.filter(tier => creator.availableTiers!.includes(tier.id));
  };

  const handleSendTip = () => {
    // 팁 보내기 로직
    console.log('팁 보내기');
  };

  const handleSendMessage = () => {
    // 메시지 보내기 로직
    console.log('메시지 보내기');
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleShare = () => {
    // 계정 공유 로직
    if (navigator.share) {
      navigator.share({
        title: `${creator.name} (@${creator.username})`,
        url: window.location.href,
      });
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const renderPost = (post: PostData) => {
    const isUnlocked = unlockedPosts.has(post.id);
    const shouldBlur = post.isLocked && !isUnlocked;

    return (
      <Card key={post.id} className="bg-card border-border overflow-hidden">
        <div className="relative">
          <ImageWithFallback
            src={post.image}
            alt="Post"
            className={`w-full aspect-square object-cover ${shouldBlur ? 'blur-md' : ''}`}
          />
          
          {shouldBlur && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
              <div className="bg-black/60 rounded-full p-4 mb-2">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div className="text-white font-semibold mb-2">${post.price}</div>
              <Button 
                onClick={() => handleUnlockPost(post.id)}
                className="bg-primary hover:bg-primary/90"
              >
                이 피드 잠금 해제
              </Button>
            </div>
          )}

          {!shouldBlur && post.isLocked && isUnlocked && (
            <div className="absolute top-2 right-2">
              <Unlock className="h-4 w-4 text-green-400" />
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          {post.text && (
            <p className="text-card-foreground mb-3">{post.text}</p>
          )}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{post.likes}</span>
              </div>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
            <span>{post.timestamp}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">{creator.name}</h1>
              <p className="text-sm text-muted-foreground">@{creator.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="relative">
        <ImageWithFallback
          src={creator.coverImage}
          alt="Cover"
          className="w-full h-48 object-cover"
        />
        <div className="absolute -bottom-16 left-6">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={creator.avatar} alt={creator.name} />
            <AvatarFallback className="text-2xl">{creator.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        
        {/* Action Icons */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            className="h-10 w-10 p-0 bg-black/60 hover:bg-black/80 border-none"
            onClick={handleSendTip}
          >
            <DollarSign className="h-5 w-5 text-white" />
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className="h-10 w-10 p-0 bg-black/60 hover:bg-black/80 border-none"
            onClick={handleSendMessage}
          >
            <Mail className="h-5 w-5 text-white" />
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className="h-10 w-10 p-0 bg-black/60 hover:bg-black/80 border-none"
            onClick={handleToggleFavorite}
          >
            <Star className={`h-5 w-5 ${isFavorited ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`} />
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className="h-10 w-10 p-0 bg-black/60 hover:bg-black/80 border-none"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-20 px-6 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-semibold text-foreground">{creator.name}</h2>
              {creator.verified && (
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">✓</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground mb-2">@{creator.username}</p>
          </div>
          <Button 
            className={`${isSubscribed ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/90'}`}
            onClick={handleSubscribe}
            disabled={isSubscribed}
          >
            {isSubscribed 
              ? `${subscribedTier?.name} 구독 중` 
              : creator.hasSubscriptionTiers 
                ? '등급별 구독'
                : creator.subscriptionPrice 
                  ? `${creator.subscriptionPrice}/월 구독` 
                  : '구독'
            }
          </Button>
        </div>

        <p className="text-card-foreground mb-4">{creator.bio}</p>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-6">
          <div>
            <span className="font-semibold text-foreground">{creator.stats.feeds}</span>
            <span className="text-muted-foreground ml-1">피드</span>
          </div>
          <div>
            <span className="font-semibold text-foreground">{creator.stats.media}</span>
            <span className="text-muted-foreground ml-1">미디어</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            모두 {creator.stats.feeds}
          </TabsTrigger>
          <TabsTrigger value="archive" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Archive 68
          </TabsTrigger>
          <TabsTrigger value="requests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MessageSquare className="h-4 w-4 mr-1" />
            요청
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockPosts.map(renderPost)}
          </div>
        </TabsContent>

        <TabsContent value="archive" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockPosts.filter(post => post.isLocked).map(renderPost)}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <RequestSystem creatorName={creator.name} />
        </TabsContent>
      </Tabs>

      {/* Subscription Dialog */}
      <SubscriptionDialog
        isOpen={showSubscriptionDialog}
        onClose={() => setShowSubscriptionDialog(false)}
        creator={creator}
        subscriptionPrice={creator.subscriptionPrice || 9.99}
        onSubscribe={handleSimpleSubscription}
      />

      {/* Tier Selection Dialog */}
      <TierSelectionDialog
        isOpen={showTierSelectionDialog}
        onClose={() => setShowTierSelectionDialog(false)}
        creator={creator}
        availableTiers={getAvailableTiers()}
        onSubscribe={handleTierSubscription}
      />
    </div>
  );
}