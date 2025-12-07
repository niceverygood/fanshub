import { useState } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  ArrowLeft, 
  Search, 
  Settings,
  Heart,
  MessageCircle,
  AtSign,
  UserPlus,
  DollarSign,
  Mail,
  Tag,
  Gift
} from 'lucide-react';
import { 
  Notification, 
  NotificationType, 
  NOTIFICATION_TABS,
  NotificationTab 
} from '../types/notification';

interface NotificationsProps {
  onBack: () => void;
  onNavigate: (type: 'profile' | 'post', data: any) => void;
}

export function Notifications({ onBack, onNavigate }: NotificationsProps) {
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [clickedNotification, setClickedNotification] = useState<string | null>(null);

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'like',
      user: {
        name: 'Sarah Kim',
        username: 'sarahkim',
        avatar: 'https://images.unsplash.com/photo-1551929175-f82f676827b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwd29tYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg2NzUxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        verified: true
      },
      message: '회원님의 게시물을 좋아합니다',
      timestamp: '5분 전',
      isRead: false,
      postImage: 'https://images.unsplash.com/photo-1627808869239-e68ec6e9b63e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWZlc3R5bGUlMjBjb250ZW50JTIwcGhvdG98ZW58MXx8fHwxNzU4Njc1MTU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: '2',
      type: 'subscribe',
      user: {
        name: 'Alex Chen',
        username: 'alexchen',
        avatar: 'https://images.unsplash.com/photo-1624948456761-0f2660d3dc5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGluZmx1ZW5jZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg2MjI4MTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      message: 'Gold 등급으로 구독했습니다',
      timestamp: '1시간 전',
      isRead: false,
      subscriptionTier: 'Gold'
    },
    {
      id: '3',
      type: 'tip',
      user: {
        name: 'Mike Johnson',
        username: 'mikej',
        avatar: 'https://images.unsplash.com/photo-1646528192559-c163a2803f52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMHBvcnRyYWl0JTIwc3R1ZGlvfGVufDF8fHx8MTc1ODY3NTE3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      message: '팁을 보냈습니다',
      timestamp: '3시간 전',
      isRead: true,
      amount: 25
    },
    {
      id: '4',
      type: 'comment',
      user: {
        name: 'Emma Wilson',
        username: 'emmaw',
        avatar: 'https://images.unsplash.com/photo-1642263039799-7515d7143225?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwcG9ydHJhaXQlMjB3b21hbnxlbnwxfHx8fDE3NTg2NzUxNzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      message: '회원님의 게시물에 댓글을 남겼습니다: "정말 멋져요!"',
      timestamp: '5시간 전',
      isRead: true,
      postImage: 'https://images.unsplash.com/photo-1627808869239-e68ec6e9b63e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWZlc3R5bGUlMjBjb250ZW50JTIwcGhvdG98ZW58MXx8fHwxNzU4Njc1MTU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: '5',
      type: 'mention',
      user: {
        name: 'David Park',
        username: 'davidp',
        avatar: 'https://images.unsplash.com/photo-1551929175-f82f676827b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwd29tYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg2NzUxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      message: '게시물에서 회원님을 언급했습니다',
      timestamp: '1일 전',
      isRead: true
    },
    {
      id: '6',
      type: 'promotion',
      user: {
        name: '팬스허브',
        username: 'official',
        avatar: 'https://images.unsplash.com/photo-1551929175-f82f676827b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwd29tYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg2NzUxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        verified: true
      },
      message: '새로운 프로모션 이벤트가 시작되었습니다! 지금 확인해보세요.',
      timestamp: '2일 전',
      isRead: true
    },
    {
      id: '7',
      type: 'tag',
      user: {
        name: 'Fina',
        username: 'soofina',
        avatar: 'https://images.unsplash.com/photo-1551929175-f82f676827b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwd29tYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg2NzUxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        verified: true
      },
      message: '새로운 게시물에서 회원님을 태그했습니다',
      timestamp: '3일 전',
      isRead: true,
      postImage: 'https://images.unsplash.com/photo-1654370488609-02aa42d7a639?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBiZWFjaCUyMHdvbWFufGVufDF8fHx8MTc1ODY3NTQzMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  ];

  const getNotificationIcon = (type: NotificationType) => {
    const iconProps = { className: "h-4 w-4" };
    
    switch (type) {
      case 'like':
        return <Heart {...iconProps} className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle {...iconProps} className="h-4 w-4 text-blue-500" />;
      case 'mention':
        return <AtSign {...iconProps} className="h-4 w-4 text-green-500" />;
      case 'subscribe':
        return <UserPlus {...iconProps} className="h-4 w-4 text-purple-500" />;
      case 'tip':
        return <DollarSign {...iconProps} className="h-4 w-4 text-yellow-500" />;
      case 'message':
        return <Mail {...iconProps} className="h-4 w-4 text-blue-400" />;
      case 'tag':
        return <Tag {...iconProps} className="h-4 w-4 text-orange-500" />;
      case 'promotion':
        return <Gift {...iconProps} className="h-4 w-4 text-pink-500" />;
      default:
        return <Heart {...iconProps} />;
    }
  };

  const filterNotifications = (notifications: Notification[], tab: NotificationTab) => {
    if (tab === 'all') return notifications;
    return notifications.filter(notification => notification.type === tab);
  };

  const filteredNotifications = filterNotifications(mockNotifications, activeTab);

  const handleNotificationClick = (notification: Notification) => {
    // 클릭 효과 표시
    setClickedNotification(notification.id);
    
    // 알림을 읽음으로 표시
    const updatedNotifications = mockNotifications.map(n => 
      n.id === notification.id ? { ...n, isRead: true } : n
    );

    // 약간의 지연 후 네비게이션 (시각적 피드백을 위해)
    setTimeout(() => {
      // 알림 타입별로 다른 네비게이션 처리
      switch (notification.type) {
        case 'like':
        case 'comment':
        case 'mention':
          // 게시물 관련 알림은 크리에이터 프로필로 이동 (게시물 상세가 없으므로)
          onNavigate('profile', notification.user);
          break;
        case 'subscribe':
        case 'tip':
          // 구독/팁 알림은 해당 사용자 프로필로 이동
          onNavigate('profile', notification.user);
          break;
        case 'message':
          // 메시지 알림은 해당 사용자 프로필로 이동
          onNavigate('profile', notification.user);
          break;
        case 'promotion':
          // 프로모션 알림은 현재 홈으로 이동 (프로모션 페이지가 없으므로)
          onBack();
          break;
        case 'tag':
          // 태그 알림은 해당 게시물로 이동 (현재는 크리에이터 프로필로)
          onNavigate('profile', notification.user);
          break;
        default:
          break;
      }
      setClickedNotification(null);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold text-foreground">알림</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as NotificationTab)}>
          <TabsList className="bg-muted w-full justify-start overflow-x-auto">
            {NOTIFICATION_TABS.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="whitespace-nowrap"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Notifications Content */}
      <div className="p-4">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-foreground mb-2">현재 알림이 없습니다!</h3>
            <p className="text-muted-foreground text-sm">
              새로운 알림이 있을 때 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-all duration-150 cursor-pointer ${
                  !notification.isRead ? 'bg-primary/5 border-primary/20' : 'bg-card'
                } ${
                  clickedNotification === notification.id ? 'scale-[0.98] bg-muted' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Avatar */}
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                  <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getNotificationIcon(notification.type)}
                        <span className="font-medium text-foreground">
                          {notification.user.name}
                        </span>
                        {notification.user.verified && (
                          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground text-xs">✓</span>
                          </div>
                        )}
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>

                      {/* Additional info */}
                      <div className="flex items-center gap-2">
                        {notification.amount && (
                          <Badge className="bg-yellow-600 text-white">
                            ${notification.amount}
                          </Badge>
                        )}
                        {notification.subscriptionTier && (
                          <Badge className="bg-purple-600 text-white">
                            {notification.subscriptionTier}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {notification.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Post image if exists */}
                    {notification.postImage && (
                      <ImageWithFallback
                        src={notification.postImage}
                        alt="Post"
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}