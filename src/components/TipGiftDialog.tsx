import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Gift, 
  Star, 
  Crown, 
  Diamond, 
  Sparkles,
  DollarSign,
  Zap
} from 'lucide-react';

interface TipGiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
  onSend: (type: 'tip' | 'gift', amount: number, message?: string, giftType?: string) => void;
}

const virtualGifts = [
  { id: 'rose', name: '장미', icon: '🌹', price: 1, color: '#ff69b4' },
  { id: 'heart', name: '하트', icon: '❤️', price: 2, color: '#ff4757' },
  { id: 'kiss', name: '키스', icon: '💋', price: 3, color: '#ff6b9d' },
  { id: 'diamond', name: '다이아몬드', icon: '💎', price: 5, color: '#74b9ff' },
  { id: 'crown', name: '왕관', icon: '👑', price: 10, color: '#fdcb6e' },
  { id: 'star', name: '별', icon: '⭐', price: 8, color: '#ffeaa7' },
  { id: 'fire', name: '불꽃', icon: '🔥', price: 15, color: '#fd79a8' },
  { id: 'rocket', name: '로켓', icon: '🚀', price: 20, color: '#6c5ce7' },
];

const quickTipAmounts = [1, 5, 10, 20, 50, 100];

export function TipGiftDialog({ isOpen, onClose, creatorName, onSend }: TipGiftDialogProps) {
  const [customTipAmount, setCustomTipAmount] = useState('');
  const [tipMessage, setTipMessage] = useState('');
  const [selectedGift, setSelectedGift] = useState<typeof virtualGifts[0] | null>(null);
  const [giftQuantity, setGiftQuantity] = useState(1);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleTip = (amount: number) => {
    setShowAnimation(true);
    onSend('tip', amount, tipMessage);
    setTimeout(() => {
      setShowAnimation(false);
      onClose();
      setTipMessage('');
      setCustomTipAmount('');
    }, 2000);
  };

  const handleGift = () => {
    if (!selectedGift) return;
    
    setShowAnimation(true);
    onSend('gift', selectedGift.price * giftQuantity, `${selectedGift.name} x${giftQuantity}`, selectedGift.id);
    setTimeout(() => {
      setShowAnimation(false);
      onClose();
      setSelectedGift(null);
      setGiftQuantity(1);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            {creatorName}에게 팁/선물하기
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence>
          {showAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50 rounded-lg"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="text-6xl"
              >
                💝
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute bottom-20 text-primary font-semibold"
              >
                전송 완료!
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs defaultValue="tip" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tip">팁하기</TabsTrigger>
            <TabsTrigger value="gift">선물하기</TabsTrigger>
          </TabsList>

          <TabsContent value="tip" className="space-y-4">
            {/* Quick Tip Amounts */}
            <div>
              <Label className="text-sm">빠른 팁</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {quickTipAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    className="h-12 bg-secondary/50 hover:bg-primary hover:text-primary-foreground border-border"
                    onClick={() => handleTip(amount)}
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    {amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <Label htmlFor="custom-tip">커스텀 금액</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-tip"
                  type="number"
                  placeholder="금액 입력"
                  value={customTipAmount}
                  onChange={(e) => setCustomTipAmount(e.target.value)}
                  className="bg-input border-border"
                />
                <Button
                  onClick={() => handleTip(parseFloat(customTipAmount) || 0)}
                  disabled={!customTipAmount || parseFloat(customTipAmount) <= 0}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Zap className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tip Message */}
            <div className="space-y-2">
              <Label htmlFor="tip-message">메시지 (선택사항)</Label>
              <Input
                id="tip-message"
                placeholder="응원 메시지를 남겨보세요!"
                value={tipMessage}
                onChange={(e) => setTipMessage(e.target.value)}
                className="bg-input border-border"
              />
            </div>
          </TabsContent>

          <TabsContent value="gift" className="space-y-4">
            {/* Virtual Gifts */}
            <div>
              <Label className="text-sm">가상 선물</Label>
              <div className="grid grid-cols-4 gap-3 mt-2">
                {virtualGifts.map((gift) => (
                  <motion.div
                    key={gift.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all
                      ${selectedGift?.id === gift.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border bg-secondary/30 hover:bg-secondary/50'
                      }
                    `}
                    onClick={() => setSelectedGift(gift)}
                  >
                    <span className="text-2xl mb-1">{gift.icon}</span>
                    <span className="text-xs text-center">{gift.name}</span>
                    <Badge 
                      variant="secondary" 
                      className="text-xs mt-1"
                      style={{ backgroundColor: gift.color + '20', color: gift.color }}
                    >
                      ${gift.price}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>

            {selectedGift && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 p-3 bg-secondary/20 rounded-lg border border-border"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedGift.icon}</span>
                  <span className="font-medium">{selectedGift.name}</span>
                  <Badge style={{ backgroundColor: selectedGift.color + '20', color: selectedGift.color }}>
                    ${selectedGift.price}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm">수량:</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGiftQuantity(Math.max(1, giftQuantity - 1))}
                      disabled={giftQuantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{giftQuantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGiftQuantity(giftQuantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <div className="ml-auto">
                    <Badge className="bg-primary text-primary-foreground">
                      총 ${selectedGift.price * giftQuantity}
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={handleGift}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  선물 보내기
                </Button>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}