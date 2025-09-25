import { useTranslation } from 'react-i18next';
import { GameHeader } from '@/components/game-header';
import { GameInstructions } from '@/components/game-instructions';
import { PlayerGrid } from '@/components/player-grid';
import { Button } from '@/components/ui/button';
import { useGameError } from '@/hooks/game-room/use-game-error';
import { useGameInitializer } from '@/hooks/game-room/use-game-initializer';
import { useGameRoomPersistence } from '@/hooks/game-room/use-game-room-persistence';
import { useGameRouteParams } from '@/hooks/game-room/use-game-route-params';
import { useLanguageNavigation } from '@/hooks/use-language-navigation';
import { getGridConfiguration } from '@/lib/grid-configurations';
import { useGameStore } from '@/stores/game-state-store';

export function GamePlayPage() {
  const { navigate } = useLanguageNavigation();
  const { t } = useTranslation();

  // Extract and sync URL parameters
  const routeParams = useGameRouteParams();

  // Handle game persistence
  const { loadAttempted, clearGameState } = useGameRoomPersistence({
    logoSet: routeParams.logoSet,
    gridSize: routeParams.gridSize,
    playerAName: routeParams.playerAName,
    playerBName: routeParams.playerBName,
  });

  // Initialize game data
  const gameInitializer = useGameInitializer({
    logoSet: routeParams.logoSet,
    gridSize: routeParams.gridSize,
    loadAttempted,
  });

  // Handle errors
  const gameError = useGameError({
    fetchError: gameInitializer.error,
    isValidRoute: routeParams.isValidRoute,
  });

  const {
    playerA,
    playerB,
    currentPlayer,
    resetGame,
    startNewGame,
    togglePlayerALogo,
    togglePlayerBLogo,
    switchTurn,
  } = useGameStore();

  // Early return for invalid routes
  if (!routeParams.isValidRoute) {
    return null;
  }

  // Get grid configuration
  const gridConfig = getGridConfiguration(routeParams.gridSize);

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

  // Show loading state
  if (gameInitializer.isLoading || !gameInitializer.isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">
            {t('loading-game-for')}
            {' '}
            {playerA.name}
            {' '}
            vs
            {' '}
            {playerB.name}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (gameError.hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500 mb-4">{gameError.error}</p>
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
        onSwitchTurn={switchTurn}
        onResetGame={handleResetGame}
        onStartNewGame={handleStartNewGame}
      />

      <div className="grid lg:grid-cols-[1fr_2px_1fr] gap-16 relative">
        <PlayerGrid
          player={playerA}
          onToggleLogo={togglePlayerALogo}
          gridConfig={gridConfig}
        />
        <div className="bg-gray-300 border-1" />
        <PlayerGrid
          player={playerB}
          onToggleLogo={togglePlayerBLogo}
          gridConfig={gridConfig}
        />
      </div>

      <GameInstructions />
    </div>
  );
}
