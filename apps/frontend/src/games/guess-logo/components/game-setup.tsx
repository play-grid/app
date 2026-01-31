import type { SupportedLanguage } from '@guess-logo/shared/types';
import type { LogoSetKey } from '../lib/logo-data';
import type { Player } from '../stores/game-state-store';
import {
  BasketballIcon,
  BuildingsIcon,
  ClockIcon,
  FlagIcon,
  GridIcon,
  TrophyIcon,
  UsersIcon,
  VideoIcon,
} from '@guess-logo/ui/icons';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { logger } from '@/utils/logger';
import { gridConfigurations } from '../lib/grid-configurations';
import { fetchLogoLists, fetchLogos } from '../services/unified-logo-service';

interface GameSetupProps {
  selectedSet: LogoSetKey;
  onSetChange: (set: LogoSetKey) => void;
  selectedGrid: string;
  onGridChange: (gridId: string) => void;
  playerA: Player;
  playerB: Player;
  onPlayerANameChange: (name: string) => void;
  onPlayerBNameChange: (name: string) => void;
  onStartGame: () => void;
  canStart: boolean;
  isUpdating: boolean;
}

const logoSets = [
  {
    id: 'companies' as LogoSetKey,
    name: 'companies',
    description: 'famous-brand-logos',
    icon: BuildingsIcon,
    color: 'bg-blue-500',
  },
  {
    id: 'countries' as LogoSetKey,
    name: 'countries',
    description: 'national-flags',
    icon: FlagIcon,
    color: 'bg-green-500',
  },
  {
    id: 'movies' as LogoSetKey,
    name: 'movies',
    description: 'film-and-tv-logos',
    icon: VideoIcon,
    color: 'bg-purple-500',
  },
  {
    id: 'sports' as LogoSetKey,
    name: 'sports',
    description: 'team-and-league-logos',
    icon: BasketballIcon,
    color: 'bg-orange-500',
  },
];

const playerNameSchema = z.string().trim().min(2, { message: 'player-input-min-error' }).max(20, { message: 'player-input-max-error' });

export function GameSetup({
  selectedSet,
  onSetChange,
  selectedGrid,
  onGridChange,
  playerA,
  playerB,
  onPlayerANameChange,
  onPlayerBNameChange,
  onStartGame,
  canStart,
  isUpdating,
}: GameSetupProps) {
  const [attemptedStart, setAttemptedStart] = useState(false);
  const currentGrid = gridConfigurations.find(g => g.id === selectedGrid) || gridConfigurations[2];
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  const playerAValidation = playerNameSchema.safeParse(playerA.name);
  const playerBValidation = playerNameSchema.safeParse(playerB.name);

  const playerAError = !playerAValidation.success ? playerAValidation.error.issues[0].message : '';
  const playerBError = !playerBValidation.success ? playerBValidation.error.issues[0].message : '';

  const canStartGame
    = playerAValidation.success
      && playerBValidation.success
      && canStart;

  function handleStartGame() {
    setAttemptedStart(true);
    if (canStartGame) {
      onStartGame();
    }
  }

  // Fixed prefetch function
  function prefetchLogos(setId: LogoSetKey) {
    const gridToUse = gridConfigurations.find(g => g.id === selectedGrid) || gridConfigurations[2];
    const language = i18n.language as SupportedLanguage;

    // Use queryClient.prefetchQuery instead of ensureQueryData for hover prefetching
    // This won't block and handles errors silently
    queryClient.prefetchQuery({
      queryKey: ['logo-lists', setId],
      queryFn: () => fetchLogoLists(setId),
      staleTime: 60 * 60 * 1000, // 1 hour
    }).then(() => {
      // After lists are fetched, prefetch the first list's logos
      const logoListsData = queryClient.getQueryData(['logo-lists', setId]) as any[];

      if (!logoListsData || !Array.isArray(logoListsData) || logoListsData.length === 0) {
        return;
      }

      // Always use the first available list for prefetching
      const firstListId = logoListsData[0].id;

      // Prefetch the actual logos for the first list
      return queryClient.prefetchQuery({
        queryKey: ['logo-items', setId, firstListId, language, gridToUse.totalLogos],
        queryFn: () => fetchLogos(setId, firstListId, language, gridToUse.totalLogos, false),
        staleTime: 30 * 60 * 1000, // 30 minutes
      });
    }).catch((err) => {
      // Silently handle prefetch errors - they shouldn't break the UI
      logger.debug(`Prefetch failed for set ${setId}:`, err);
    });
  }

  function handleIconsSetChange(setId: LogoSetKey) {
    onSetChange(setId);
  }

  const t = i18n.t;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full p-8 text-center">
        <div className="mb-8">
          <TrophyIcon className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-serif text-center tracking-tighter font-light mb-2">{t('logo-guessing-game')}</h1>
          <p className="text-muted-foreground">
            {t('game-setup-description')}
          </p>
        </div>

        <div className="space-y-8">
          {/* Player Names Section */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <UsersIcon className="w-5 h-5 text-primary" />
              <label className="text-lg font-semibold">{t('player-names')}</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="player-a" className="text-sm font-medium text-blue-600">
                  {t('first-player')}
                </Label>
                <Input
                  id="player-a"
                  type="text"
                  placeholder={t('enter-first-player-name')}
                  value={playerA.name}
                  onChange={e => onPlayerANameChange(e.target.value)}
                  className={`text-center border-blue-200 focus:border-blue-500 ${attemptedStart && playerAError ? 'border-red-500' : ''}`}
                  maxLength={20}
                />
                {attemptedStart && playerAError && (
                  <p className="text-xs text-red-500">{t(playerAError)}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="player-b" className="text-sm font-medium text-green-600">
                  {t('second-player')}
                </Label>
                <Input
                  id="player-b"
                  type="text"
                  placeholder={t('enter-second-player-name')}
                  value={playerB.name}
                  onChange={e => onPlayerBNameChange(e.target.value)}
                  className={`text-center border-green-200 focus:border-green-500 ${attemptedStart && playerBError ? 'border-red-500' : ''}`}
                  maxLength={20}
                />
                {attemptedStart && playerBError && (
                  <p className="text-xs text-red-500">{t(playerBError)}</p>
                )}
              </div>
            </div>
            {attemptedStart && (!playerAValidation.success || !playerBValidation.success) && (
              <p className="text-sm text-muted-foreground mt-2">{t('players-input-error')}</p>
            )}
          </div>

          {/* Logo Set Selection */}
          <div>
            <label className="block text-lg font-semibold mb-4">{t('choose-logo-set')}</label>
            <div className="grid grid-cols-2 gap-4">
              {logoSets.map((set) => {
                const IconComponent = set.icon;
                const isSelected = selectedSet === set.id;
                return (
                  <Card
                    key={set.id}
                    className={`p-6 cursor-pointer transition-all hover:scale-105 border-2 ${
                      isSelected ? 'border-primary bg-primary/5 shadow-lg' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleIconsSetChange(set.id)}
                    onMouseEnter={() => prefetchLogos(set.id)}
                  >
                    <div
                      className={`w-12 h-12 rounded-full ${set.color} flex items-center justify-center mx-auto mb-3`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{t(set.name)}</h3>
                    <p className="text-sm text-muted-foreground">{t(set.description)}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Grid Size Selection */}
          <div>
            <label className="block text-lg font-semibold mb-4">{t('choose-grid-size')}</label>
            <Select value={selectedGrid} onValueChange={onGridChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gridConfigurations.map(config => (
                  <SelectItem key={config.id} value={config.id}>
                    <div className="flex items-center gap-2">
                      <GridIcon className="w-4 h-4" />
                      <span>{t(config.name)}</span>
                      <Badge variant="secondary" className="text-xs">
                        {t(config.difficulty)}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="mt-3 p-4 bg-muted rounded-lg text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-base">{t(currentGrid.name)}</span>
                <Badge variant="outline">{t(currentGrid.difficulty)}</Badge>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <GridIcon className="w-4 h-4" />
                  <span>
                    {currentGrid.totalLogos}
                    {t('logos')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{t(currentGrid.estimatedTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-4 mt-8 w-full">
          <Button
            onClick={handleStartGame}
            className="w-full"
            size="lg"
            disabled={isUpdating}
          >
            {t('start-game')}
          </Button>
        </div>
        {attemptedStart && (!playerAValidation.success || !playerBValidation.success) && (
          <p className="text-sm text-red-500 mt-2">{t('enter-valid-player-names-to-continue')}</p>
        )}
      </Card>
    </div>
  );
}
