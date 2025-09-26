import type { LogoItem, SupportedLanguage } from '@guess-logo/shared/types';
import type { LogoSetKey } from '@/lib/logo-data';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLogoItems } from '@/hooks/use-logo-items';
import { useLogoQuery } from '@/hooks/use-logo-query';
import { getGridConfiguration } from '@/lib/grid-configurations';
import { useGameStore } from '@/stores/game-state-store';

export interface GameInitializerConfig {
  logoSet: LogoSetKey;
  gridSize: string;
  loadAttempted: boolean;
  enabled: boolean;
}

export interface GameInitializerResult {
  isLoading: boolean;
  error: Error | null;
  isInitialized: boolean;
}

export function useGameInitializer(config: GameInitializerConfig): GameInitializerResult {
  const { i18n } = useTranslation();
  const {
    playerA,
    gameInitialized,
    initializeGame,
    selectedList,
  } = useGameStore();

  // Get configuration
  const gridConfig = getGridConfiguration(config.gridSize);

  // Fetch logo items from the selected list
  const { data: logoItems, isLoading: isLoadingItems, error: itemsError } = useLogoItems(
    config.logoSet,
    selectedList,
    i18n.language as SupportedLanguage,
    config.enabled,
  );

  const logoItemsSliced = logoItems?.slice(0, gridConfig.totalLogos) || [];

  // Fetch logo images
  const { data: fetchedLogos, isLoading: isLoadingLogos, error: logosError } = useLogoQuery(
    logoItemsSliced,
    config.logoSet,
    i18n.language as SupportedLanguage,
    selectedList,
    config.enabled && logoItemsSliced.length > 0,
  );

  // Initialize game when logos are loaded
  useEffect(() => {
    if (
      config.enabled
      && fetchedLogos
      && !gameInitialized
      && config.loadAttempted
      && playerA.logos.length === 0
    ) {
      const initialLogos: LogoItem[] = fetchedLogos.map(fetchedLogo => ({
        id: fetchedLogo.id,
        name: fetchedLogo.name || 'Unknown Logo',
        imageUrl: fetchedLogo.imageUrl,
        eliminated: false,
      }));

      initializeGame(initialLogos);
    }
  }, [
    config.enabled,
    fetchedLogos,
    gameInitialized,
    config.loadAttempted,
    playerA.logos.length,
    initializeGame,
  ]);

  return {
    isLoading: isLoadingItems || isLoadingLogos,
    error: itemsError || logosError,
    isInitialized: gameInitialized && config.loadAttempted,
  };
}
