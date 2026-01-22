import type { GameMeta } from '@guess-logo/game-core';
import type { SupportedLanguage } from '@guess-logo/shared/types';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

interface GameCardProps {
  game: GameMeta;
  currentLanguage: SupportedLanguage;
  onPlay?: (gameId: string) => void;
}

export function GameCard({ game, currentLanguage, onPlay }: GameCardProps) {
  const localizedName = game.name[currentLanguage] || game.name.en;
  const { t } = useTranslation();
  const handleClick = () => {
    onPlay?.(game.id);
  };

  return (
    <Link to={game.id}>
      <Card className="w-full aspect-9/10 p-0 border border-borders overflow-hidden rounded-4xl cursor-pointer group">
        <div className="relative h-full w-full">
          {game.imageUrl && (
            <img
              src={game.imageUrl}
              alt={localizedName}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/30" />
          <CardContent className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-4">
            <h2 className="text-3xl font-bold text-white leading-tight">
              {localizedName}
            </h2>
            <Button
              onClick={handleClick}
              className="flex items-center justify-center gap-2 bg-white text-black font-semibold px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors w-full"
            >
              {t('home.playNow')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

export function SkeletonGameCard() {
  return (
    <Card className="border-0 aspect-9/10 p-0">
      <CardHeader>
        <Skeleton className="h-4 w-4/5" />
      </CardHeader>
      <CardContent className="mt-4">
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <Skeleton className="h-7 w-full mt-10 rounded-full" />
      </CardContent>
    </Card>
  );
}
