import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Camera, X } from 'lucide-react';
import { toast } from 'sonner';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    name: string;
    username: string;
    avatar: string;
    coverImage: string;
    bio: string;
  };
  onSave?: (profile: any) => void;
}

export function EditProfileDialog({ open, onOpenChange, profile, onSave }: EditProfileDialogProps) {
  const [formData, setFormData] = useState({
    name: profile.name,
    username: profile.username,
    bio: profile.bio,
  });
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);
  const [coverPreview, setCoverPreview] = useState(profile.coverImage);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('이름을 입력해주세요');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave?.({
        ...formData,
        avatar: avatarPreview,
        coverImage: coverPreview
      });
      
      toast.success('프로필이 수정되었습니다!');
      onOpenChange(false);
    } catch (error) {
      toast.error('프로필 수정 중 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>프로필 수정</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 커버 이미지 */}
          <div className="relative">
            <div 
              className="h-32 w-full rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${coverPreview})` }}
            />
            <Label 
              htmlFor="cover-upload" 
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
            >
              <div className="flex items-center gap-2 text-white">
                <Camera className="h-5 w-5" />
                <span>커버 변경</span>
              </div>
            </Label>
            <Input
              id="cover-upload"
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
          </div>

          {/* 프로필 이미지 */}
          <div className="flex justify-center -mt-12">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback className="text-2xl">{formData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer hover:bg-primary/90"
              >
                <Camera className="h-4 w-4 text-white" />
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          {/* 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="이름을 입력하세요"
            />
          </div>

          {/* 사용자명 */}
          <div className="space-y-2">
            <Label htmlFor="username">사용자명</Label>
            <div className="flex items-center">
              <span className="text-muted-foreground mr-1">@</span>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') 
                }))}
                placeholder="username"
              />
            </div>
          </div>

          {/* 소개 */}
          <div className="space-y-2">
            <Label htmlFor="bio">소개</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="자신을 소개해보세요"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">{formData.bio.length}/300</p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

