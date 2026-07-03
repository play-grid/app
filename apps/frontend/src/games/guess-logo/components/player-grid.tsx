import type { Player } from '../stores/game-state.types';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '../stores/game-state-store';
import { LogoItemComponent } from './logo-item';

interface PlayerGridProps {
  player: Player;
  onToggleLogo: (logoId: string | number) => void;
}

export function PlayerGrid({ player, onToggleLogo }: PlayerGridProps) {
  const gridCols = useGameStore(state => state.gridCols);
  const totalLogos = player.logos.length;
  const gridRows = Math.ceil(totalLogos / gridCols);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{player.name}</h2>
        <Badge variant="outline">
          {player.activeCount}
          /
          {totalLogos}
        </Badge>
      </div>
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
        }}
      >
        {player.logos.map((logo) => {
          return (
            <LogoItemComponent
              key={logo.id}
              logo={logo}
              isWinner={player.winner?.id === logo.id}
              onToggle={() => onToggleLogo(logo.id)}
              isQueryLoading={false}
              hasQueryError={false}
            />
          );
        })}
      </div>
    </div>
  );
}
