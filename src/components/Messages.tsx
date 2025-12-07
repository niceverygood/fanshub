import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Search, MoreVertical, Send, Phone, Video } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  isRead?: boolean;
}

interface Chat {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    isOnline: boolean;
  };
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: Message[];
}

interface MessagesProps {
  onBack: () => void;
  onProfileClick?: (user: any) => void;
}

const mockChats: Chat[] = [
  {
    id: '1',
    user: {
      name: 'Fina',
      username: 'soofina',
      avatar: 'https://images.unsplash.com/photo-1551929175-f82f676827b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwd29tYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg2NzUxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      isOnline: true
    },
    lastMessage: '새로운 콘텐츠 확인해보세요! 💕',
    timestamp: '2분 전',
    unreadCount: 3,
    messages: [
      { id: '1', text: '안녕하세요!', timestamp: '오후 2:30', isOwn: false },
      { id: '2', text: '안녕하세요! 구독 감사해요', timestamp: '오후 2:31', isOwn: true },
      { id: '3', text: '새로운 콘텐츠 확인해보세요! 💕', timestamp: '오후 2:35', isOwn: false, isRead: false }
    ]
  },
  {
    id: '2',
    user: {
      name: 'EARTHLY ALIEN',
      username: 'earthlyworm',
      avatar: 'https://images.unsplash.com/photo-1624948456761-0f2660d3dc5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGluZmx1ZW5jZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTg2MjI4MTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      isOnline: false
    },
    lastMessage: '감사합니다',
    timestamp: '1시간 전',
    unreadCount: 0,
    messages: [
      { id: '1', text: '좋은 콘텐츠 감사해요', timestamp: '오후 1:20', isOwn: true },
      { id: '2', text: '감사합니다', timestamp: '오후 1:25', isOwn: false }
    ]
  },
  {
    id: '3',
    user: {
      name: 'ash',
      username: 'ashtype',
      avatar: 'https://images.unsplash.com/photo-1646528192559-c163a2803f52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMHBvcnRyYWl0JTIwc3R1ZGlvfGVufDF8fHx8MTc1ODY3NTE3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      isOnline: true
    },
    lastMessage: '오늘 라이브 방송 할 예정이에요',
    timestamp: '3시간 전',
    unreadCount: 1,
    messages: [
      { id: '1', text: '오늘 라이브 방송 할 예정이에요', timestamp: '오전 11:30', isOwn: false, isRead: false }
    ]
  }
];

export function Messages({ onBack, onProfileClick }: MessagesProps) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = mockChats.filter(chat =>
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      isOwn: true
    };

    // 실제 앱에서는 메시지를 서버로 전송
    selectedChat.messages.push(message);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleProfileClick = (user: any) => {
    if (onProfileClick) {
      onProfileClick({
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        verified: false
      });
    }
  };

  if (selectedChat) {
    return (
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-border p-4 flex items-center justify-between bg-background">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedChat(null)}
              className="p-1 h-8 w-8"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar 
              className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleProfileClick(selectedChat.user);
              }}
            >
              <AvatarImage src={selectedChat.user.avatar} />
              <AvatarFallback>{selectedChat.user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{selectedChat.user.name}</div>
              <div className="text-sm text-muted-foreground">
                {selectedChat.user.isOnline ? '온라인' : '오프라인'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedChat.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-2xl ${
                  message.isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <div className="break-words">{message.text}</div>
                <div className={`text-xs mt-1 ${
                  message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
                }`}>
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                placeholder="메시지를 입력하세요..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="resize-none bg-input border-border"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="h-10 w-10 p-0 bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-1 h-8 w-8 lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">메시지</h1>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setSelectedChat(chat)}
            className="p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar 
                  className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileClick(chat.user);
                  }}
                >
                  <AvatarImage src={chat.user.avatar} />
                  <AvatarFallback>{chat.user.name[0]}</AvatarFallback>
                </Avatar>
                {chat.user.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium truncate">{chat.user.name}</div>
                  <div className="text-sm text-muted-foreground">{chat.timestamp}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground truncate">{chat.lastMessage}</div>
                  {chat.unreadCount > 0 && (
                    <div className="min-w-[20px] h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center px-1">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}