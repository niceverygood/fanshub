import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '../types/subscription';
import { ArrowLeft, Save, Crown } from 'lucide-react';

interface SubscriptionSettingsProps {
  onBack: () => void;
}

export function SubscriptionSettings({ onBack }: SubscriptionSettingsProps) {
  const [tiers, setTiers] = useState<SubscriptionTier[]>(SUBSCRIPTION_TIERS);
  const [enabledTiers, setEnabledTiers] = useState<Set<string>>(new Set(['basic', 'silver', 'gold', 'platinum']));

  const handleTierUpdate = (tierId: string, field: keyof SubscriptionTier, value: string | number) => {
    setTiers(prev => prev.map(tier => 
      tier.id === tierId ? { ...tier, [field]: value } : tier
    ));
  };

  const handleTierToggle = (tierId: string) => {
    setEnabledTiers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tierId)) {
        newSet.delete(tierId);
      } else {
        newSet.add(tierId);
      }
      return newSet;
    });
  };

  const handleBenefitUpdate = (tierId: string, benefitIndex: number, value: string) => {
    setTiers(prev => prev.map(tier => {
      if (tier.id === tierId) {
        const newBenefits = [...tier.benefits];
        newBenefits[benefitIndex] = value;
        return { ...tier, benefits: newBenefits };
      }
      return tier;
    }));
  };

  const addBenefit = (tierId: string) => {
    setTiers(prev => prev.map(tier => {
      if (tier.id === tierId) {
        return { ...tier, benefits: [...tier.benefits, '새로운 혜택'] };
      }
      return tier;
    }));
  };

  const removeBenefit = (tierId: string, benefitIndex: number) => {
    setTiers(prev => prev.map(tier => {
      if (tier.id === tierId) {
        const newBenefits = tier.benefits.filter((_, index) => index !== benefitIndex);
        return { ...tier, benefits: newBenefits };
      }
      return tier;
    }));
  };

  const handleSave = () => {
    console.log('구독 설정 저장:', { tiers, enabledTiers });
    onBack();
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
            <h1 className="font-semibold text-foreground">구독 설정</h1>
          </div>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">구독 등급 관리</h2>
          <p className="text-muted-foreground">각 구독 등급의 가격과 혜택을 설정하세요.</p>
        </div>

        <div className="grid gap-6">
          {tiers.map((tier) => (
            <Card key={tier.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="h-5 w-5" style={{ color: tier.color }} />
                    <CardTitle className="text-foreground">{tier.name}</CardTitle>
                    <Badge style={{ backgroundColor: tier.color, color: 'white' }}>
                      ${tier.price}/월
                    </Badge>
                  </div>
                  <Switch
                    checked={enabledTiers.has(tier.id)}
                    onCheckedChange={() => handleTierToggle(tier.id)}
                  />
                </div>
              </CardHeader>
              
              {enabledTiers.has(tier.id) && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`price-${tier.id}`}>월 가격 ($)</Label>
                      <Input
                        id={`price-${tier.id}`}
                        type="number"
                        step="0.01"
                        value={tier.price}
                        onChange={(e) => handleTierUpdate(tier.id, 'price', parseFloat(e.target.value))}
                        className="bg-input border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`color-${tier.id}`}>테마 색상</Label>
                      <Input
                        id={`color-${tier.id}`}
                        type="color"
                        value={tier.color}
                        onChange={(e) => handleTierUpdate(tier.id, 'color', e.target.value)}
                        className="bg-input border-border h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`description-${tier.id}`}>설명</Label>
                    <Textarea
                      id={`description-${tier.id}`}
                      value={tier.description}
                      onChange={(e) => handleTierUpdate(tier.id, 'description', e.target.value)}
                      className="bg-input border-border"
                      rows={2}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>혜택</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addBenefit(tier.id)}
                      >
                        혜택 추가
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {tier.benefits.map((benefit, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={benefit}
                            onChange={(e) => handleBenefitUpdate(tier.id, index, e.target.value)}
                            className="bg-input border-border"
                            placeholder="혜택 설명"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeBenefit(tier.id, index)}
                            disabled={tier.benefits.length <= 1}
                          >
                            삭제
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <Card className="bg-card border-border mt-6">
          <CardHeader>
            <CardTitle>미리보기</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tiers.filter(tier => enabledTiers.has(tier.id)).map((tier) => (
                <div key={tier.id} className="border border-border rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Crown className="h-5 w-5 mr-1" style={{ color: tier.color }} />
                    <span className="font-semibold">{tier.name}</span>
                  </div>
                  <div className="text-2xl font-bold mb-2" style={{ color: tier.color }}>
                    ${tier.price}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{tier.description}</p>
                  <div className="text-xs space-y-1">
                    {tier.benefits.map((benefit, index) => (
                      <div key={index} className="text-left">• {benefit}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}