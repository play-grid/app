import type { LogoSetKey } from '@/lib/logo-data';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguageNavigation } from '@/hooks/use-language-navigation';
import { logoSets } from '@/lib/logo-data';
import { useGameStore } from '@/stores/game-state-store';

export interface GameRouteParams {
  logoSet: LogoSetKey;
  gridSize: string;
  playerAName: string;
  playerBName: string;
  isValidRoute: boolean;
  isLoading: boolean;
}

export function useGameRouteParams(): GameRouteParams {
  const { navigate } = useLanguageNavigation();
  const params = useParams<{
    logoSet: string;
    gridSize: string;
    playerA: string;
    playerB: string;
  }>();

  const {
    setSelectedSet,
    setSelectedGrid,
    setPlayerAName,
    setPlayerBName,
  } = useGameStore();

  // Extract params with defaults and decode player names
  const logoSet = (params.logoSet as LogoSetKey) || 'companies';
  const gridSize = params.gridSize || '8x6';
  const playerAName = decodeURIComponent(params.playerA || 'Player A');
  const playerBName = decodeURIComponent(params.playerB || 'Player B');

  // Validate route
  const isValidRoute = Boolean(logoSets[logoSet]);

  // Set URL params in store on mount or when params change
  useEffect(() => {
    if (!isValidRoute) {
      navigate('/', { replace: true });
      return;
    }

    setSelectedSet(logoSet);
    setSelectedGrid(gridSize);
    setPlayerAName(playerAName);
    setPlayerBName(playerBName);
  }, [
    logoSet,
    gridSize,
    playerAName,
    playerBName,
    isValidRoute,
    navigate,
    setSelectedSet,
    setSelectedGrid,
    setPlayerAName,
    setPlayerBName,
  ]);

  return {
    logoSet,
    gridSize,
    playerAName,
    playerBName,
    isValidRoute,
    isLoading: !isValidRoute, // Simple loading state for invalid routes
  };
}
