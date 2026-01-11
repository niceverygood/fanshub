import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SubscriptionSettings } from './SubscriptionSettings';
import { CreateFeed } from './CreateFeed';
import { RequestSystem } from './RequestSystem';
import { EditProfileDialog } from './EditProfileDialog';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Settings, 
  Plus,
  Edit3,
  Users,
  DollarSign,
  BarChart3,
  CreditCard,
  MoreHorizontal,
  HelpCircle,
  Shield,
  LogOut,
  MessageSquare,
  Play,
  Video,
  Image,
  Film,
  Loader2
} from 'lucide-react';
import { AddCardDialog } from './AddCardDialog';
import { useAuth } from '../contexts/AuthContext';
import { getCreatorFeeds } from '../lib/api/feeds';

interface MyProfileProps {
  onBack: () => void;
  onEarningsClick?: () => void;
  onHelpClick?: () => void;
  onPrivacyClick?: () => void;
  onLogout?: () => void;
}

interface FeedPost {
  id: string;
  image?: string;
  video?: string;
  mediaType?: 'image' | 'video';
  visibility: string;
  price: number | null;
  likes: number;
  content?: string;
}

export function MyProfile({ onBack, onEarningsClick, onHelpClick, onPrivacyClick, onLogout }: MyProfileProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [myPosts, setMyPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState([
    {
      id: '1',
      last4: '1234',
      brand: 'Visa',
      expiryMonth: '12',
      expiryYear: '2025',
      cardholderName: 'Your Name'
    },
    {
      id: '2',
      last4: '5678',
      brand: 'Mastercard',
      expiryMonth: '08',
      expiryYear: '2026',
      cardholderName: 'Your Name'
    }
  ]);

  // 내 피드 가져오기
  const fetchMyFeeds = async () => {
    if (!user?.id) {
      console.log('No user ID, skipping feed fetch');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    // 10초 타임아웃 설정
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 10000);
    });
    
    try {
      console.log('=== Fetching feeds for user ===', user.id);
      const feeds = await Promise.race([
        getCreatorFeeds(user.id),
        timeoutPromise
      ]);
      console.log('Fetched feeds count:', feeds?.length);
      
      if (!feeds || feeds.length === 0) {
        console.log('No feeds found for user');
        setMyPosts([]);
        return;
      }
      
      const formattedPosts: FeedPost[] = feeds.map(feed => {
        return {
          id: feed.id,
          image: feed.media_urls?.[0] || undefined,
          video: feed.media_type === 'video' ? feed.media_urls?.[0] : undefined,
          mediaType: feed.media_type as 'image' | 'video' | undefined,
          visibility: feed.is_premium ? 'paid' : 'free',
          price: feed.price || null,
          likes: feed.like_count || 0,
          content: feed.content_text || '',
        };
      });
      
      console.log('Formatted posts:', formattedPosts.length);
      setMyPosts(formattedPosts);
    } catch (error: any) {
      console.error('Error fetching feeds:', error);
      if (error.message === 'Timeout') {
        toast.error('피드 로딩 시간이 초과되었습니다. 새로고침해주세요.');
      } else {
        toast.error('피드를 불러오는 중 오류가 발생했습니다.');
      }
      setMyPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasFetchedRef = useRef(false);
  
  useEffect(() => {
    // 이미 호출되었으면 스킵 (React Strict Mode 중복 방지)
    if (hasFetchedRef.current && myPosts.length > 0) {
      setIsLoading(false);
      return;
    }
    
    if (user?.id) {
      hasFetchedRef.current = true;
      fetchMyFeeds();
    } else {
      // user가 없으면 로딩 중지
      setIsLoading(false);
    }
  }, [user?.id]);

  const [myProfile, setMyProfile] = useState({
    name: user?.name || 'Your Name',
    username: user?.username || 'yourname',
    avatar: user?.avatar_url || 'https://images.unsplash.com/photo-1551929175-f82f676827b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwd29tYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg2NzUxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    coverImage: user?.cover_url || 'https://images.unsplash.com/photo-1627808869239-e68ec6e9b63e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWZlc3R5bGUlMjBjb250ZW50JTIwcGhvdG98ZW58MXx8fHwxNzU4Njc1MTU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    bio: user?.bio || '안녕하세요! 저의 페이지에 방문해 주셔서 감사합니다. 다양한 콘텐츠를 공유하고 있어요 💕',
    verified: user?.is_verified || false,
    stats: {
      posts: myPosts.length,
      media: 0,
      subscribers: 0,
      earnings: 0
    }
  });

  // 사용자 정보가 변경될 때 프로필 업데이트
  useEffect(() => {
    if (user) {
      setMyProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        username: user.username || prev.username,
        avatar: user.avatar_url || prev.avatar,
        coverImage: user.cover_url || prev.coverImage,
        bio: user.bio || prev.bio,
        verified: user.is_verified || prev.verified,
        stats: {
          ...prev.stats,
          posts: myPosts.length,
        }
      }));
    }
  }, [user, myPosts.length]);

  const handleProfileUpdate = (updatedProfile: any) => {
    setMyProfile(prev => ({
      ...prev,
      ...updatedProfile
    }));
    toast.success('프로필이 수정되었습니다!');
  };

  const getVisibilityBadge = (visibility: string, price?: number | null) => {
    if (price) {
      return <Badge className="bg-green-600 text-white">${price}</Badge>;
    }
    
    const badges = {
      free: <Badge className="bg-gray-600 text-white">Free</Badge>,
      basic: <Badge className="bg-blue-600 text-white">Basic</Badge>,
      silver: <Badge className="bg-gray-400 text-white">Silver</Badge>,
      gold: <Badge className="bg-yellow-500 text-white">Gold</Badge>,
      platinum: <Badge className="bg-purple-600 text-white">Platinum</Badge>
    };
    
    return badges[visibility as keyof typeof badges] || badges.free;
  };

  if (showCreatePost) {
    return (
      <CreateFeed 
        onBack={() => setShowCreatePost(false)}
        onPost={() => {
          setShowCreatePost(false);
          // 피드 새로고침
          fetchMyFeeds();
        }}
      />
    );
  }

  if (showSettings) {
    return (
      <SubscriptionSettings 
        onBack={() => setShowSettings(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold text-foreground">내 프로필</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              설정
            </Button>
            <Button 
              size="sm"
              onClick={() => setShowCreatePost(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              새 피드
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="relative">
        <ImageWithFallback
          src={myProfile.coverImage}
          alt="Cover"
          className="w-full h-48 object-cover"
        />
        <div className="absolute -bottom-16 left-6">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={myProfile.avatar} alt={myProfile.name} />
            <AvatarFallback className="text-2xl">{myProfile.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="absolute bottom-4 right-4">
          <Button variant="secondary" size="sm" onClick={() => setShowEditProfile(true)}>
            <Edit3 className="h-4 w-4 mr-2" />
            편집
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-20 px-6 pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-semibold text-foreground">{myProfile.name}</h2>
          {myProfile.verified && (
            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-xs">✓</span>
            </div>
          )}
        </div>
        <p className="text-muted-foreground text-sm mb-4">@{myProfile.username}</p>
        <p className="text-foreground mb-6">{myProfile.bio}</p>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-card border-border text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-semibold text-foreground">{myProfile.stats.posts}</div>
              <div className="text-sm text-muted-foreground">피드</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-semibold text-foreground">{myProfile.stats.subscribers}</div>
              <div className="text-sm text-muted-foreground">구독자</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border text-center">
            <CardContent className="p-4 cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => onEarningsClick?.()}>
              <div className="text-2xl font-semibold text-green-500">${myProfile.stats.earnings}</div>
              <div className="text-sm text-muted-foreground">이번 달</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
        <TabsList className="grid w-full grid-cols-6 bg-muted">
          <TabsTrigger value="posts">피드</TabsTrigger>
          <TabsTrigger value="media">미디어</TabsTrigger>
          <TabsTrigger value="analytics">분석</TabsTrigger>
          <TabsTrigger value="requests">
            <MessageSquare className="h-4 w-4 mr-1" />
            요청
          </TabsTrigger>
          <TabsTrigger value="cards">카드</TabsTrigger>
          <TabsTrigger value="more">더보기</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">피드 불러오는 중...</span>
            </div>
          ) : myPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">아직 피드가 없습니다</h3>
              <p className="text-muted-foreground mb-4">첫 번째 피드를 작성해보세요!</p>
              <Button onClick={() => setShowCreatePost(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                새 피드 작성
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {myPosts.map((post) => (
                <div key={post.id} className="relative group">
                  {post.video || post.mediaType === 'video' ? (
                    <div className="relative">
                      <video
                        src={post.video || post.image}
                        className="w-full aspect-square object-cover rounded cursor-pointer group-hover:opacity-80 transition-opacity"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                          <Play className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <div className="bg-black/60 backdrop-blur-sm rounded-full p-1">
                          <Video className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>
                  ) : post.image ? (
                    <ImageWithFallback
                      src={post.image}
                      alt="Post"
                      className="w-full aspect-square object-cover rounded cursor-pointer group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded flex items-center justify-center p-4">
                      <p className="text-sm text-foreground line-clamp-4 text-center">{post.content}</p>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    {getVisibilityBadge(post.visibility, post.price)}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    ❤️ {post.likes}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          {/* Media Filters */}
          <div className="flex gap-2 mb-4">
            <Button variant="secondary" size="sm" className="gap-2">
              <Image className="h-4 w-4" />
              이미지 ({myPosts.filter(p => !p.video && !p.mediaType).length})
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Film className="h-4 w-4" />
              동영상 ({myPosts.filter(p => p.video || p.mediaType === 'video').length})
            </Button>
          </div>
          
          {/* Media Grid */}
          <div className="grid grid-cols-3 gap-1">
            {myPosts.map((post) => (
              <div key={post.id} className="relative group aspect-square">
                {post.video || post.mediaType === 'video' ? (
                  <div className="relative h-full">
                    <video
                      src={post.video || post.image}
                      className="w-full h-full object-cover rounded cursor-pointer group-hover:opacity-80 transition-opacity"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="bg-black/60 backdrop-blur-sm rounded-full p-1">
                        <Video className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <ImageWithFallback
                    src={post.image}
                    alt="Media"
                    className="w-full h-full object-cover rounded cursor-pointer group-hover:opacity-80 transition-opacity"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded">
                  <div className="text-white text-sm font-medium">
                    ❤️ {post.likes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  수익 분석
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-semibold text-green-500">$3,420</div>
                    <div className="text-sm text-muted-foreground">이번 달 수익</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-primary">$12,890</div>
                    <div className="text-sm text-muted-foreground">총 수익</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  구독자 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Basic</span>
                    <span>523명</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Silver</span>
                    <span>342명</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gold</span>
                    <span>289명</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platinum</span>
                    <span>94명</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <RequestSystem creatorName={myProfile.name} isCreator={true} />
        </TabsContent>

        <TabsContent value="cards" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">결제 카드</h3>
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => setShowAddCard(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                카드 추가
              </Button>
            </div>
            
            {cards.map((card) => (
              <Card key={card.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-8 bg-gradient-to-r ${
                      card.brand === 'Visa' 
                        ? 'from-blue-500 to-purple-600' 
                        : card.brand === 'Mastercard'
                        ? 'from-orange-500 to-red-600'
                        : 'from-green-500 to-teal-600'
                    } rounded flex items-center justify-center`}>
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">**** **** **** {card.last4}</div>
                      <div className="text-sm text-muted-foreground">
                        만료: {card.expiryMonth}/{card.expiryYear.slice(-2)}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="more" className="mt-6">
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 h-12"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-5 w-5" />
              구독 설정
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 h-12"
              onClick={onHelpClick}
            >
              <HelpCircle className="h-5 w-5" />
              도움말 및 지원
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 h-12"
              onClick={onPrivacyClick}
            >
              <Shield className="h-5 w-5" />
              개인정보 보호
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 h-12"
              onClick={onEarningsClick}
            >
              <BarChart3 className="h-5 w-5" />
              상세 분석
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5" />
              로그아웃
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {showSettings && (
        <SubscriptionSettings 
          onClose={() => setShowSettings(false)}
        />
      )}

      <AddCardDialog
        open={showAddCard}
        onOpenChange={setShowAddCard}
        onCardAdded={(newCard) => {
          setCards(prev => [...prev, newCard]);
        }}
      />

      <EditProfileDialog
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
        profile={myProfile}
        onSave={handleProfileUpdate}
      />
    </div>
  );
}