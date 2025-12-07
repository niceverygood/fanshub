import { Home, MessageCircle, Users, User, Plus } from 'lucide-react';
import { Button } from './ui/button';

interface BottomNavigationProps {
  currentView: string;
  onMenuClick: (menu: string) => void;
}

const leftMenuItems = [
  { id: 'home', icon: Home, label: '홈' },
  { id: 'messages', icon: MessageCircle, label: '메시지' },
];

const rightMenuItems = [
  { id: 'subscriptions', icon: Users, label: '구독' },
  { id: 'myprofile', icon: User, label: '내 프로필' },
];

export function BottomNavigation({ currentView, onMenuClick }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-bottom">
      <div className="relative flex items-center h-16 px-2">
        {/* Left menu items - fixed width */}
        <div className="flex w-1/2">
          {leftMenuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex-1 h-full rounded-none flex flex-col items-center justify-center gap-1 px-2 ${
                currentView === item.id 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
              onClick={() => onMenuClick(item.id)}
            >
              <item.icon className={`h-5 w-5 ${currentView === item.id ? 'text-primary' : ''}`} />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>

        {/* Center create button - absolute positioned */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Button
            variant="default"
            size="sm"
            className={`h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg transition-all duration-200 transform hover:scale-105 ${
              currentView === 'create' ? 'scale-105 bg-primary/90' : ''
            }`}
            onClick={() => onMenuClick('create')}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Right menu items - fixed width */}
        <div className="flex w-1/2">
          {rightMenuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex-1 h-full rounded-none flex flex-col items-center justify-center gap-1 px-2 ${
                currentView === item.id 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
              onClick={() => onMenuClick(item.id)}
            >
              <item.icon className={`h-5 w-5 ${currentView === item.id ? 'text-primary' : ''}`} />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}