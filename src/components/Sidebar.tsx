import { 
  Home, 
  Bell, 
  MessageCircle, 
  Bookmark, 
  Users, 
  CreditCard, 
  User, 
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { Button } from './ui/button';

interface SidebarProps {
  currentView?: string;
  onMenuClick?: (menu: string) => void;
  unreadNotificationsCount?: number;
  unreadMessagesCount?: number;
}

const menuItems = [
  { id: 'home', icon: Home, label: '홈' },
  { id: 'notifications', icon: Bell, label: '알림' },
  { id: 'messages', icon: MessageCircle, label: '메시지' },
  { id: 'collections', icon: Bookmark, label: '컬렉션' },
  { id: 'subscriptions', icon: Users, label: '구독' },
  { id: 'cards', icon: CreditCard, label: '카드 추가' },
  { id: 'myprofile', icon: User, label: '내 프로필' },
  { id: 'more', icon: MoreHorizontal, label: '더 보기' },
];

export function Sidebar({ currentView = 'home', onMenuClick, unreadNotificationsCount = 0, unreadMessagesCount = 0 }: SidebarProps) {
  return (
    <div className="w-60 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-primary text-xl font-bold">팬스허브</h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Button
                variant={currentView === item.id ? "default" : "ghost"}
                className={`w-full justify-start gap-3 h-12 ${
                  currentView === item.id 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
                onClick={() => onMenuClick?.(item.id)}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === 'notifications' && unreadNotificationsCount > 0 && (
                  <span className="min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                  </span>
                )}
                {item.id === 'messages' && unreadMessagesCount > 0 && (
                  <span className="min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                  </span>
                )}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* New Creator Button */}
      <div className="p-4">
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          onClick={() => onMenuClick?.('create')}
        >
          <Plus className="h-4 w-4" />
          새 피드
        </Button>
      </div>
    </div>
  );
}