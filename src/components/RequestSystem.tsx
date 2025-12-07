import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  Heart, 
  DollarSign, 
  Clock, 
  Star,
  Send,
  Plus,
  Filter,
  TrendingUp,
  Users
} from 'lucide-react';

interface Request {
  id: string;
  username: string;
  avatar: string;
  title: string;
  description: string;
  price: number;
  category: 'custom' | 'outfit' | 'roleplay' | 'message' | 'other';
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  priority: number;
  timestamp: string;
  likes: number;
}

interface RequestSystemProps {
  creatorName: string;
  isCreator?: boolean;
}

const sampleRequests: Request[] = [
  {
    id: '1',
    username: 'fan_lover123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    title: '빨간 드레스 착용 요청',
    description: '지난번에 입으셨던 빨간 드레스로 사진 촬영 부탁드려요',
    price: 25,
    category: 'outfit',
    status: 'pending',
    priority: 8,
    timestamp: '2시간 전',
    likes: 12
  },
  {
    id: '2',
    username: 'premium_fan',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    title: '개인 메시지 요청',
    description: '생일 축하 메시지 녹음해주실 수 있나요?',
    price: 15,
    category: 'message',
    status: 'accepted',
    priority: 6,
    timestamp: '5시간 전',
    likes: 8
  },
  {
    id: '3',
    username: 'cute_supporter',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    title: '커스텀 컨셉 촬영',
    description: '카페에서 독서하는 모습으로 촬영 부탁합니다',
    price: 40,
    category: 'custom',
    status: 'pending',
    priority: 9,
    timestamp: '1일 전',
    likes: 24
  }
];

const categoryLabels = {
  custom: '커스텀',
  outfit: '의상',
  roleplay: '롤플레이',
  message: '메시지',
  other: '기타'
};

const statusLabels = {
  pending: '대기중',
  accepted: '수락됨',
  completed: '완료됨',
  declined: '거절됨'
};

const statusColors = {
  pending: 'bg-yellow-600',
  accepted: 'bg-blue-600',
  completed: 'bg-green-600',
  declined: 'bg-red-600'
};

export function RequestSystem({ creatorName, isCreator = false }: RequestSystemProps) {
  const [requests, setRequests] = useState<Request[]>(sampleRequests);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'price' | 'popularity'>('recent');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Create Request Form State
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    price: '',
    category: 'custom' as Request['category']
  });

  const handleCreateRequest = () => {
    const request: Request = {
      id: Date.now().toString(),
      username: 'you',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      title: newRequest.title,
      description: newRequest.description,
      price: parseFloat(newRequest.price),
      category: newRequest.category,
      status: 'pending',
      priority: Math.floor(Math.random() * 10) + 1,
      timestamp: '방금 전',
      likes: 0
    };

    setRequests([request, ...requests]);
    setNewRequest({ title: '', description: '', price: '', category: 'custom' });
    setShowCreateDialog(false);
  };

  const handleStatusChange = (requestId: string, newStatus: Request['status']) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: newStatus } : req
    ));
  };

  const handleLikeRequest = (requestId: string) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, likes: req.likes + 1 } : req
    ));
  };

  const getSortedAndFilteredRequests = () => {
    let filtered = requests;

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(req => req.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus);
    }

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.price - a.price;
        case 'popularity':
          return b.likes - a.likes;
        case 'recent':
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });
  };

  const getRequestStats = () => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const totalValue = requests.reduce((sum, r) => sum + r.price, 0);
    const avgPrice = total > 0 ? totalValue / total : 0;

    return { total, pending, totalValue, avgPrice };
  };

  const stats = getRequestStats();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground">총 요청</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-yellow-500">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">대기중</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-green-500">${stats.totalValue}</div>
            <div className="text-sm text-muted-foreground">총 금액</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-primary">${stats.avgPrice.toFixed(0)}</div>
            <div className="text-sm text-muted-foreground">평균 가격</div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {isCreator ? '받은 요청' : `${creatorName}에게 요청하기`}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isCreator 
              ? '팬들이 보낸 커스텀 요청들을 확인하고 관리하세요'
              : '원하는 컨셉이나 콘텐츠를 요청해보세요'
            }
          </p>
        </div>

        {!isCreator && (
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            새 요청
          </Button>
        )}
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-2">
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-[140px] bg-input border-border">
            <SelectValue placeholder="정렬" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">최신순</SelectItem>
            <SelectItem value="price">가격순</SelectItem>
            <SelectItem value="popularity">인기순</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[120px] bg-input border-border">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[120px] bg-input border-border">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {Object.entries(statusLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {getSortedAndFilteredRequests().map((request) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={request.avatar} />
                    <AvatarFallback>{request.username[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {request.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          by @{request.username} • {request.timestamp}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={`${statusColors[request.status]} text-white`}>
                          {statusLabels[request.status]}
                        </Badge>
                        <Badge variant="outline">
                          {categoryLabels[request.category]}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-foreground mb-3 line-clamp-2">
                      {request.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-primary font-semibold">
                          <DollarSign className="h-4 w-4" />
                          {request.price}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Star className="h-4 w-4" />
                          {request.priority}/10
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeRequest(request.id)}
                          className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                        >
                          <Heart className="h-4 w-4" />
                          {request.likes}
                        </Button>
                      </div>

                      {isCreator && request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(request.id, 'declined')}
                          >
                            거절
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(request.id, 'accepted')}
                            className="bg-primary hover:bg-primary/90"
                          >
                            수락
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {getSortedAndFilteredRequests().length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">요청이 없습니다</h3>
              <p className="text-muted-foreground">
                {isCreator 
                  ? '아직 받은 요청이 없습니다. 팬들이 요청을 보낼 때까지 기다려보세요!'
                  : '첫 번째 요청을 보내보세요!'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Request Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              새 요청 만들기
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="request-title">제목</Label>
              <Input
                id="request-title"
                placeholder="요청 제목을 입력하세요"
                value={newRequest.title}
                onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                className="bg-input border-border"
              />
            </div>

            <div>
              <Label htmlFor="request-category">카테고리</Label>
              <Select
                value={newRequest.category}
                onValueChange={(value: Request['category']) => 
                  setNewRequest({ ...newRequest, category: value })
                }
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="request-description">상세 설명</Label>
              <Textarea
                id="request-description"
                placeholder="원하는 컨텐츠나 컨셉을 자세히 설명해주세요"
                value={newRequest.description}
                onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                className="bg-input border-border min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="request-price">제안 금액 ($)</Label>
              <Input
                id="request-price"
                type="number"
                placeholder="10"
                value={newRequest.price}
                onChange={(e) => setNewRequest({ ...newRequest, price: e.target.value })}
                className="bg-input border-border"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleCreateRequest}
                disabled={!newRequest.title || !newRequest.description || !newRequest.price}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4 mr-2" />
                요청 보내기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}