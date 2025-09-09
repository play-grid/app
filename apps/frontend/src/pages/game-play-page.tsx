import type { LogoSetKey } from '@/lib/logo-data';
import type { LogoItem } from '@/types';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { GameHeader } from '@/components/game-header';
import { GameInstructions } from '@/components/game-instructions';
import { PlayerGrid } from '@/components/player-grid';
import { Button } from '@/components/ui/button';
import { useLanguageNavigation } from '@/hooks/use-language-navigation';
import { useLogoQuery } from '@/hooks/use-logo-query';
import { getGridConfiguration } from '@/lib/grid-configurations';
import { logoSets } from '@/lib/logo-data';
import { useGameStore } from '@/stores/game-state-store';
import { usePersistenceStore } from '@/stores/persistence-store';
import { useUIStore } from '@/stores/ui-state-store';
import { devLog } from '@/utils/logger';

export function GamePlayPage() {
  const { navigate } = useLanguageNavigation();
  const { t } = useTranslation();

  const params = useParams<{
    logoSet: string;
    gridSize: string;
    playerA: string;
    playerB: string;
  }>();

  // Zustand stores
  const {
    playerA,
    playerB,
    currentPlayer,
    gameInitialized,
    gameStarted,
    setSelectedSet,
    setSelectedGrid,
    setPlayerAName,
    setPlayerBName,
    initializeGame,
    resetGame,
    startNewGame,
    togglePlayerALogo,
    togglePlayerBLogo,
    switchTurn,
  } = useGameStore();

  const {
    saveGameState,
    loadGameState,
    clearGameState,
    lastSaveHash,
    updateLastSaveHash,
  } = usePersistenceStore();

  const {
    loadAttempted,
    setLoadAttempted,
    setError,
    error,
  } = useUIStore();

  // Use refs to prevent infinite saving
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Extract params with defaults and decode player names
  const logoSet = (params.logoSet as LogoSetKey) || 'companies';
  const gridSize = params.gridSize || '8x6';
  const playerAName = decodeURIComponent(params.playerA || 'Player A');
  const playerBName = decodeURIComponent(params.playerB || 'Player B');

  // Get configuration
  const gridConfig = getGridConfiguration(gridSize);
  const logoNames = logoSets[logoSet]?.slice(0, gridConfig.totalLogos) || [];

  // Fetch logos
  const { data: fetchedLogos, isLoading, error: fetchError } = useLogoQuery(logoNames, logoSet, true);

  // Set URL params in store on mount
  useEffect(() => {
    setSelectedSet(logoSet);
    setSelectedGrid(gridSize);
    setPlayerAName(playerAName);
    setPlayerBName(playerBName);
  }, [logoSet, gridSize, playerAName, playerBName, setSelectedSet, setSelectedGrid, setPlayerAName, setPlayerBName]);

  // Load saved game state ONCE on mount
  useEffect(() => {
    if (loadAttempted)
      return;

    const savedState = loadGameState();
    if (
      savedState
      && savedState.selectedSet === logoSet
      && savedState.selectedGrid === gridSize
      && savedState.playerA.name === playerAName
      && savedState.playerB.name === playerBName
    ) {
      // Restore saved state to Zustand store
      // This will automatically update the UI through the store
      devLog('Restoring saved game state');
      // Note: We would need additional actions in the store to restore full state
      // For now, we'll let the game initialize normally
    }
    setLoadAttempted(true);
  }, [logoSet, gridSize, playerAName, playerBName, loadGameState, loadAttempted, setLoadAttempted]);

  // Initialize game when logos are loaded (only if not loaded from save)
  useEffect(() => {
    if (fetchedLogos && !gameInitialized && loadAttempted && playerA.logos.length === 0) {
      // Convert fetched logos to LogoItem format
      const initialLogos: LogoItem[] = fetchedLogos.map((fetchedLogo, index) => ({
        id: index + 1,
        name: fetchedLogo.name || 'Unknown Logo',
        imageUrl: fetchedLogo.imageUrl,
        eliminated: false,
      }));

      initializeGame(initialLogos);
    }
  }, [fetchedLogos, gameInitialized, loadAttempted, playerA.logos.length, initializeGame]);

  // Save game state with proper debouncing
  useEffect(() => {
    if (!gameInitialized || !gameStarted || !loadAttempted || playerA.logos.length === 0) {
      return;
    }

    const gameState = {
      playerA,
      playerB,
      currentPlayer,
      selectedSet: logoSet,
      selectedGrid: gridSize,
      gameStarted,
      gameInitialized,
    };

    // Create a hash of the current state to compare
    const currentStateHash = JSON.stringify({
      playerAEliminated: playerA.logos.map(l => ({ id: l.id, eliminated: l.eliminated })),
      playerBEliminated: playerB.logos.map(l => ({ id: l.id, eliminated: l.eliminated })),
      currentPlayer,
      gameStarted,
      gameInitialized,
    });

    // Only save if state has actually changed
    if (currentStateHash !== lastSaveHash) {
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce the save operation
      saveTimeoutRef.current = setTimeout(() => {
        saveGameState(gameState);
        updateLastSaveHash(currentStateHash);
      }, 1000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    playerA,
    playerB,
    currentPlayer,
    logoSet,
    gridSize,
    gameStarted,
    gameInitialized,
    loadAttempted,
    saveGameState,
    lastSaveHash,
    updateLastSaveHash,
  ]);

  // Set error if fetch fails
  useEffect(() => {
    if (fetchError) {
      setError(fetchError.message || 'Failed to load logos');
    }
  }, [fetchError, setError]);

  // Early returns after all hooks - redirect if invalid route
  if (!logoSets[logoSet]) {
    navigate('/', { replace: true });
    return null;
  }

  const handleResetGame = () => {
    clearGameState();
    resetGame();
    navigate('/');
  };

  const handleStartNewGame = () => {
    clearGameState();
    navigate(`/game/${logoSet}/${gridSize}/${encodeURIComponent(playerAName)}/${encodeURIComponent(playerBName)}`, { replace: true });
    startNewGame();
  };

  // Show loading state
  if (isLoading || !gameInitialized || !loadAttempted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">
            {t('loading-game-for')}
            {playerA.name}
            vs
            {playerB.name}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500 mb-4">{error}</p>
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
        selectedSet={logoSet}
        currentPlayer={currentPlayer}
        playerA={playerA}
        playerB={playerB}
        gridConfig={gridConfig}
        onSwitchTurn={switchTurn}
        onResetGame={handleResetGame}
        onStartNewGame={handleStartNewGame}
      />

      <div className="grid lg:grid-cols-[1fr_2px_1fr] gap-16 relative">
        <PlayerGrid player={playerA} onToggleLogo={togglePlayerALogo} gridConfig={gridConfig} />
        <div className="bg-gray-300 border-1" />
        <PlayerGrid player={playerB} onToggleLogo={togglePlayerBLogo} gridConfig={gridConfig} />
      </div>

      <GameInstructions />
    </div>
  );
}
