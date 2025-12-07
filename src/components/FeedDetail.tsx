import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  MoreHorizontal, 
  Lock, 
  DollarSign, 
  Gift, 
  BarChart3, 
  Send,
  Video,
  Share
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PaymentDialog } from './PaymentDialog';
import { TipGiftDialog } from './TipGiftDialog';
import { PollQuizDialog } from './PollQuizDialog';
import { toast } from 'sonner';

interface FeedDetailProps {
  feed: {
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
  };
  onBack: () => void;
  onCreatorClick?: (creator: any) => void;
}

interface Comment {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

const mockComments: Comment[] = [
  {
    id: '1',
    user: {
      name: '팬123',
      username: 'fan123',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG1hbnxlbnwxfHx8fDE3NTg2NzUyMDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      verified: false
    },
    content: '정말 멋진 콘텐츠네요! 👏',
    timestamp: '2시간 전',
    likes: 12,
    isLiked: false
  },
  {
    id: '2',
    user: {
      name: 'CoolUser',
      username: 'cooluser99',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHdvbWFufGVufDF8fHx8MTc1ODY3NTIwM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      verified: true
    },
    content: '언제나 최고의 작품이네요 ✨ 기대하고 있었어요!',
    timestamp: '1시간 전',
    likes: 8,
    isLiked: true
  },
  {
    id: '3',
    user: {
      name: 'ArtLover',
      username: 'artlover2024',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG1hbiUyMHNtaWxlfGVufDF8fHx8MTc1ODY3NTIwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      verified: false
    },
    content: '다음 작품도 기대할게요! 🔥',
    timestamp: '30분 전',
    likes: 5,
    isLiked: false
  }
];

export function FeedDetail({ feed, onBack, onCreatorClick }: FeedDetailProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [showPollDialog, setShowPollDialog] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(47);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { creator, content, timestamp, isBlurred = false, price } = feed;

  const handleUnlock = () => {
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

  const handleCreatorClick = () => {
    if (onCreatorClick) {
      onCreatorClick(creator);
    }
  };

  const handleTipSent = (type: 'tip' | 'gift', amount: number, message?: string, giftType?: string) => {
    console.log(`${type} sent:`, { amount, message, giftType, creator: creator.name });
    toast.success(`${creator.name}님에게 ${type === 'tip' ? '팁' : '선물'}을 보냈습니다!`);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: {
          name: '내 계정',
          username: 'myaccount',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG1hbiUyMGZhY2V8ZW58MXx8fHwxNzU4Njc1MjA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          verified: false
        },
        content: newComment,
        timestamp: '방금 전',
        likes: 0,
        isLiked: false
      };
      setComments([comment, ...comments]);
      setNewComment('');
      toast.success('댓글이 작성되었습니다!');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    if (!isLiked) {
      toast.success('좋아요를 눌렀습니다!');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (!isBookmarked) {
      toast.success('컬렉션에 저장되었습니다!');
    } else {
      toast.success('컬렉션에서 제거되었습니다.');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${creator.name}의 피드`,
          text: content.text,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('링크가 클립보드에 복사되었습니다!');
      }
    } catch (error) {
      console.log('Share cancelled');
    }
  };

  const handleCommentLike = (commentId: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId
        ? {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    ));
  };

  const shouldShowBlur = isBlurred && !isUnlocked;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold">피드</h1>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleShare}>
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Main Feed Content */}
        <Card className="bg-card border-border border-0 border-b rounded-none">
          <CardContent className="p-6">
            {/* Creator Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 cursor-pointer" onClick={handleCreatorClick}>
                <Avatar className="h-12 w-12">
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
            <div className="mb-6">
              <p className="text-card-foreground mb-4 leading-relaxed">{content.text}</p>
              {(content.image || content.video) && (
                <div className="relative rounded-lg overflow-hidden">
                  {content.video || content.mediaType === 'video' ? (
                    <div className="relative">
                      <video
                        src={content.video || content.image}
                        className={`w-full max-h-[500px] object-cover transition-all duration-300 ${
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
                      className={`w-full max-h-[500px] object-cover transition-all duration-300 ${
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

            {/* Engagement Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span>{likeCount}개의 좋아요</span>
              <span>{comments.length}개의 댓글</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`gap-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                  onClick={handleLike}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  좋아요
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-card-foreground">
                  <MessageCircle className="h-5 w-5" />
                  댓글달기
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-muted-foreground hover:text-primary"
                  onClick={() => setShowTipDialog(true)}
                >
                  <Gift className="h-5 w-5" />
                  팁
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-muted-foreground hover:text-blue-500"
                  onClick={() => setShowPollDialog(true)}
                >
                  <BarChart3 className="h-5 w-5" />
                  투표
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
        </Card>

        {/* Comments Section */}
        <div className="bg-card border-b border-border">
          {/* Add Comment */}
          <div className="p-4 border-b border-border">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMG1hbiUyMGZhY2V8ZW58MXx8fHwxNzU4Njc1MjA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />
                <AvatarFallback>나</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="댓글을 입력하세요..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  size="sm" 
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="divide-y divide-border">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={comment.user.avatar} />
                    <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{comment.user.name}</span>
                      {comment.user.verified && (
                        <div className="w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">✓</span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">@{comment.user.username}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-card-foreground mb-2">{comment.content}</p>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-auto p-0 text-xs ${
                          comment.isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                        }`}
                        onClick={() => handleCommentLike(comment.id)}
                      >
                        <Heart className={`h-3 w-3 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
                        {comment.likes > 0 && comment.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-card-foreground"
                      >
                        답글
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
    </div>
  );
}