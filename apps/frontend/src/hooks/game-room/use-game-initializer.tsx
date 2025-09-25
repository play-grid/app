import type { LogoSetKey } from '@/lib/logo-data';
import type { LogoItem } from '@/types';
import { useEffect } from 'react';
import { useLogoQuery } from '@/hooks/use-logo-query';
import { getGridConfiguration } from '@/lib/grid-configurations';
import { logoSets } from '@/lib/logo-data';
import { useGameStore } from '@/stores/game-state-store';

export interface GameInitializerConfig {
  logoSet: LogoSetKey;
  gridSize: string;
  loadAttempted: boolean;
}

export interface GameInitializerResult {
  isLoading: boolean;
  error: Error | null;
  isInitialized: boolean;
}

export function useGameInitializer(config: GameInitializerConfig): GameInitializerResult {
  const {
    playerA,
    gameInitialized,
    initializeGame,
  } = useGameStore();

  // Get configuration
  const gridConfig = getGridConfiguration(config.gridSize);
  const logoNames = logoSets[config.logoSet]?.slice(0, gridConfig.totalLogos) || [];

  // Fetch logos
  const { data: fetchedLogos, isLoading, error: fetchError } = useLogoQuery(
    logoNames,
    config.logoSet,
    true,
  );

  // Initialize game when logos are loaded (only if not loaded from save)
  useEffect(() => {
    if (
      fetchedLogos
      && !gameInitialized
      && config.loadAttempted
      && playerA.logos.length === 0
    ) {
      // Convert fetched logos to LogoItem format
      const initialLogos: LogoItem[] = fetchedLogos.map((fetchedLogo, index) => ({
        id: index + 1,
        name: fetchedLogo.name || 'Unknown Logo',
        imageUrl: fetchedLogo.imageUrl,
        eliminated: false,
      }));

      initializeGame(initialLogos);
    }
  }, [
    fetchedLogos,
    gameInitialized,
    config.loadAttempted,
    playerA.logos.length,
    initializeGame,
  ]);

  return {
    isLoading,
    error: fetchError,
    isInitialized: gameInitialized && config.loadAttempted,
  };
}
