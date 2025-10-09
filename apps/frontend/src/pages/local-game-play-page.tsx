import type { SupportedLanguage } from '@guess-logo/shared/types';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GameHeader } from '@/components/game-header';
import { GameInstructions } from '@/components/game-instructions';
import { GridSizeSlider } from '@/components/grid-size-slider';
import { PlayerGrid } from '@/components/player-grid';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useGameError } from '@/hooks/game-room/use-game-error';
import { useGameRoomPersistence } from '@/hooks/game-room/use-game-room-persistence';
import { useGameRouteParams } from '@/hooks/game-room/use-game-route-params';
import { useGameUI } from '@/hooks/game-room/use-game-ui';
import { useLanguageNavigation } from '@/hooks/use-language-navigation';
import { useLogoListChanger } from '@/hooks/use-logo-list-changer';
import { useLogoListsQuery } from '@/hooks/use-logo-lists-query';
import { getGridConfiguration } from '@/lib/grid-configurations';
import { useGameStore } from '@/stores/game-state-store';

export function LocalGamePlayPage() {
  const { navigate } = useLanguageNavigation();
  const { t, i18n } = useTranslation();
  const { changeLogoList } = useLogoListChanger();

  // --- Local Mode Hooks --- //
  const routeParams = useGameRouteParams({ enabled: true });
  const { loadAttempted, clearGameState } = useGameRoomPersistence({
    ...routeParams,
    enabled: true,
  });

  const gameError = useGameError({
    fetchError: null, // TODO: get error from store
    isValidRoute: routeParams.isValidRoute,
  });

  const { data: availableLists } = useLogoListsQuery(routeParams.logoSet, true);

  // --- Store --- //
  const {
    playerA,
    playerB,
    currentPlayer,
    resetGame,
    startNewGame,
    togglePlayerALogo,
    togglePlayerBLogo,
    switchTurn,
    selectedList,
    updateLogosForList,
    isUpdatingLogos,
    shuffleLogos,
  } = useGameStore();

  const gridConfig = getGridConfiguration(routeParams.gridSize);

  useEffect(() => {
    if (loadAttempted) {
      updateLogosForList(
        routeParams.listId,
        routeParams.logoSet,
        i18n.language as any,
        gridConfig.totalLogos,
      );
    }
  }, [
    loadAttempted,
    routeParams.listId,
    routeParams.logoSet,
    i18n.language,
    updateLogosForList,
    gridConfig.totalLogos,
  ]);

  // --- UI Logic --- //
  const { showLoading, loadingMessage, showError, errorMessage } = useGameUI({
    mode: 'local',
    isLocalLoading: isUpdatingLogos, // Use the new loading state
    localError: gameError.hasError ? new Error(gameError.error || '') : null,
  });
  // --- Event Handlers --- //
  const handleResetGame = () => {
    clearGameState();
    resetGame();
    navigate('/');
  };

  const handleStartNewGame = () => {
    clearGameState();
    navigate(
      `/game/${routeParams.logoSet}/${routeParams.gridSize}/${encodeURIComponent(routeParams.playerAName)}/${encodeURIComponent(routeParams.playerBName)}`,
      { replace: true },
    );
    startNewGame();
  };

  if (showLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center">
        <Spinner className="size-12 mb-3" />
        <p className="text-lg font-medium text-gray-800">{loadingMessage}</p>
      </div>
    );
  }

  if (showError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500 mb-4">{errorMessage}</p>
          <Button onClick={handleResetGame} className="px-4 py-2 bg-primary text-white rounded-md">
            {t('back-to-setup')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <GameHeader
        selectedSet={routeParams.logoSet}
        currentPlayer={currentPlayer}
        playerA={playerA}
        playerB={playerB}
        gridConfig={gridConfig}
        availableLists={availableLists || []}
        selectedList={selectedList}
        onListChange={(listId) => {
          changeLogoList(listId);
          navigate(
            `/game/${routeParams.logoSet}/${listId}/${routeParams.gridSize}/${encodeURIComponent(
              routeParams.playerAName,
            )}/${encodeURIComponent(routeParams.playerBName)}`,
            { replace: true },
          );
        }}
        onSwitchTurn={switchTurn}
        onResetGame={handleResetGame}
        onStartNewGame={handleStartNewGame}
        onShuffle={() => { shuffleLogos(i18n.language as SupportedLanguage); }}
      />
      <div className="w-1/4 mx-auto">
        <GridSizeSlider />
      </div>
      <div className="grid lg:grid-cols-[1fr_2px_1fr] gap-16 relative">
        <PlayerGrid player={playerA} onToggleLogo={togglePlayerALogo} />
        <div className="bg-gray-300 border-1" />
        <PlayerGrid player={playerB} onToggleLogo={togglePlayerBLogo} />
      </div>
      {routeParams.logoSet === 'companies' && (
        <div className="text-center mt-4">
          <a
            href="https://logo.dev"
            title="Logo API"
            className="text-sm text-gray-500"
            target="_blank"
            rel="noopener noreferrer"
          >
            Logos provided by Logo.dev
          </a>
        </div>
      )}
      <GameInstructions />
    </div>
  );
}
