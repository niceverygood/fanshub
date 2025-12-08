import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { BottomNavigation } from './components/BottomNavigation';
import { TopHeader } from './components/TopHeader';
import { FeedCard } from './components/FeedCard';
import { FeedDetail } from './components/FeedDetail';
import { CreatorCard } from './components/CreatorCard';
import { CreatorProfile } from './components/CreatorProfile';
import { MyProfile } from './components/MyProfile';
import { CreateFeed } from './components/CreateFeed';
import { Notifications } from './components/Notifications';
import { Messages } from './components/Messages';
import { CardRegistrationForm } from './components/CardRegistrationForm';
import { EarningsManagement } from './components/EarningsManagement';
import LoginPage from './components/LoginPage';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Search } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

const mockFeeds = [
  {
    creator: {
      name: 'Fina',
      username: 'soofina',
      avatar: 'https://images.unsplash.com/photo-1551929175-f82f676827b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwd29tYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg2NzUxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      verified: true,
    },
    content: {
      text: "There's room for two in here. Consider this your invitation. 🎭",
      image: 'https://images.unsplash.com/photo-1627808869239-e68ec6e9b63e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWZlc3R5bGUlMjBjb250ZW50JTIwcGhvdG98ZW58MXx8fHwxNzU4Njc1MTU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    timestamp: '9월 12, 2024',
    isBlurred: true,
    price: 15,
  },
  {
    creator: {
      name: 'EARTHLY ALIEN',
      username: 'earthlyworm',
      avatar: 'https://images.unsplash.com/photo-1624948456761-0f2660d3dc5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGluZmx1ZW5jZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg2MjI4MTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      verified: true,
    },
    content: {
      text: "새로운 포토세트가 준비되었어요 ✨ 특별한 순간들을 담았습니다",
      image: 'https://images.unsplash.com/photo-1624948456761-0f2660d3dc5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGluZmx1ZW5jZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg2MjI4MTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    timestamp: '9월 20, 2024',
    isBlurred: true,
    price: 25,
  },
  {
    creator: {
      name: 'Fina',
      username: 'soofina',
      avatar: 'https://images.unsplash.com/photo-1551929175-f82f676827b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwd29tYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg2NzUxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      verified: true,
    },
    content: {
      text: "새로운 뮤직비디오 티저가 나왔어요! 🎵 어떤가요?",
      video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      mediaType: 'video' as const,
    },
    timestamp: '9월 23, 2024',
    isBlurred: true,
    price: 12,
  },
  {
    creator: {
      name: 'Fina',
      username: 'soofina',
      avatar: 'https://images.unsplash.com/photo-1551929175-f82f676827b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwd29tYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg2NzUxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      verified: true,
    },
    content: {
      text: "Do you like this color on me? 👗",
    },
    timestamp: '9월 22, 2024',
  },
  {
    creator: {
      name: 'ash',
      username: 'ashtype',
      avatar: 'https://images.unsplash.com/photo-1646528192559-c163a2803f52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMHBvcnRyYWl0JTIwc3R1ZGlvfGVufDF8fHx8MTc1ODY3NTE3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      verified: false,
    },
    content: {
      text: "촬영 현장 비하인드! 🎬 처음 공개하는 메이킹 영상이에요",
      video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      mediaType: 'video' as const,
    },
    timestamp: '9월 19, 2024',
    isBlurred: true,
    price: 18,
  },
  {
    creator: {
      name: 'ash',
      username: 'ashtype',
      avatar: 'https://images.unsplash.com/photo-1646528192559-c163a2803f52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMHBvcnRyYWl0JTIwc3R1ZGlvfGVufDF8fHx8MTc1ODY3NTE3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      verified: false,
    },
    content: {
      text: "Behind the scenes 🎬 이 사진들은 오직 여기서만!",
      image: 'https://images.unsplash.com/photo-1646528192559-c163a2803f52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMHBvcnRyYWl0JTIwc3R1ZGlvfGVufDF8fHx8MTc1ODY3NTE3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    timestamp: '9월 18, 2024',
    isBlurred: true,
    price: 10,
  },
];

const recommendedCreators = [
  {
    name: 'EARTHLY ALIEN',
    username: 'earthlyworm',
    avatar: 'https://images.unsplash.com/photo-1624948456761-0f2660d3dc5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGluZmx1ZW5jZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg2MjI4MTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    coverImage: 'https://images.unsplash.com/photo-1624948456761-0f2660d3dc5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGluZmx1ZW5jZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg2MjI4MTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    isOnline: true,
    subscriptionPrice: 12.99,
  },
  {
    name: 'ash',
    username: 'ashtype',
    avatar: 'https://images.unsplash.com/photo-1646528192559-c163a2803f52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMHBvcnRyYWl0JTIwc3R1ZGlvfGVufDF8fHx8MTc1ODY3NTE3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    coverImage: 'https://images.unsplash.com/photo-1646528192559-c163a2803f52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMHBvcnRyYWl0JTIwc3R1ZGlvfGVufDF8fHx8MTc1ODY3NTE3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    isOnline: false,
    subscriptionPrice: 8.99,
  },
  {
    name: 'Astrid',
    username: 'astridamp',
    avatar: 'https://images.unsplash.com/photo-1642263039799-7515d7143225?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwcG9ydHJhaXQlMjB3b21hbnxlbnwxfHx8fDE3NTg2NzUxNzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    coverImage: 'https://images.unsplash.com/photo-1642263039799-7515d7143225?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwcG9ydHJhaXQlMjB3b21hbnxlbnwxfHx8fDE3NTg2NzUxNzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    isOnline: true,
    subscriptionPrice: 15.99,
  },
];

export default function App() {
  const { user, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'myprofile' | 'create' | 'notifications' | 'collections' | 'subscriptions' | 'messages' | 'cards' | 'earnings' | 'feedDetail' | 'help' | 'privacy' | 'login'>('home');
  const [selectedCreator, setSelectedCreator] = useState<any>(null);
  const [selectedFeed, setSelectedFeed] = useState<any>(null);
  const [subscribedCreators, setSubscribedCreators] = useState<any[]>([]);
  const [savedCollections, setSavedCollections] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFeeds, setFilteredFeeds] = useState(mockFeeds);
  
  // 읽지 않은 알림 수 (실제로는 백엔드에서 가져올 값)
  const unreadNotificationsCount = 2;
  
  // 읽지 않은 메시지 수 (실제로는 백엔드에서 가져올 값)
  const unreadMessagesCount = 4;

  // 로딩 중일 때 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">로딩 중...</div>
      </div>
    );
  }

  // 로그인되지 않은 경우 로그인 페이지 표시
  if (!user) {
    return <LoginPage />;
  }
  
  // 검색 핸들러
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredFeeds(mockFeeds);
    } else {
      const filtered = mockFeeds.filter(feed => 
        feed.creator.name.toLowerCase().includes(query.toLowerCase()) ||
        feed.creator.username.toLowerCase().includes(query.toLowerCase()) ||
        feed.content.text.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredFeeds(filtered);
    }
  };
  
  // 북마크 저장 핸들러
  const handleBookmarkFeed = (feed: any) => {
    setSavedCollections(prev => {
      const isAlreadySaved = prev.some(
        f => f.creator.username === feed.creator.username && f.content.text === feed.content.text
      );
      if (isAlreadySaved) {
        return prev.filter(
          f => !(f.creator.username === feed.creator.username && f.content.text === feed.content.text)
        );
      }
      return [...prev, feed];
    });
  };

  // 구독된 크리에이터들의 피드를 생성하는 함수
  const getSubscribedFeeds = () => {
    if (subscribedCreators.length === 0) {
      return [];
    }

    // 구독된 크리에이터들의 피드를 생성
    const subscribedFeeds = subscribedCreators.flatMap((creator, creatorIndex) => {
      const creatorFeeds = [
        {
          creator: {
            name: creator.name,
            username: creator.username,
            avatar: creator.avatar,
            verified: creator.verified
          },
          content: {
            text: `${creator.name}의 최신 소식이에요! 구독해주셔서 감사합니다 ✨`,
            image: mockFeeds[creatorIndex % mockFeeds.length]?.content.image
          },
          timestamp: '1시간 전',
          isBlurred: false
        },
        {
          creator: {
            name: creator.name,
            username: creator.username,
            avatar: creator.avatar,
            verified: creator.verified
          },
          content: {
            text: '구독자 전용 콘텐츠입니다 🔥',
            image: mockFeeds[(creatorIndex + 1) % mockFeeds.length]?.content.image
          },
          timestamp: '3시간 전',
          isBlurred: false
        }
      ];
      return creatorFeeds;
    });

    return subscribedFeeds.sort(() => Math.random() - 0.5); // 랜덤 정렬
  };

  const handleSubscribe = (creator: any, tier?: any) => {
    // 이미 구독 중인지 확인
    const isAlreadySubscribed = subscribedCreators.some(sub => sub.username === creator.username);
    
    if (!isAlreadySubscribed) {
      setSubscribedCreators(prev => [...prev, {
        ...creator,
        subscribedTier: tier,
        subscribedAt: new Date().toISOString()
      }]);
    }
  };

  const handleViewProfile = (creator: any) => {
    // 일부 크리에이터는 등급별 구독을 허용, 일부는 단일 구독만 허용
    const hasSubscriptionTiers = creator.name === 'Fina' || creator.name === 'Astrid'; // 예시
    const availableTiers = creator.name === 'Fina' 
      ? ['basic', 'silver', 'gold', 'platinum'] // Fina는 모든 등급 제공
      : creator.name === 'Astrid'
        ? ['silver', 'gold', 'platinum'] // Astrid는 Silver부터 제공
        : undefined; // 다른 크리에이터는 단일 구독만

    const isSubscribed = subscribedCreators.some(sub => sub.username === creator.username);

    setSelectedCreator({
      ...creator,
      coverImage: 'https://images.unsplash.com/photo-1627808869239-e68ec6e9b63e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWZlc3R5bGUlMjBjb250ZW50JTIwcGhvdG98ZW58MXx8fHwxNzU4Njc1MTU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      bio: '가라지어 록음니다',
      stats: {
        feeds: 243,
        media: 1073
      },
      subscriptionPrice: hasSubscriptionTiers ? undefined : 6.99,
      hasSubscriptionTiers,
      availableTiers,
      isSubscribed,
      onSubscribe: handleSubscribe
    });
    setCurrentView('profile');
  };

  const handleNotificationNavigate = (type: 'profile' | 'feed', data: any) => {
    if (type === 'profile') {
      // 알림에서 온 사용자 정보를 기반으로 프로필 생성
      const notificationUser = {
        name: data.name,
        username: data.username,
        avatar: data.avatar,
        verified: data.verified,
        // 기본값들로 나머지 필드 채우기
        coverImage: 'https://images.unsplash.com/photo-1627808869239-e68ec6e9b63e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWZlc3R5bGUlMjBjb250ZW50JTIwcGhvdG98ZW58MXx8fHwxNzU4Njc1MTU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        bio: '안녕하세요! 팬스허브에서 함께해요 ✨',
        stats: {
          feeds: Math.floor(Math.random() * 500) + 50,
          media: Math.floor(Math.random() * 2000) + 100
        },
        subscriptionPrice: Math.floor(Math.random() * 20) + 5,
        hasSubscriptionTiers: Math.random() > 0.5,
        availableTiers: ['basic', 'silver', 'gold', 'platinum']
      };
      
      setSelectedCreator(notificationUser);
      setCurrentView('profile');
    } else if (type === 'feed') {
      // 피드 상세는 현재 구현되지 않았으므로, 크리에이터 프로필로 리다이렉트
      handleNotificationNavigate('profile', data);
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedCreator(null);
    setSelectedFeed(null);
  };

  const handleFeedClick = (feed: any) => {
    setSelectedFeed(feed);
    setCurrentView('feedDetail');
  };

  const handleMenuClick = (menu: string) => {
    switch (menu) {
      case 'home':
        setCurrentView('home');
        setSelectedCreator(null);
        setSelectedFeed(null);
        break;
      case 'notifications':
        setCurrentView('notifications');
        setSelectedCreator(null);
        setSelectedFeed(null);
        break;
      case 'myprofile':
        setCurrentView('myprofile');
        setSelectedCreator(null);
        setSelectedFeed(null);
        break;
      case 'create':
        setCurrentView('create');
        setSelectedCreator(null);
        setSelectedFeed(null);
        break;
      case 'collections':
        setCurrentView('collections');
        setSelectedCreator(null);
        setSelectedFeed(null);
        break;
      case 'subscriptions':
        setCurrentView('subscriptions');
        setSelectedCreator(null);
        setSelectedFeed(null);
        break;
      case 'messages':
        setCurrentView('messages');
        setSelectedCreator(null);
        setSelectedFeed(null);
        break;
      case 'cards':
        setCurrentView('cards');
        setSelectedCreator(null);
        setSelectedFeed(null);
        break;
      case 'help':
        setCurrentView('help');
        setSelectedCreator(null);
        setSelectedFeed(null);
        break;
      case 'privacy':
        setCurrentView('privacy');
        setSelectedCreator(null);
        setSelectedFeed(null);
        break;
      default:
        console.log(`${menu} 메뉴 클릭됨`);
        break;
    }
  };

  if (currentView === 'feedDetail' && selectedFeed) {
    return (
      <div className="min-h-screen bg-background">
        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          <Sidebar 
            currentView="home" 
            onMenuClick={handleMenuClick}
            unreadNotificationsCount={unreadNotificationsCount}
            unreadMessagesCount={unreadMessagesCount}
          />
          <div className="flex-1">
            <FeedDetail 
              feed={selectedFeed} 
              onBack={handleBackToHome}
              onCreatorClick={handleViewProfile}
            />
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="pb-16">
            <FeedDetail 
              feed={selectedFeed} 
              onBack={handleBackToHome}
              onCreatorClick={handleViewProfile}
            />
          </div>
          <BottomNavigation currentView="home" onMenuClick={handleMenuClick} />
        </div>
      </div>
    );
  }

  if (currentView === 'profile' && selectedCreator) {
    return (
      <div className="min-h-screen bg-background">
        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          <Sidebar 
            currentView={currentView} 
            onMenuClick={handleMenuClick}
            unreadNotificationsCount={unreadNotificationsCount}
            unreadMessagesCount={unreadMessagesCount}
          />
          <div className="flex-1">
            <CreatorProfile 
              creator={selectedCreator} 
              onBack={handleBackToHome}
              onFeedClick={(feed) => {
                setSelectedFeed(feed);
                setCurrentView('feedDetail');
              }}
            />
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="pb-16">
            <CreatorProfile 
              creator={selectedCreator} 
              onBack={handleBackToHome}
              onFeedClick={(feed) => {
                setSelectedFeed(feed);
                setCurrentView('feedDetail');
              }}
            />
          </div>
          <BottomNavigation currentView={currentView} onMenuClick={handleMenuClick} />
        </div>
      </div>
    );
  }

  if (currentView === 'notifications') {
    return (
      <div className="min-h-screen bg-background">
        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          <Sidebar 
            currentView={currentView} 
            onMenuClick={handleMenuClick}
            unreadNotificationsCount={unreadNotificationsCount}
            unreadMessagesCount={unreadMessagesCount}
          />
          <div className="flex-1">
            <Notifications 
              onBack={handleBackToHome} 
              onNavigate={handleNotificationNavigate}
            />
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="pb-16">
            <Notifications 
              onBack={handleBackToHome} 
              onNavigate={handleNotificationNavigate}
            />
          </div>
          <BottomNavigation currentView={currentView} onMenuClick={handleMenuClick} />
        </div>
      </div>
    );
  }

  if (currentView === 'myprofile') {
    return (
      <div className="min-h-screen bg-background">
        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          <Sidebar 
            currentView={currentView} 
            onMenuClick={handleMenuClick}
            unreadNotificationsCount={unreadNotificationsCount}
            unreadMessagesCount={unreadMessagesCount}
          />
          <div className="flex-1">
            <MyProfile 
              onBack={handleBackToHome} 
              onEarningsClick={() => setCurrentView('earnings')}
              onHelpClick={() => handleMenuClick('help')}
              onPrivacyClick={() => handleMenuClick('privacy')}
              onLogout={() => {
                // 실제로는 로그아웃 처리 후 로그인 페이지로 이동
                handleMenuClick('home');
              }}
            />
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="pb-16">
            <TopHeader 
              title="내 프로필" 
              onNotificationClick={() => handleMenuClick('notifications')}
              unreadNotificationsCount={unreadNotificationsCount}
            />
            <MyProfile 
              onBack={handleBackToHome} 
              onEarningsClick={() => setCurrentView('earnings')}
              onHelpClick={() => handleMenuClick('help')}
              onPrivacyClick={() => handleMenuClick('privacy')}
              onLogout={() => {
                handleMenuClick('home');
              }}
            />
          </div>
          <BottomNavigation currentView={currentView} onMenuClick={handleMenuClick} />
        </div>
      </div>
    );
  }

  if (currentView === 'collections') {
    return (
      <div className="min-h-screen bg-background">
        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          <Sidebar 
            currentView={currentView} 
            onMenuClick={handleMenuClick}
            unreadNotificationsCount={unreadNotificationsCount}
            unreadMessagesCount={unreadMessagesCount}
          />
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10">
              <h1 className="text-xl font-semibold text-foreground mb-4">컬렉션</h1>
              <p className="text-sm text-muted-foreground">저장한 피드: {savedCollections.length}개</p>
            </div>
            <div className="p-4">
              {savedCollections.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-lg font-medium text-foreground mb-2">아직 저장된 피드가 없습니다</h3>
                  <p className="text-muted-foreground">피드의 북마크 아이콘을 눌러 저장해보세요!</p>
                  <Button className="mt-4" onClick={() => handleMenuClick('home')}>
                    피드 둘러보기
                  </Button>
                </div>
              ) : (
                savedCollections.map((feed, index) => (
                  <FeedCard
                    key={index}
                    creator={feed.creator}
                    content={feed.content}
                    timestamp={feed.timestamp}
                    isBlurred={feed.isBlurred}
                    price={feed.price}
                    onCreatorClick={handleViewProfile}
                    onFeedClick={handleFeedClick}
                    onBookmark={handleBookmarkFeed}
                  />
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="pb-16">
            <TopHeader 
              title="컬렉션" 
              onNotificationClick={() => handleMenuClick('notifications')}
              unreadNotificationsCount={unreadNotificationsCount}
            />
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-4">저장한 피드: {savedCollections.length}개</p>
              {savedCollections.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-lg font-medium text-foreground mb-2">아직 저장된 피드가 없습니다</h3>
                  <p className="text-muted-foreground">피드의 북마크 아이콘을 눌러 저장해보세요!</p>
                  <Button className="mt-4" onClick={() => handleMenuClick('home')}>
                    피드 둘러보기
                  </Button>
                </div>
              ) : (
                savedCollections.map((feed, index) => (
                  <FeedCard
                    key={index}
                    creator={feed.creator}
                    content={feed.content}
                    timestamp={feed.timestamp}
                    isBlurred={feed.isBlurred}
                    price={feed.price}
                    onCreatorClick={handleViewProfile}
                    onFeedClick={handleFeedClick}
                    onBookmark={handleBookmarkFeed}
                  />
                ))
              )}
            </div>
          </div>
          <BottomNavigation currentView={currentView} onMenuClick={handleMenuClick} />
        </div>
      </div>
    );
  }

  if (currentView === 'subscriptions') {
    const subscribedFeeds = getSubscribedFeeds();

    return (
      <div className="min-h-screen bg-background">
        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          <Sidebar 
            currentView={currentView} 
            onMenuClick={handleMenuClick}
            unreadNotificationsCount={unreadNotificationsCount}
            unreadMessagesCount={unreadMessagesCount}
          />
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10">
              <h1 className="text-xl font-semibold text-foreground mb-4">구독</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="구독 중인 크리에이터 검색"
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>

            <div className="p-4">
              {subscribedCreators.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">아직 구독 중인 크리에이터가 없습니다</p>
                  <Button onClick={() => handleMenuClick('home')} variant="outline">
                    크리에이터 둘러보기
                  </Button>
                </div>
              ) : (
                <>
                  {/* 구독 중인 크리에이터 목록 */}
                  <div className="mb-6">
                    <h2 className="font-semibold text-foreground mb-3">구독 중인 크리에이터 ({subscribedCreators.length})</h2>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {subscribedCreators.map((creator, index) => (
                        <div 
                          key={index} 
                          className="flex flex-col items-center min-w-[80px] cursor-pointer"
                          onClick={() => handleViewProfile(creator)}
                        >
                          <Avatar className="h-12 w-12 mb-2">
                            <AvatarImage src={creator.avatar} />
                            <AvatarFallback>{creator.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-center text-muted-foreground">{creator.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 구독 피드 */}
                  <div>
                    <h2 className="font-semibold text-foreground mb-4">구독 피드</h2>
                    {subscribedFeeds.map((feed, index) => (
                      <FeedCard
                        key={index}
                        creator={feed.creator}
                        content={feed.content}
                        timestamp={feed.timestamp}
                        isBlurred={feed.isBlurred}
                        price={feed.price}
                        onCreatorClick={handleViewProfile}
                        onFeedClick={handleFeedClick}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="pb-16">
            <TopHeader 
              title="구독" 
              onNotificationClick={() => handleMenuClick('notifications')}
              unreadNotificationsCount={unreadNotificationsCount}
            />
            <div className="p-4">
              {subscribedCreators.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">아직 구독 중인 크리에이터가 없습니다</p>
                  <Button onClick={() => handleMenuClick('home')} variant="outline">
                    크리에이터 둘러보기
                  </Button>
                </div>
              ) : (
                <>
                  {/* 구독 중인 크리에이터 목록 */}
                  <div className="mb-6">
                    <h2 className="font-semibold text-foreground mb-3">구독 중인 크리에이터 ({subscribedCreators.length})</h2>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {subscribedCreators.map((creator, index) => (
                        <div 
                          key={index} 
                          className="flex flex-col items-center min-w-[80px] cursor-pointer"
                          onClick={() => handleViewProfile(creator)}
                        >
                          <Avatar className="h-12 w-12 mb-2">
                            <AvatarImage src={creator.avatar} />
                            <AvatarFallback>{creator.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-center text-muted-foreground">{creator.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 구독 피드 */}
                  <div>
                    <h2 className="font-semibold text-foreground mb-4">구독 피드</h2>
                    {subscribedFeeds.map((feed, index) => (
                      <FeedCard
                        key={index}
                        creator={feed.creator}
                        content={feed.content}
                        timestamp={feed.timestamp}
                        isBlurred={feed.isBlurred}
                        price={feed.price}
                        onCreatorClick={handleViewProfile}
                        onFeedClick={handleFeedClick}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <BottomNavigation currentView={currentView} onMenuClick={handleMenuClick} />
        </div>
      </div>
    );
  }

  if (currentView === 'messages') {
    return (
      <div className="min-h-screen bg-background">
        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          <Sidebar 
            currentView={currentView} 
            onMenuClick={handleMenuClick}
            unreadNotificationsCount={unreadNotificationsCount}
            unreadMessagesCount={unreadMessagesCount}
          />
          <div className="flex-1">
            <Messages onBack={handleBackToHome} onProfileClick={handleViewProfile} />
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="pb-16 h-screen">
            <Messages onBack={handleBackToHome} onProfileClick={handleViewProfile} />
          </div>
          <BottomNavigation currentView={currentView} onMenuClick={handleMenuClick} />
        </div>
      </div>
    );
  }

  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-background">
        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          <Sidebar 
            currentView={currentView} 
            onMenuClick={handleMenuClick}
            unreadNotificationsCount={unreadNotificationsCount}
            unreadMessagesCount={unreadMessagesCount}
          />
          <div className="flex-1">
            <CreateFeed 
              onBack={handleBackToHome}
              onPost={handleBackToHome}
            />
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="pb-16">
            <TopHeader 
              title="새 피드" 
              onNotificationClick={() => handleMenuClick('notifications')}
              unreadNotificationsCount={unreadNotificationsCount}
            />
            <CreateFeed 
              onBack={handleBackToHome}
              onPost={handleBackToHome}
            />
          </div>
          <BottomNavigation currentView={currentView} onMenuClick={handleMenuClick} />
        </div>
      </div>
    );
  }

  if (currentView === 'cards') {
    return (
      <div className="min-h-screen bg-background">
        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          <Sidebar 
            currentView={currentView} 
            onMenuClick={handleMenuClick}
            unreadNotificationsCount={unreadNotificationsCount}
            unreadMessagesCount={unreadMessagesCount}
          />
          <div className="flex-1">
            <CardRegistrationForm 
              onBack={handleBackToHome}
              onCardAdded={(cardData) => {
                console.log('Card added:', cardData);
                handleBackToHome();
              }}
            />
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="pb-16">
            <CardRegistrationForm 
              onBack={handleBackToHome}
              onCardAdded={(cardData) => {
                console.log('Card added:', cardData);
                handleBackToHome();
              }}
            />
          </div>
          <BottomNavigation currentView={currentView} onMenuClick={handleMenuClick} />
        </div>
      </div>
    );
  }

  if (currentView === 'earnings') {
    return (
      <div className="min-h-screen bg-background">
        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          <Sidebar 
            currentView="myprofile"
            onMenuClick={handleMenuClick}
            unreadNotificationsCount={unreadNotificationsCount}
            unreadMessagesCount={unreadMessagesCount}
          />
          <div className="flex-1">
            <EarningsManagement onBack={handleBackToHome} />
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="pb-16">
            <EarningsManagement onBack={handleBackToHome} />
          </div>
          <BottomNavigation currentView="myprofile" onMenuClick={handleMenuClick} />
        </div>
      </div>
    );
  }

  // 도움말 페이지
  if (currentView === 'help') {
    return (
      <div className="min-h-screen bg-background">
        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          <Sidebar 
            currentView={currentView} 
            onMenuClick={handleMenuClick}
            unreadNotificationsCount={unreadNotificationsCount}
            unreadMessagesCount={unreadMessagesCount}
          />
          <div className="flex-1 max-w-2xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="sm" onClick={handleBackToHome}>
                <Search className="h-4 w-4 mr-2" />
                뒤로
              </Button>
              <h1 className="text-2xl font-semibold">도움말 및 지원</h1>
            </div>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-semibold text-lg mb-2">자주 묻는 질문</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Q: 구독은 어떻게 취소하나요?</strong><br/>A: 내 프로필 → 설정 → 구독 관리에서 취소할 수 있습니다.</p>
                  <p><strong>Q: 결제 수단을 변경하려면?</strong><br/>A: 내 프로필 → 카드 탭에서 새 카드를 추가하거나 기존 카드를 삭제할 수 있습니다.</p>
                  <p><strong>Q: 크리에이터가 되려면?</strong><br/>A: 내 프로필에서 바로 콘텐츠를 업로드하고 구독 설정을 할 수 있습니다.</p>
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-semibold text-lg mb-2">문의하기</h3>
                <p className="text-muted-foreground mb-4">추가적인 도움이 필요하시면 아래로 연락주세요.</p>
                <p className="text-primary">support@fanshub.com</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="pb-16">
            <TopHeader 
              title="도움말 및 지원" 
              onNotificationClick={() => handleMenuClick('notifications')}
              unreadNotificationsCount={unreadNotificationsCount}
            />
            <div className="p-4 space-y-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-semibold mb-2">자주 묻는 질문</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p><strong>Q: 구독은 어떻게 취소하나요?</strong><br/>A: 내 프로필 → 설정 → 구독 관리에서 취소할 수 있습니다.</p>
                  <p><strong>Q: 결제 수단을 변경하려면?</strong><br/>A: 내 프로필 → 카드 탭에서 새 카드를 추가할 수 있습니다.</p>
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-semibold mb-2">문의하기</h3>
                <p className="text-primary">support@fanshub.com</p>
              </div>
            </div>
          </div>
          <BottomNavigation currentView={currentView} onMenuClick={handleMenuClick} />
        </div>
      </div>
    );
  }

  // 개인정보 보호 페이지
  if (currentView === 'privacy') {
    return (
      <div className="min-h-screen bg-background">
        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          <Sidebar 
            currentView={currentView} 
            onMenuClick={handleMenuClick}
            unreadNotificationsCount={unreadNotificationsCount}
            unreadMessagesCount={unreadMessagesCount}
          />
          <div className="flex-1 max-w-2xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="sm" onClick={handleBackToHome}>
                뒤로
              </Button>
              <h1 className="text-2xl font-semibold">개인정보 보호</h1>
            </div>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-semibold text-lg mb-2">개인정보 처리방침</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>FansHub는 사용자의 개인정보 보호를 중요시합니다.</p>
                  <p>수집하는 개인정보: 이메일, 결제 정보, 서비스 이용 기록</p>
                  <p>개인정보 보관 기간: 회원 탈퇴 시까지</p>
                  <p>개인정보 파기: 목적 달성 후 지체 없이 파기</p>
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-semibold text-lg mb-2">쿠키 정책</h3>
                <p className="text-sm text-muted-foreground">서비스 개선을 위해 쿠키를 사용합니다. 브라우저 설정에서 쿠키를 관리할 수 있습니다.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-semibold text-lg mb-2">데이터 삭제 요청</h3>
                <p className="text-sm text-muted-foreground mb-2">개인정보 삭제를 원하시면 아래 이메일로 요청해주세요.</p>
                <p className="text-primary">privacy@fanshub.com</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="pb-16">
            <TopHeader 
              title="개인정보 보호" 
              onNotificationClick={() => handleMenuClick('notifications')}
              unreadNotificationsCount={unreadNotificationsCount}
            />
            <div className="p-4 space-y-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-semibold mb-2">개인정보 처리방침</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>FansHub는 사용자의 개인정보 보호를 중요시합니다.</p>
                  <p>수집: 이메일, 결제 정보, 서비스 이용 기록</p>
                </div>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h3 className="font-semibold mb-2">데이터 삭제 요청</h3>
                <p className="text-primary text-sm">privacy@fanshub.com</p>
              </div>
            </div>
          </div>
          <BottomNavigation currentView={currentView} onMenuClick={handleMenuClick} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        <Sidebar 
          currentView={currentView} 
          onMenuClick={handleMenuClick}
          unreadNotificationsCount={unreadNotificationsCount}
          unreadMessagesCount={unreadMessagesCount}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Feed */}
          <div className="flex-1 max-w-2xl mx-auto">
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10">
              <h1 className="text-xl font-semibold text-foreground mb-4">팬스허브</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="크리에이터, 콘텐츠 검색..."
                  className="pl-10 bg-input border-border"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-2">
                  "{searchQuery}" 검색 결과: {filteredFeeds.length}개
                </p>
              )}
            </div>

            {/* Posts */}
            <div className="p-4">
              {filteredFeeds.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-foreground mb-2">검색 결과가 없습니다</h3>
                  <p className="text-muted-foreground">다른 키워드로 검색해보세요</p>
                </div>
              ) : (
                filteredFeeds.map((feed, index) => (
                  <FeedCard
                    key={index}
                    creator={feed.creator}
                    content={feed.content}
                    timestamp={feed.timestamp}
                    isBlurred={feed.isBlurred}
                    price={feed.price}
                    onCreatorClick={handleViewProfile}
                    onFeedClick={handleFeedClick}
                    onBookmark={handleBookmarkFeed}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar - Recommendations */}
          <div className="w-80 border-l border-border p-4">
            <div className="sticky top-4">
              <h2 className="font-semibold text-foreground mb-4">추천 크리에이터</h2>
              <div className="space-y-4">
                {recommendedCreators.map((creator, index) => (
                  <CreatorCard 
                    key={index} 
                    creator={creator} 
                    onProfileClick={handleViewProfile}
                  />
                ))}
              </div>
              
              {/* Footer Links */}
              <div className="mt-8 text-xs text-muted-foreground space-y-1">
                <div className="flex gap-2">
                  <span>개인정보처리���침</span>
                  <span>•</span>
                  <span>쿠키 정책</span>
                  <span>•</span>
                  <span>서비스 약관</span>
                </div>
                <div className="text-center pt-2">
                  <span>© 2024 FansHub. All rights reserved.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="pb-16">
          <TopHeader 
            title="팬스허브" 
            showSearch={true}
            onNotificationClick={() => handleMenuClick('notifications')}
            unreadNotificationsCount={unreadNotificationsCount}
          />
          
          {/* Posts */}
          <div className="p-4">
            {filteredFeeds.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-foreground mb-2">검색 결과가 없습니다</h3>
                <p className="text-muted-foreground">다른 키워드로 검색해보세요</p>
              </div>
            ) : (
              filteredFeeds.map((feed, index) => (
                <FeedCard
                  key={index}
                  creator={feed.creator}
                  content={feed.content}
                  timestamp={feed.timestamp}
                  isBlurred={feed.isBlurred}
                  price={feed.price}
                  onCreatorClick={handleViewProfile}
                  onFeedClick={handleFeedClick}
                  onBookmark={handleBookmarkFeed}
                />
              ))
            )}
          </div>

          {/* Recommended Creators Section */}
          <div className="p-4 border-t border-border">
            <h2 className="font-semibold text-foreground mb-4">추천 크리에이터</h2>
            <div className="space-y-4">
              {recommendedCreators.map((creator, index) => (
                <CreatorCard 
                  key={index} 
                  creator={creator} 
                  onProfileClick={handleViewProfile}
                />
              ))}
            </div>
          </div>
        </div>
        
        <BottomNavigation currentView={currentView} onMenuClick={handleMenuClick} />
      </div>
    </div>
  );
}