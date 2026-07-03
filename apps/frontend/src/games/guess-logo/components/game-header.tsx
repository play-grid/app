import type { GridConfiguration } from '../lib/grid-configurations';
import type { LogoSetKey } from '../lib/logo-data';
import type { Player } from '../stores/game-state.types';
import type { LogoListMetadata } from './sports-list-selector';
import { GridIcon, RefreshIcon, RestartIcon, TrophyIcon } from '@playgrid/ui/icons';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { logoItemsQueryOptions } from '../hooks/use-logo-items';
import { SportsListSelector } from './sports-list-selector';

interface GameHeaderProps {
  selectedSet: LogoSetKey;
  playerA: Player;
  playerB: Player;
  gridConfig: GridConfiguration;
  availableLists: LogoListMetadata[];
  onResetGame: () => void;
  onStartNewGame?: () => void;
  onListChange: (value: string) => void;
  selectedList: string;
  onShuffle?: () => void;
}

export function GameHeader({
  selectedSet,
  playerA,
  playerB,
  gridConfig,
  availableLists,
  selectedList,
  onResetGame,
  onListChange,
  onShuffle,
}: GameHeaderProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const language = i18n.language as 'en' | 'ar';

  const [showShuffleConfirm, setShowShuffleConfirm] = useState(false);
  const [showListConfirm, setShowListConfirm] = useState(false);
  const [pendingListId, setPendingListId] = useState<string | null>(null);

  const winner = playerA.winner || playerB.winner;
  const winningPlayer = playerA.winner ? playerA : playerB.winner ? playerB : null;

  const hasProgress = playerA.logos.length > 0 && (playerA.activeCount < playerA.logos.length || playerB.activeCount < playerB.logos.length);

  function prefetchLogos(listId: string) {
    if (!listId || listId === selectedList)
      return;

    queryClient.prefetchQuery(
      logoItemsQueryOptions(selectedSet, listId, language, gridConfig.totalLogos, false, true),
    ).catch(() => {});
  }

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
        <div className="flex items-center justify-between gap-3 mb-3 md:mb-4 pb-3 md:pb-4 border-b border-border">
          {/* Player A */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <p className="font-semibold text-xs md:text-sm truncate">{playerA.name}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
              {playerA.activeCount}
              /
              {gridConfig.totalLogos}
              {' '}
              {t('remaining')}
            </p>
          </div>

          {/* Player B */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0 text-right">
            <p className="font-semibold text-xs md:text-sm truncate">{playerB.name}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
              {playerB.activeCount}
              /
              {gridConfig.totalLogos}
              {' '}
              {t('remaining')}
            </p>
          </div>
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
                      onListChange={(value) => {
                        if (hasProgress) {
                          setPendingListId(value);
                          setShowListConfirm(true);
                        }
                        else {
                          onListChange(value);
                        }
                      }}
                      onHoverList={prefetchLogos}
                    />
                  </div>
                )
              : (
                  <Select
                    value={selectedList}
                    onValueChange={(value) => {
                      if (hasProgress) {
                        setPendingListId(value);
                        setShowListConfirm(true);
                      }
                      else {
                        onListChange(value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full md:w-[240px]">
                      <SelectValue placeholder={t('choose-list')} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLists.map(list => (
                        <SelectItem
                          key={list.id}
                          value={list.id}
                          onMouseEnter={() => prefetchLogos(list.id)}
                        >
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowShuffleConfirm(true)}
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

      {/* Shuffle Confirmation Dialog */}
      <AlertDialog open={showShuffleConfirm} onOpenChange={setShowShuffleConfirm}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>{t('confirm-shuffle-title', 'Shuffle Logos?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm-shuffle-desc', 'This will randomly replace all logos and reset all progress for both players. This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onShuffle?.();
                setShowShuffleConfirm(false);
              }}
            >
              {t('confirm-shuffle-action', 'Shuffle')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* List Change Confirmation Dialog */}
      <AlertDialog open={showListConfirm} onOpenChange={setShowListConfirm}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>{t('confirm-list-change-title', 'Change Logo List?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm-list-change-desc', 'This will replace all logos and reset all progress for both players. This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingListId) {
                  onListChange(pendingListId);
                }
                setShowListConfirm(false);
                setPendingListId(null);
              }}
            >
              {t('confirm-list-change-action', 'Change')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
