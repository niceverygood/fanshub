import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, Camera } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CardRegistrationFormProps {
  onBack?: () => void;
  onCardAdded?: (cardData: any) => void;
}

export function CardRegistrationForm({ onBack, onCardAdded }: CardRegistrationFormProps) {
  const [formData, setFormData] = useState({
    country: 'KR',
    region: 'GYEONGGI',
    address: '',
    city: 'Seongnam-si',
    zipCode: '',
    email: 'niceverygood1@gmail.com',
    cardName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    ageConfirm: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 16);
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string, type: 'month' | 'year') => {
    const numbers = value.replace(/\D/g, '');
    if (type === 'month') {
      return numbers.slice(0, 2);
    }
    return numbers.slice(0, 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ageConfirm) {
      toast.error('만 18세 이상임을 확인해주세요');
      return;
    }

    if (!formData.cardNumber || !formData.expiryMonth || !formData.expiryYear || !formData.cvc) {
      toast.error('모든 카드 정보를 입력해주세요');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newCard = {
        id: Date.now().toString(),
        last4: formData.cardNumber.slice(-4),
        brand: getCardBrand(formData.cardNumber),
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        cardholderName: formData.cardName
      };

      onCardAdded?.(newCard);
      toast.success('카드가 성공적으로 등록되었습니다');
      
      if (onBack) {
        onBack();
      }
    } catch (error) {
      toast.error('카드 등록 중 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCardBrand = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    return 'Unknown';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-lg font-medium">카드 등록</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 청구 세부 정보 */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium mb-2">청구 세부 정보</h2>
              <p className="text-sm text-muted-foreground mb-6">
                당사는 결제 카드 업체 데이터 보호 표준을 완벽하게 준수합니다.
              </p>
            </div>

            {/* 국가 선택 */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">국가</Label>
              <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                <SelectTrigger className="w-full bg-input border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🇰🇷</span>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KR">
                    <div className="flex items-center gap-2">
                      <span>🇰🇷</span>
                      <span>대한민국</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="US">
                    <div className="flex items-center gap-2">
                      <span>🇺🇸</span>
                      <span>미국</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="JP">
                    <div className="flex items-center gap-2">
                      <span>🇯🇵</span>
                      <span>일본</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 본명/주소 */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">본명/주소</Label>
              <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
                <SelectTrigger className="w-full bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GYEONGGI">Gyeonggi-do</SelectItem>
                  <SelectItem value="SEOUL">Seoul</SelectItem>
                  <SelectItem value="BUSAN">Busan</SelectItem>
                  <SelectItem value="INCHEON">Incheon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 주소 */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">주소</Label>
              <Input
                placeholder="주소"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="bg-input border-border"
              />
            </div>

            {/* 도시 */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">도시</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="bg-input border-border"
              />
            </div>

            {/* 우편 번호 */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">우편 번호</Label>
              <Input
                placeholder="우편 번호"
                value={formData.zipCode}
                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                className="bg-input border-border"
              />
            </div>
          </div>

          {/* 카드 세부 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">카드 세부 정보</h3>

            {/* 이메일 주소 */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">이메일 주소</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-input border-border"
              />
            </div>

            {/* 카드의 이름 */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">카드의 이름</Label>
              <Input
                placeholder="카드의 이름"
                value={formData.cardName}
                onChange={(e) => setFormData(prev => ({ ...prev, cardName: e.target.value }))}
                className="bg-input border-border"
              />
            </div>

            {/* 카드 번호 */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">카드 번호</Label>
              <div className="relative">
                <Input
                  placeholder="카드 번호"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
                  maxLength={19}
                  className="bg-input border-border pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto"
                >
                  <Camera className="h-5 w-5 text-primary" />
                </Button>
              </div>
              <div className="text-sm text-primary underline cursor-pointer">
                내 카드 번호가 더 갖기
              </div>
            </div>

            {/* 만료일과 CVC */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">만료일</Label>
                <Input
                  placeholder="MM"
                  value={formData.expiryMonth}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryMonth: formatExpiry(e.target.value, 'month') }))}
                  maxLength={2}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground opacity-0">년</Label>
                <Input
                  placeholder="YY"
                  value={formData.expiryYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryYear: formatExpiry(e.target.value, 'year') }))}
                  maxLength={2}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">CVC</Label>
                <Input
                  placeholder="CVC"
                  value={formData.cvc}
                  onChange={(e) => setFormData(prev => ({ ...prev, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  maxLength={4}
                  className="bg-input border-border"
                />
              </div>
            </div>
          </div>

          {/* 18세 이상 확인 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ageConfirm"
              checked={formData.ageConfirm}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ageConfirm: !!checked }))}
            />
            <Label htmlFor="ageConfirm" className="text-sm text-muted-foreground">
              당신이 18 세 이상이고 거주지의 성년자임을 확인하려면 여기를 선택하십시오.
            </Label>
          </div>

          {/* 저장 버튼 */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3"
          >
            {isSubmitting ? '처리 중...' : '저장'}
          </Button>

          {/* 결제 카드 브랜드 로고 */}
          <div className="flex justify-center items-center gap-3 pt-4">
            <div className="text-xs text-muted-foreground text-center space-y-2">
              <div>Fenix International Limited, 5th Floor, 107 Cheapside, London, EC2V 6DN</div>
              <div>Fenix Payment LLC, 1209 N Orange Street, Suite 1200, Wilmington, Delaware, 19801 USA</div>
              <div className="flex justify-center gap-2 mt-3">
                <div className="w-8 h-5 bg-blue-600 text-white text-xs flex items-center justify-center rounded">VISA</div>
                <div className="w-8 h-5 bg-red-600 text-white text-xs flex items-center justify-center rounded">MC</div>
                <div className="w-8 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded">M</div>
                <div className="w-8 h-5 bg-gray-600 text-white text-xs flex items-center justify-center rounded">DC</div>
                <div className="w-8 h-5 bg-orange-500 text-white text-xs flex items-center justify-center rounded">D</div>
                <div className="w-8 h-5 bg-green-600 text-white text-xs flex items-center justify-center rounded">JCB</div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}