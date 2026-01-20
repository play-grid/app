import type { ListMetadata, LogoSetKey } from '@guess-logo/guess-logo';
import type { GridConfiguration } from '../lib/grid-configurations';
import type { Player } from '../stores/game-state-store';
import { GridIcon, RefreshIcon, RestartIcon, TrophyIcon } from '@guess-logo/ui/icons';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SportsListSelector } from './sports-list-selector';

interface GameHeaderProps {
  selectedSet: LogoSetKey;
  currentPlayer: 'A' | 'B';
  playerA: Player;
  playerB: Player;
  gridConfig: GridConfiguration;
  availableLists: ListMetadata[];
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
  // onStartNewGame,
  onListChange,
  onShuffle,
}: GameHeaderProps) {
  const { t, i18n } = useTranslation();

  const winner = playerA.winner || playerB.winner;
  const winningPlayer = playerA.winner ? playerA : playerB.winner ? playerB : null;

  return (
    <div className="mb-4 md:mb-6 space-y-3 md:space-y-4">
      {/* Winner Banner - Only shows when there's a winner */}
      {winner && winningPlayer && (
        <div className="bg-linear-to-r from-green-500/20 via-green-400/20 to-green-500/20 border-2 border-green-500/50 rounded-lg p-3 md:p-4 animate-pulse">
          <div className="flex items-center justify-center gap-2 md:gap-3">
            <span className="text-base md:text-lg font-bold text-green-700 dark:text-green-400 text-center">
              🎉
              {' '}
              {winningPlayer.name}
              {' '}
              {t('found')}
              {' '}
              {winner.name}
              !
            </span>
            <TrophyIcon className="w-5 h-5 md:w-6 md:h-6 text-green-600 shrink-0" />
          </div>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-3 md:p-4">
        {/* Top Section: Players & Progress */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3 md:mb-4 pb-3 md:pb-4 border-b border-border">
          {/* Players Row - Stacks on mobile, side-by-side on tablet+ */}
          <div className="flex items-center justify-between sm:justify-start sm:flex-1 gap-3">
            {/* Player A */}
            <div className="flex items-center gap-2 md:gap-3 flex-1 sm:flex-initial">
              <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shrink-0 ${currentPlayer === 'A' ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
              <div className="min-w-0">
                <p className="font-semibold text-xs md:text-sm truncate">{playerA.name}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
                  {playerA.activeCount}
                  /
                  {gridConfig.totalLogos}
                  {' '}
                  {t('remaining')}
                </p>
              </div>
            </div>

            {/* Center: Turn Indicator - Shows on mobile between players */}
            <Badge
              variant={currentPlayer === 'A' ? 'default' : 'secondary'}
              className="px-2 md:px-4 py-1 md:py-1.5 text-[10px] md:text-sm font-semibold whitespace-nowrap flex-shrink-0 sm:hidden"
            >
              {currentPlayer === 'A' ? playerA.name : playerB.name}
            </Badge>

            {/* Player B */}
            <div className="flex items-center gap-2 md:gap-3 flex-1 sm:flex-initial">
              <div className="min-w-0 sm:order-2">
                <p className="font-semibold text-xs md:text-sm text-left sm:text-right truncate">{playerB.name}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground text-left sm:text-right whitespace-nowrap">
                  {playerB.activeCount}
                  /
                  {gridConfig.totalLogos}
                  {' '}
                  {t('remaining')}
                </p>
              </div>
              <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shrink-0 sm:order-1 ${currentPlayer === 'B' ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
            </div>
          </div>

          {/* Center: Turn Indicator - Hidden on mobile, shows on tablet+ */}
          <Badge
            variant={currentPlayer === 'A' ? 'default' : 'secondary'}
            className="hidden sm:flex px-4 py-1.5 text-sm font-semibold whitespace-nowrap"
          >
            {i18n.language === 'ar'
              ? `${t('current-turn-player')} ${currentPlayer === 'A' ? playerA.name : playerB.name}`
              : t('current-turn-player', { name: currentPlayer === 'A' ? playerA.name : playerB.name })}
          </Badge>
        </div>

        {/* Bottom Section: Game Info & Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          {/* Left: Game Info */}
          <div className="flex items-center gap-2 md:gap-3">
            <Badge variant="secondary" className="capitalize font-medium text-xs md:text-sm">
              {t(selectedSet)}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5 text-xs md:text-sm">
              <GridIcon className="w-3 h-3" />
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
          <div className="w-full md:flex-1 md:flex md:justify-center">
            {selectedSet === 'sports'
              ? (
                  <div className="w-full md:w-auto">
                    <SportsListSelector
                      regions={availableLists}
                      selectedListId={selectedList}
                      onListChange={onListChange}
                    />
                  </div>
                )
              : (
                  <Select value={selectedList} onValueChange={onListChange}>
                    <SelectTrigger className="w-full md:w-[240px]">
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
                )}
          </div>

          {/* Right: Action Buttons with tooltips */}
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSwitchTurn}
                className="text-xs md:text-sm"
              >
                {t('switch-turn')}
              </Button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShuffle}
                  >
                    <RefreshIcon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('shuffle')}</p>
                </TooltipContent>
              </Tooltip>

              {/* TODO:comment until fix */}
              {/* {onStartNewGame && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onStartNewGame}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('start-new-game')}</p>
                  </TooltipContent>
                </Tooltip>
              )} */}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onResetGame}
                  >
                    <RestartIcon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('games.guessLogo.reset-game')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
