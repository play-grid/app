import type { LogoList, LogoSetKey, Player } from '@guess-logo/shared/types';
import type { GridConfiguration } from '@/lib/grid-configurations';
import { Grid3X3, Plus, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GameHeaderProps {
  selectedSet: LogoSetKey;
  currentPlayer: 'A' | 'B';
  playerA: Player;
  playerB: Player;
  gridConfig: GridConfiguration;
  availableLists: LogoList[];
  onSwitchTurn: () => void;
  onResetGame: () => void;
  onStartNewGame?: () => void;
  onListChange: (value: string) => void;
  selectedList: string;
}

export function GameHeader({
  selectedSet,
  currentPlayer,
  playerA,
  playerB,
  gridConfig,
  availableLists,
  selectedList,
  onSwitchTurn,
  onResetGame,
  onStartNewGame,
  onListChange,
}: GameHeaderProps) {
  const { t } = useTranslation();

  const renderWinnerBadge = (player: Player, key: string) =>
    player.winner && (
      <Badge variant="default" className="bg-green-500 text-white animate-pulse">
        🎉
        {' '}
        {player.name}
        {' '}
        {t('found')}
        {' '}
        {player.winner.name}
        {' '}
        {t(key)}
      </Badge>
    );

  return (
    <div className="mb-6">
      {/* --- Top row: title and actions --- */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{t('logo-guessing-game')}</h1>
          <Badge variant="secondary" className="capitalize">
            {t(selectedSet)}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Grid3X3 className="w-3 h-3" />
            {t(gridConfig.name)}
            {' '}
            -
            {t(gridConfig.difficulty)}
          </Badge>
          {renderWinnerBadge(playerA, 'key')}
          {renderWinnerBadge(playerB, 'key-0')}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onSwitchTurn}>
            {t('switch-turn')}
          </Button>
          {onStartNewGame && (
            <Button variant="outline" onClick={onStartNewGame}>
              <Plus className="w-4 h-4 mr-2" />
              {t('new-game')}
            </Button>
          )}
          <Button variant="outline" onClick={onResetGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('setup')}
          </Button>
        </div>
      </div>

      {/* --- Bottom row: turn indicator, progress, and list select --- */}
      <div className="flex items-center justify-between">
        {/* Current turn */}
        <Badge
          variant={currentPlayer === 'A' ? 'default' : 'secondary'}
          className="text-sm"
        >
          {t('current-turn-player')}
          {' '}
          {currentPlayer}
        </Badge>

        {/* Player progress */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>
            {playerA.name}
            :
            {playerA.activeCount}
            /
            {gridConfig.totalLogos}
            {' '}
            {t('remaining')}
          </span>
          <span>
            {playerB.name}
            :
            {playerB.activeCount}
            /
            {gridConfig.totalLogos}
            {' '}
            {t('remaining')}
          </span>
        </div>

        {/* Game list selector */}
        <Select value={selectedList} onValueChange={onListChange}>
          <SelectTrigger className="w-fit">
            <SelectValue placeholder={t('choose-list')} />
          </SelectTrigger>
          <SelectContent>
            {availableLists.map(list => (
              <SelectItem key={list.id} value={list.id}>
                {t(list.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
