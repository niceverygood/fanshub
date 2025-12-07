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
import { ArrowLeft, Upload, Image, DollarSign, Users, Crown } from 'lucide-react';

interface CreatePostProps {
  onBack: () => void;
  onPost: () => void;
}

export function CreatePost({ onBack, onPost }: CreatePostProps) {
  const [postContent, setPostContent] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>('free');
  const [isPaidPost, setIsPaidPost] = useState(false);
  const [paidPrice, setPaidPrice] = useState(5);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const visibilityOptions = [
    { value: 'free', label: 'Free', description: '누구나 볼 수 있음', icon: Users, color: '#6b7280' },
    { value: 'basic', label: 'Basic', description: 'Basic 구독자 이상', icon: Crown, color: '#64748b' },
    { value: 'silver', label: 'Silver', description: 'Silver 구독자 이상', icon: Crown, color: '#94a3b8' },
    { value: 'gold', label: 'Gold', description: 'Gold 구독자 이상', icon: Crown, color: '#fbbf24' },
    { value: 'platinum', label: 'Platinum', description: 'Platinum 구독자만', icon: Crown, color: '#a855f7' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedImages(prev => [...prev, ...files].slice(0, 4)); // 최대 4개
      
      // 미리보기 URL 생성
      files.forEach(file => {
        const url = URL.createObjectURL(file);
        setPreviewUrls(prev => [...prev, url].slice(0, 4));
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]); // 메모리 정리
      return prev.filter((_, i) => i !== index);
    });
  };

  const handlePost = () => {
    const postData = {
      content: postContent,
      visibility: isPaidPost ? 'paid' : visibility,
      price: isPaidPost ? paidPrice : null,
      images: selectedImages,
      timestamp: new Date().toISOString()
    };
    
    console.log('새 포스트 작성:', postData);
    onPost();
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
            <h1 className="font-semibold text-foreground">새 포스트 작성</h1>
          </div>
          <Button 
            onClick={handlePost}
            disabled={!postContent.trim() && selectedImages.length === 0}
            className="bg-primary hover:bg-primary/90"
          >
            게시하기
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* 포스트 내용 */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>포스트 내용</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="무슨 일이 일어나고 있나요?"
                className="bg-input border-border min-h-[120px]"
                rows={5}
              />
            </CardContent>
          </Card>

          {/* 이미지 업로드 */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                이미지 추가
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>이미지 선택</span>
                    </div>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <span className="text-sm text-muted-foreground">
                    최대 4개까지 업로드 가능
                  </span>
                </div>

                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          ×
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
              {!isPaidPost && (
                <div>
                  <Label>구독 등급별 공개</Label>
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

              <div className={!isPaidPost ? "border-t border-border pt-4" : ""}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      별도 과금 포스트
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      구독과 별개로 이 포스트만 유료로 판매
                    </p>
                  </div>
                  <Switch
                    checked={isPaidPost}
                    onCheckedChange={setIsPaidPost}
                  />
                </div>

                {isPaidPost && (
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
                      {postContent || '포스트 내용이 여기에 표시됩니다...'}
                    </p>
                    
                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {previewUrls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {isPaidPost ? (
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