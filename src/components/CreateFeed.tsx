import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { SUBSCRIPTION_TIERS, PostVisibility } from '../types/subscription';
import { ArrowLeft, Upload, Image, Video, DollarSign, Users, Crown, Play, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface CreateFeedProps {
  onBack: () => void;
  onPost: () => void;
}

export function CreateFeed({ onBack, onPost }: CreateFeedProps) {
  const { user } = useAuth();
  const [feedContent, setFeedContent] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>('free');
  const [isPaidFeed, setIsPaidFeed] = useState(false);
  const [paidPrice, setPaidPrice] = useState(5);
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [mediaTypes, setMediaTypes] = useState<('image' | 'video')[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug: Log state changes
  console.log('[CreateFeed] Component rendered');
  console.log('[CreateFeed] feedContent:', feedContent);
  console.log('[CreateFeed] user:', user?.id);

  const visibilityOptions = [
    { value: 'free', label: 'Free', description: '누구나 볼 수 있음', icon: Users, color: '#6b7280' },
    { value: 'basic', label: 'Basic', description: 'Basic 구독자 이상', icon: Crown, color: '#64748b' },
    { value: 'silver', label: 'Silver', description: 'Silver 구독자 이상', icon: Crown, color: '#94a3b8' },
    { value: 'gold', label: 'Gold', description: 'Gold 구독자 이상', icon: Crown, color: '#fbbf24' },
    { value: 'platinum', label: 'Platinum', description: 'Platinum 구독자만', icon: Crown, color: '#a855f7' }
  ];

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, mediaType: 'image' | 'video') => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = files.slice(0, 4 - selectedMedia.length); // 최대 4개
      
      setSelectedMedia(prev => [...prev, ...newFiles]);
      
      // 미리보기 URL 및 타입 생성
      newFiles.forEach(file => {
        const url = URL.createObjectURL(file);
        setPreviewUrls(prev => [...prev, url]);
        setMediaTypes(prev => [...prev, file.type.startsWith('video/') ? 'video' : 'image']);
      });
    }
  };

  const removeMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]); // 메모리 정리
      return prev.filter((_, i) => i !== index);
    });
    setMediaTypes(prev => prev.filter((_, i) => i !== index));
  };

  const uploadMedia = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('feeds')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Upload error:', error);
        return null;
      }
      
      const { data: urlData } = supabase.storage
        .from('feeds')
        .getPublicUrl(data.path);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handlePost = async () => {
    console.log('=== handlePost called ===');
    console.log('User:', user);
    
    if (!user) {
      console.error('User is null!');
      toast.error('로그인이 필요합니다. 페이지를 새로고침해주세요.');
      return;
    }

    if (!feedContent.trim() && selectedMedia.length === 0) {
      toast.error('내용이나 미디어를 추가해주세요.');
      return;
    }

    setIsSubmitting(true);
    console.log('Starting feed creation...');

    try {
      // 미디어 업로드
      let mediaUrls: string[] = [];
      if (selectedMedia.length > 0) {
        console.log('Uploading media files:', selectedMedia.length);
        const uploadPromises = selectedMedia.map(file => uploadMedia(file));
        const results = await Promise.all(uploadPromises);
        mediaUrls = results.filter((url): url is string => url !== null);
        console.log('Uploaded media URLs:', mediaUrls);
        
        if (mediaUrls.length !== selectedMedia.length) {
          console.warn('Some media uploads failed');
          toast.error('일부 미디어 업로드에 실패했습니다.');
        }
      }

      // 피드 데이터 준비
      const visibilityToTierLevel: Record<string, number> = {
        'free': 0,
        'basic': 1,
        'silver': 2,
        'gold': 3,
        'platinum': 4
      };

      const feedData = {
        creator_id: user.id,
        content_text: feedContent || null,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        media_type: mediaTypes.length > 0 ? (mediaTypes.includes('video') ? 'video' : 'image') as 'image' | 'video' : null,
        is_premium: isPaidFeed || visibility !== 'free',
        price: isPaidFeed ? paidPrice : null,
        required_tier_level: isPaidFeed ? 0 : visibilityToTierLevel[visibility] || 0
      };

      console.log('Feed data to insert:', feedData);

      // 피드 생성
      const { data, error } = await supabase
        .from('feeds')
        .insert(feedData)
        .select()
        .single();

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Feed creation error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        throw error;
      }

      console.log('Feed created successfully:', data);
      toast.success('피드가 성공적으로 게시되었습니다!');
      onPost();
    } catch (error: any) {
      console.error('Post error:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      toast.error(error.message || '피드 게시에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVisibilityBadge = (vis: PostVisibility) => {
    const option = visibilityOptions.find(opt => opt.value === vis);
    if (!option) return null;
    
    const Icon = option.icon;
    return (
      <Badge style={{ backgroundColor: option.color, color: 'white' }} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {option.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold text-foreground">새 피드 작성</h1>
          </div>
          <Button 
            onClick={() => {
              console.log('Button clicked!');
              console.log('feedContent:', feedContent);
              console.log('selectedMedia:', selectedMedia.length);
              console.log('isSubmitting:', isSubmitting);
              handlePost();
            }}
            disabled={isSubmitting || (!feedContent.trim() && selectedMedia.length === 0)}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                게시 중...
              </>
            ) : (
              '게시하기'
            )}
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* 피드 내용 */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>피드 내용</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={feedContent}
                onChange={(e) => setFeedContent(e.target.value)}
                placeholder="무슨 일이 일어나고 있나요?"
                className="bg-input border-border min-h-[120px]"
                rows={5}
              />
            </CardContent>
          </Card>

          {/* 미디어 업로드 */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                미디어 추가
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                      <Image className="h-4 w-4" />
                      <span>이미지 선택</span>
                    </div>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleMediaUpload(e, 'image')}
                    className="hidden"
                  />
                  
                  <Label htmlFor="video-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                      <Video className="h-4 w-4" />
                      <span>동영상 선택</span>
                    </div>
                  </Label>
                  <Input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleMediaUpload(e, 'video')}
                    className="hidden"
                  />
                  
                  <span className="text-sm text-muted-foreground">
                    최대 4개까지 업로드 가능 (이미지 + 동영상)
                  </span>
                </div>

                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        {mediaTypes[index] === 'video' ? (
                          <div className="relative">
                            <video
                              src={url}
                              className="w-full h-32 object-cover rounded-lg"
                              controls={false}
                              muted
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg">
                              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                <Play className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 left-2">
                              <Badge className="bg-black/60 text-white text-xs">
                                <Video className="h-3 w-3 mr-1" />
                                동영상
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removeMedia(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 공개 범위 설정 */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>공개 범위</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isPaidFeed && (
                <div>
                  <Label className="block mb-2">구독 등급별 공개</Label>
                  <Select value={visibility} onValueChange={(value: PostVisibility) => setVisibility(value)}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="공개 범위 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {visibilityOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" style={{ color: option.color }} />
                              <span>{option.label}</span>
                              <span className="text-muted-foreground">- {option.description}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className={!isPaidFeed ? "border-t border-border pt-4" : ""}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      별도 과금 피드
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      구독과 별개로 이 피드만 유료로 판매
                    </p>
                  </div>
                  <Switch
                    checked={isPaidFeed}
                    onCheckedChange={setIsPaidFeed}
                  />
                </div>

                {isPaidFeed && (
                  <div>
                    <Label htmlFor="paid-price">판매 가격 ($)</Label>
                    <Input
                      id="paid-price"
                      type="number"
                      min="1"
                      step="0.01"
                      value={paidPrice}
                      onChange={(e) => setPaidPrice(parseFloat(e.target.value))}
                      className="bg-input border-border"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 미리보기 */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg p-4 bg-background">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                    Y
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Your Name</span>
                      <span className="text-muted-foreground text-sm">@yourname</span>
                      <span className="text-muted-foreground text-sm">•</span>
                      <span className="text-muted-foreground text-sm">지금</span>
                    </div>
                    <p className="text-foreground mb-3">
                      {feedContent || '피드 내용이 여기에 표시됩니다...'}
                    </p>
                    
                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative">
                            {mediaTypes[index] === 'video' ? (
                              <div className="relative">
                                <video
                                  src={url}
                                  className="w-full h-32 object-cover rounded"
                                  controls={false}
                                  muted
                                />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded">
                                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
                                    <Play className="h-4 w-4 text-white" />
                                  </div>
                                </div>
                                <div className="absolute bottom-1 left-1">
                                  <Badge className="bg-black/60 text-white text-xs px-1">
                                    <Video className="h-2 w-2 mr-1" />
                                    동영상
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {isPaidFeed ? (
                        <Badge className="bg-green-600 text-white">${paidPrice}</Badge>
                      ) : (
                        getVisibilityBadge(visibility)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}