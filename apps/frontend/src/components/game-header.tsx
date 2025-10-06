import type { LogoList, LogoSetKey, Player } from '@guess-logo/shared/types';
import type { GridConfiguration } from '@/lib/grid-configurations';
import { Grid3X3, Plus, RotateCcw, Trophy } from 'lucide-react';
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
  availableLists: Pick<LogoList, 'id' | 'name'>[];
  onSwitchTurn: () => void;
  onResetGame: () => void;
  onStartNewGame?: () => void;
  onListChange: (value: string) => void;
  selectedList: string;
  onShuffle?: () => void;
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
  onShuffle,
}: GameHeaderProps) {
  const { t, i18n } = useTranslation();

  const winner = playerA.winner || playerB.winner;
  const winningPlayer = playerA.winner ? playerA : playerB.winner ? playerB : null;

  return (
    <div className="mb-6 space-y-4">
      {/* Winner Banner - Only shows when there's a winner */}
      {winner && winningPlayer && (
        <div className="bg-gradient-to-r from-green-500/20 via-green-400/20 to-green-500/20 border-2 border-green-500/50 rounded-lg p-4 animate-pulse">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="w-6 h-6 text-green-600" />
            <span className="text-lg font-bold text-green-700 dark:text-green-400">
              🎉
              {' '}
              {winningPlayer.name}
              {' '}
              {t('found')}
              {' '}
              {winner.name}
              !
            </span>
            <Trophy className="w-6 h-6 text-green-600" />
          </div>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-4">
        {/* Top Section: Players & Progress */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          {/* Player A */}
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${currentPlayer === 'A' ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
            <div>
              <p className="font-semibold text-sm">{playerA.name}</p>
              <p className="text-xs text-muted-foreground">
                {playerA.activeCount}
                /
                {gridConfig.totalLogos}
                {' '}
                {t('remaining')}
              </p>
            </div>
          </div>

          {/* Center: Turn Indicator */}
          <Badge
            variant={currentPlayer === 'A' ? 'default' : 'secondary'}
            className="px-4 py-1.5 text-sm font-semibold"
          >
            {t('current-turn-player')}
            {' '}
            {currentPlayer}
          </Badge>

          {/* Player B */}
          <div className="flex items-center gap-3">
            <div>
              <p className="font-semibold text-sm text-right">{playerB.name}</p>
              <p className="text-xs text-muted-foreground text-right">
                {playerB.activeCount}
                /
                {gridConfig.totalLogos}
                {' '}
                {t('remaining')}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${currentPlayer === 'B' ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
          </div>
        </div>

        {/* Bottom Section: Game Info & Controls */}
        <div className="flex items-center justify-between">
          {/* Left: Game Info */}
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="capitalize font-medium">
              {t(selectedSet)}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5">
              <Grid3X3 className="w-3 h-3" />
              <span>
                {t(gridConfig.name)}
                {' '}
                ·
                {' '}
                {t(gridConfig.difficulty)}
              </span>
            </Badge>
          </div>

          {/* Center: List Selector */}
          <Select value={selectedList} onValueChange={onListChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('choose-list')} />
            </SelectTrigger>
            <SelectContent>
              {availableLists.map(list => (
                <SelectItem key={list.id} value={list.id}>
                  {list.name[i18n.language as keyof typeof list.name]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onSwitchTurn}>
              {t('switch-turn')}
            </Button>
            <Button variant="ghost" size="sm" onClick={onShuffle}>
              {t('shuffle')}
            </Button>
            {onStartNewGame && (
              <Button variant="outline" size="sm" onClick={onStartNewGame}>
                <Plus className="w-4 h-4" />
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onResetGame}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
