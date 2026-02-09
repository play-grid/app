import type { GameMeta } from '@guess-logo/game-core';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useAnalytics } from '@/hooks/use-analytics';
import { useGameNavigation } from '@/hooks/use-game-navigation';
import { getLocalizedName } from '@/utils/language-utils';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

interface GameCardProps {
  game: GameMeta;
  onPlay?: (gameId: string) => void;
}

export function GameCard({ game, onPlay }: GameCardProps) {
  const { currentLanguage } = useGameNavigation();
  const { trackGameSelected } = useAnalytics();
  const name = getLocalizedName(game.name, currentLanguage);

  const { t } = useTranslation();

  const handleCardClick = () => {
    trackGameSelected({
      game_id: game.id,
      game_version: game.version,
      min_players: game.minPlayers,
      max_players: game.maxPlayers,
      language: currentLanguage,
    });
  };

  const handlePlayClick = () => {
    trackGameSelected({
      game_id: game.id,
      game_version: game.version,
      language: currentLanguage,
      action: 'play_button_clicked',
    });
    onPlay?.(game.id);
  };

  return (
    <Link to={game.id} onClick={handleCardClick}>
      <Card className="w-full aspect-9/10 p-0 border border-borders overflow-hidden rounded-4xl cursor-pointer group game-card-animate" data-analytics={`game-card-${game.id}`}>
        <div className="relative h-full w-full">
          {game.imageUrl && (
            <img
              src={game.imageUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:bg-black/50" />
          <CardContent className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-4 transform transition-transform duration-300 group-hover:-translate-y-1">
            <h2 className="text-3xl font-bold text-white leading-tight transition-transform duration-300 group-hover:scale-105">
              {name}
            </h2>
            <Button
              onClick={handlePlayClick}
              className="flex items-center justify-center gap-2 bg-white text-black font-semibold px-6 py-2 rounded-lg hover:bg-gray-200 hover:shadow-lg hover:shadow-black/30 transition-all duration-300 w-full group-hover:scale-105"
              data-analytics={`play-button-${game.id}`}
            >
              {t('home.playNow')}
              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

export function SkeletonGameCard() {
  return (
    <Card className="border-0 aspect-9/10 p-0 rounded-4xl justify-end ">
      <CardContent className="flex flex-col items-start mb-10">
        <Skeleton className="h-6 w-1/2 mb-1 rounded-full" />
        <Skeleton className="h-7 w-full mt-5 rounded-full" />
      </CardContent>
    </Card>
  );
}
