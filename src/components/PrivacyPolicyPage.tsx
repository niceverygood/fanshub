import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { useState } from 'react';
import { toast } from 'sonner';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    showActivity: true,
    showSubscriptions: false,
    allowMessages: true,
    marketingEmails: false,
  });

  const handleToggle = (key: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('설정이 저장되었습니다');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-10">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">개인정보 보호</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* 개인정보 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              개인정보 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">공개 프로필</div>
                <div className="text-sm text-muted-foreground">다른 사용자가 내 프로필을 볼 수 있습니다</div>
              </div>
              <Switch 
                checked={privacySettings.profilePublic}
                onCheckedChange={() => handleToggle('profilePublic')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">활동 상태 표시</div>
                <div className="text-sm text-muted-foreground">온라인 상태를 다른 사용자에게 표시합니다</div>
              </div>
              <Switch 
                checked={privacySettings.showActivity}
                onCheckedChange={() => handleToggle('showActivity')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">구독 목록 공개</div>
                <div className="text-sm text-muted-foreground">다른 사용자가 내 구독 목록을 볼 수 있습니다</div>
              </div>
              <Switch 
                checked={privacySettings.showSubscriptions}
                onCheckedChange={() => handleToggle('showSubscriptions')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">메시지 허용</div>
                <div className="text-sm text-muted-foreground">크리에이터로부터 메시지를 받을 수 있습니다</div>
              </div>
              <Switch 
                checked={privacySettings.allowMessages}
                onCheckedChange={() => handleToggle('allowMessages')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">마케팅 이메일</div>
                <div className="text-sm text-muted-foreground">프로모션 및 뉴스레터 수신</div>
              </div>
              <Switch 
                checked={privacySettings.marketingEmails}
                onCheckedChange={() => handleToggle('marketingEmails')}
              />
            </div>
          </CardContent>
        </Card>

        {/* 개인정보 처리방침 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-primary" />
              개인정보 처리방침
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">수집하는 개인정보</h4>
                <p>이메일, 결제 정보, 이용 기록 등 서비스 제공에 필요한 최소한의 정보만 수집합니다.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">정보의 보호</h4>
                <p>모든 개인정보는 암호화되어 안전하게 저장되며, 외부에 공개되지 않습니다.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <UserCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">정보의 이용</h4>
                <p>수집된 정보는 서비스 제공, 고객 지원, 서비스 개선 목적으로만 사용됩니다.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">이용자의 권리</h4>
                <p>언제든지 개인정보 열람, 수정, 삭제를 요청하실 수 있습니다.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 데이터 관리 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">데이터 관리</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              내 데이터 다운로드
            </Button>
            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
              계정 삭제 요청
            </Button>
          </CardContent>
        </Card>

        {/* 연락처 */}
        <Card className="bg-muted/30">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              개인정보 관련 문의사항이 있으시면 아래로 연락해주세요
            </p>
            <p className="text-sm font-medium text-foreground">
              privacy@fanshub.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

