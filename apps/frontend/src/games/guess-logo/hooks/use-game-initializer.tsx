import type { SupportedLanguage } from '@playgrid/shared/types';
import type { LogoSetKey } from '../lib/logo-data';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getGridConfiguration } from '../lib/grid-configurations';
import { useGameStore } from '../stores/game-state-store';
import { useLogoItems } from './use-logo-items';

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

  const gridConfig = getGridConfiguration(config.gridSize);

  const { data: logoItems, isLoading, error } = useLogoItems(
    config.logoSet,
    selectedList,
    i18n.language as SupportedLanguage,
    gridConfig.totalLogos,
    config.enabled,
  );

  const logoItemsSliced = useMemo(() => {
    const items = logoItems?.slice(0, gridConfig.totalLogos) || [];
    return items.map((item, index) => ({
      id: index,
      name: item.name,
      imageUrl: item.imageUrl,
      eliminated: false,
    }));
  }, [logoItems, gridConfig]);

  useEffect(() => {
    if (
      config.enabled
      && logoItemsSliced.length > 0
      && !gameInitialized
      && config.loadAttempted
      && playerA.logos.length === 0
    ) {
      initializeGame(logoItemsSliced);
    }
  }, [
    config.enabled,
    logoItemsSliced,
    gameInitialized,
    config.loadAttempted,
    playerA.logos.length,
    initializeGame,
  ]);

  return {
    isLoading,
    error,
    isInitialized: gameInitialized && config.loadAttempted,
  };
}
