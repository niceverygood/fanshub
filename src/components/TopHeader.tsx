import { Bell, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface TopHeaderProps {
  title: string;
  showSearch?: boolean;
  onNotificationClick: () => void;
  unreadNotificationsCount?: number;
}

export function TopHeader({ 
  title, 
  showSearch = false, 
  onNotificationClick, 
  unreadNotificationsCount = 0 
}: TopHeaderProps) {
  return (
    <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 relative"
            onClick={onNotificationClick}
          >
            <Bell className="h-5 w-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
              </span>
            )}
          </Button>
        </div>
      </div>
      
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="검색"
            className="pl-10 bg-input border-border"
          />
        </div>
      )}
    </div>
  );
}