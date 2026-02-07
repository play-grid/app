import type { SupportedLanguage } from '@guess-logo/shared/types';
import type { LogoSetKey } from '../lib/logo-data';
import { useQueryClient } from '@tanstack/react-query';
import { Play, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import BackButton from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGameNavigation } from '@/hooks/use-game-navigation';
import { useAnalytics } from '@/hooks/use-analytics';
import { logger } from '@/utils/logger';
import { GameSetup } from '../components/game-setup';
import { logoItemsQueryOptions } from '../hooks/use-logo-items';
import { logoListsQueryOptions } from '../hooks/use-logo-lists-query';
import { getGridConfiguration } from '../lib/grid-configurations';
import { useGameStore } from '../stores/game-state-store';
import { usePersistenceStore } from '../stores/legacy-persistence-store';
import { useUIStore } from '../stores/ui-state-store';
import { parseSportsListId } from '../types/sports-list-types';

function isValidListId(listId: string, logoSet: LogoSetKey, availableLists: any[]): boolean {
  if (!listId || !availableLists || availableLists.length === 0) {
    return false;
  }

  // For sports, validate the format using parseSportsListId helper
  if (logoSet === 'sports') {
    const parsed = parseSportsListId(listId);
    if (!parsed.success) {
      return false;
    }
  }

  // Check if list ID exists in available lists
  return availableLists.some((list: any) => list.id === listId);
}

export default function GameSetupPage() {
  const { navigate } = useGameNavigation('guess-logo');
  const { i18n, t } = useTranslation();
  const queryClient = useQueryClient();
  const { trackGameStart } = useAnalytics();
  const [isStarting, setIsStarting] = useState(false);

  // Zustand stores
  const {
    selectedSet,
    selectedGrid,
    selectedList,
    playerA,
    playerB,
    isUpdatingList,
    setSelectedSet,
    setSelectedGrid,
    setPlayerAName,
    setPlayerBName,
    resetGame,
  } = useGameStore();

  const {
    savedGameInfo,
    loadGameState,
    clearGameState,
    hasValidSavedGame,
    setSavedGameInfo,
  } = usePersistenceStore();
  const {
    showResumeOption,
    resumeCheckComplete,
    setShowResumeOption,
    setResumeCheckComplete,
  } = useUIStore();

  // Check for saved game on mount - only once
  useEffect(() => {
    if (resumeCheckComplete)
      return;

    try {
      if (hasValidSavedGame()) {
        const savedState = loadGameState();
        if (savedState) {
          setShowResumeOption(true);
          setSavedGameInfo({
            playerA: savedState.playerA.name,
            playerB: savedState.playerB.name,
            selectedSet: savedState.selectedSet,
            selectedGrid: savedState.selectedGrid,
            selectedList: savedState.selectedList,
          });
        }
      }
    }
    catch (error) {
    }

    setResumeCheckComplete(true);
  }, [
    hasValidSavedGame,
    loadGameState,
    resumeCheckComplete,
    setShowResumeOption,
    setSavedGameInfo,
    setResumeCheckComplete,
  ]);

  // Get logos for validation
  const canStart = true;

  const handleStartGame = async () => {
    try {
      setIsStarting(true);
      logger.debug('Starting game with:', {
        selectedSet,
        selectedList,
        selectedGrid,
        playerA: playerA.name,
        playerB: playerB.name,
      });

      const encodedPlayerA = encodeURIComponent(playerA.name.trim() || 'Player A');
      const encodedPlayerB = encodeURIComponent(playerB.name.trim() || 'Player B');
      const language = i18n.language as SupportedLanguage;
      const gridConfig = getGridConfiguration(selectedGrid);

      logger.debug('Clearing game state and resetting...');
      clearGameState();
      resetGame();

      logger.debug('Fetching logo lists...');
      await queryClient.ensureQueryData(logoListsQueryOptions(selectedSet, true));

      // Get available lists and validate current list ID
      const logoListsData = queryClient.getQueryData(['logo-lists', selectedSet]) as any[];
      let listToUse = selectedList;

      if (!logoListsData || !Array.isArray(logoListsData) || logoListsData.length === 0) {
        throw new Error(`No lists available for ${selectedSet}`);
      }

      // Validate if current list ID is valid for selected set
      if (!isValidListId(selectedList, selectedSet, logoListsData)) {
        logger.debug(`Current list ID "${selectedList}" is invalid for ${selectedSet}, using first available list`);
        listToUse = logoListsData[0].id;
      }

      logger.debug('Fetching logo items...', {
        selectedSet,
        listToUse,
        language,
        totalLogos: gridConfig.totalLogos,
      });
      await queryClient.ensureQueryData(
        logoItemsQueryOptions(selectedSet, listToUse, language, gridConfig.totalLogos, false, true),
      );

      // Track game start
      trackGameStart({
        game_id: 'guess-logo',
        game_mode: 'local',
        player_count: 2,
        selected_set: selectedSet,
        selected_grid: selectedGrid,
        grid_total_logos: gridConfig.totalLogos,
        room_id: undefined,
      });

      const navigationPath = `/${selectedSet}/${listToUse}/${selectedGrid}/${encodedPlayerA}/${encodedPlayerB}`;
      logger.debug('Navigating to:', navigationPath);

      navigate(navigationPath);
    }
    catch (error) {
      logger.error(error, 'Failed to start game:');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(t('failed-to-start-game'), { description: errorMessage });
    }
    finally {
      setIsStarting(false);
    }
  };

  const handleResumeGame = () => {
    if (savedGameInfo) {
      const encodedPlayerA = encodeURIComponent(savedGameInfo.playerA);
      const encodedPlayerB = encodeURIComponent(savedGameInfo.playerB);

      trackGameStart({
        game_id: 'guess-logo',
        game_mode: 'local',
        player_count: 2,
        resumed: true,
        room_id: undefined,
      });

      navigate(
        `/${savedGameInfo.selectedSet}/${savedGameInfo.selectedList}/${savedGameInfo.selectedGrid}/${encodedPlayerA}/${encodedPlayerB}`,
      );
    }
  };

  const handleClearSavedGame = () => {
    clearGameState();
    setShowResumeOption(false);
    setSavedGameInfo(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <BackButton />
        {/* Resume Game Option */}
        {showResumeOption && savedGameInfo && (
          <Card className="p-6 border-2 border-primary/20 bg-primary/5">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-primary">{t('resume-previous-game')}</h2>
              <p className="text-muted-foreground">
                {t('continue-your-game-with')}
                {' '}
                <strong>{savedGameInfo.playerA}</strong>
                {' '}
                {t('vs')}
                {' '}
                <strong>{savedGameInfo.playerB}</strong>
                <br />
                <span className="text-sm">
                  {' '}
                  {savedGameInfo.selectedSet}
                  {t('key-1')}
                  {savedGameInfo.selectedGrid}
                  {t('key-2')}
                  {savedGameInfo.selectedList}

                </span>
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={handleResumeGame} className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  {t('resume-game')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearSavedGame}
                  className="flex items-center gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('clear-saved-game')}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Regular Game Setup */}
        <GameSetup
          selectedSet={selectedSet}
          onSetChange={setSelectedSet}
          selectedGrid={selectedGrid}
          onGridChange={setSelectedGrid}
          playerA={playerA}
          playerB={playerB}
          onPlayerANameChange={setPlayerAName}
          onPlayerBNameChange={setPlayerBName}
          canStart={canStart}
          isUpdating={isUpdatingList || isStarting}
          onStartGame={handleStartGame}
        />
      </div>
    </div>
  );
}
