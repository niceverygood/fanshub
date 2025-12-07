import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SubscriptionDialog } from './SubscriptionDialog';

interface CreatorCardProps {
  creator: {
    name: string;
    username: string;
    avatar: string;
    coverImage: string;
    isOnline?: boolean;
    subscriptionPrice?: number;
  };
  onProfileClick?: (creator: any) => void;
}

export function CreatorCard({ creator, onProfileClick }: CreatorCardProps) {
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  const handleSubscribeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (creator.subscriptionPrice) {
      setShowSubscriptionDialog(true);
    }
  };

  const handleCardClick = () => {
    if (onProfileClick) {
      onProfileClick(creator);
    }
  };

  return (
    <>
      <Card className="bg-card border-border overflow-hidden cursor-pointer" onClick={handleCardClick}>
        <div className="relative">
          <ImageWithFallback
            src={creator.coverImage}
            alt={`${creator.name} cover`}
            className="w-full h-24 object-cover"
          />
          <div className="absolute -bottom-6 left-4">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-card">
                <AvatarImage src={creator.avatar} alt={creator.name} />
                <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {creator.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card"></div>
              )}
            </div>
          </div>
        </div>
        <CardContent className="pt-8 pb-4 px-4">
          <div className="mb-3">
            <h3 className="font-medium text-card-foreground">{creator.name}</h3>
            <p className="text-sm text-muted-foreground">@{creator.username}</p>
          </div>
          <Button 
            size="sm" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleSubscribeClick}
          >
            {creator.subscriptionPrice ? `${creator.subscriptionPrice}/월` : '구독하기'}
          </Button>
        </CardContent>
      </Card>

      <SubscriptionDialog
        isOpen={showSubscriptionDialog}
        onClose={() => setShowSubscriptionDialog(false)}
        creator={creator}
        subscriptionPrice={creator.subscriptionPrice || 9.99}
      />
    </>
  );
}