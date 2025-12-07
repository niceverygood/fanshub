import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CreditCard, Lock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCardAdded?: (cardData: any) => void;
}

export function AddCardDialog({ open, onOpenChange, onCardAdded }: AddCardDialogProps) {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: 'KR'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCardNumber = (value: string) => {
    // 숫자만 추출하고 16자리로 제한
    const numbers = value.replace(/\D/g, '').slice(0, 16);
    // 4자리씩 공백으로 구분
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 카드 번호 검증 (16자리)
    const cardNumbers = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumbers) {
      newErrors.cardNumber = '카드 번호를 입력해주세요';
    } else if (cardNumbers.length !== 16) {
      newErrors.cardNumber = '올바른 카드 번호를 입력해주세요 (16자리)';
    }

    // 만료월 검증
    if (!formData.expiryMonth) {
      newErrors.expiryMonth = '만료월을 선택해주세요';
    }

    // 만료년 검증
    if (!formData.expiryYear) {
      newErrors.expiryYear = '만료년을 선택해주세요';
    }

    // CVV 검증
    if (!formData.cvv) {
      newErrors.cvv = 'CVV를 입력해주세요';
    } else if (formData.cvv.length < 3 || formData.cvv.length > 4) {
      newErrors.cvv = 'CVV는 3-4자리입니다';
    }

    // 카드 소유자명 검증
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = '카드 소유자명을 입력해주세요';
    }

    // 청구지 주소 검증
    if (!formData.billingAddress.trim()) {
      newErrors.billingAddress = '청구지 주소를 입력해주세요';
    }

    // 도시 검증
    if (!formData.city.trim()) {
      newErrors.city = '도시를 입력해주세요';
    }

    // 우편번호 검증
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = '우편번호를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 실제 앱에서는 결제 서비스 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션

      const newCard = {
        id: Date.now().toString(),
        last4: formData.cardNumber.slice(-4),
        brand: getCardBrand(formData.cardNumber),
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        cardholderName: formData.cardholderName
      };

      onCardAdded?.(newCard);
      
      // 폼 초기화
      setFormData({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
        billingAddress: '',
        city: '',
        zipCode: '',
        country: 'KR'
      });

      toast.success('카드가 성공적으로 추가되었습니다');
      onOpenChange(false);
    } catch (error) {
      toast.error('카드 추가 중 오류가 발생했습니다');
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { value: month.toString().padStart(2, '0'), label: month.toString().padStart(2, '0') };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            새 카드 추가
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 카드 정보 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">카드 번호</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  cardNumber: formatCardNumber(e.target.value) 
                }))}
                maxLength={19}
                className={errors.cardNumber ? 'border-destructive' : ''}
              />
              {errors.cardNumber && (
                <p className="text-sm text-destructive mt-1">{errors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="expiryMonth">만료월</Label>
                <Select 
                  value={formData.expiryMonth} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, expiryMonth: value }))}
                >
                  <SelectTrigger className={errors.expiryMonth ? 'border-destructive' : ''}>
                    <SelectValue placeholder="월" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.expiryMonth && (
                  <p className="text-sm text-destructive mt-1">{errors.expiryMonth}</p>
                )}
              </div>

              <div>
                <Label htmlFor="expiryYear">만료년</Label>
                <Select 
                  value={formData.expiryYear} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, expiryYear: value }))}
                >
                  <SelectTrigger className={errors.expiryYear ? 'border-destructive' : ''}>
                    <SelectValue placeholder="년" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.expiryYear && (
                  <p className="text-sm text-destructive mt-1">{errors.expiryYear}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cvv" className="flex items-center gap-1">
                  CVV
                  <Lock className="h-3 w-3" />
                </Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    cvv: e.target.value.replace(/\D/g, '').slice(0, 4) 
                  }))}
                  maxLength={4}
                  className={errors.cvv ? 'border-destructive' : ''}
                />
                {errors.cvv && (
                  <p className="text-sm text-destructive mt-1">{errors.cvv}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="cardholderName">카드 소유자명</Label>
              <Input
                id="cardholderName"
                placeholder="홍길동"
                value={formData.cardholderName}
                onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
                className={errors.cardholderName ? 'border-destructive' : ''}
              />
              {errors.cardholderName && (
                <p className="text-sm text-destructive mt-1">{errors.cardholderName}</p>
              )}
            </div>
          </div>

          {/* 청구지 정보 */}
          <div className="space-y-4">
            <h4 className="font-medium">청구지 주소</h4>
            
            <div>
              <Label htmlFor="billingAddress">주소</Label>
              <Input
                id="billingAddress"
                placeholder="서울시 강남구 테헤란로 123"
                value={formData.billingAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, billingAddress: e.target.value }))}
                className={errors.billingAddress ? 'border-destructive' : ''}
              />
              {errors.billingAddress && (
                <p className="text-sm text-destructive mt-1">{errors.billingAddress}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">도시</Label>
                <Input
                  id="city"
                  placeholder="서울"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className={errors.city ? 'border-destructive' : ''}
                />
                {errors.city && (
                  <p className="text-sm text-destructive mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <Label htmlFor="zipCode">우편번호</Label>
                <Input
                  id="zipCode"
                  placeholder="12345"
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    zipCode: e.target.value.replace(/\D/g, '').slice(0, 5) 
                  }))}
                  className={errors.zipCode ? 'border-destructive' : ''}
                />
                {errors.zipCode && (
                  <p className="text-sm text-destructive mt-1">{errors.zipCode}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="country">국가</Label>
              <Select 
                value={formData.country} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KR">대한민국</SelectItem>
                  <SelectItem value="US">미국</SelectItem>
                  <SelectItem value="JP">일본</SelectItem>
                  <SelectItem value="CN">중국</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              {isSubmitting ? '처리 중...' : '카드 추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}