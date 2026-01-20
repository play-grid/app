import type { LogoSetKey } from '../lib/logo-data';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGameNavigation } from '@/hooks/use-game-navigation';
import { logoSets } from '../lib/logo-data';
import { useGameStore } from '../stores/game-state-store';

export interface GameRouteParams {
  logoSet: LogoSetKey;
  listId: string;
  gridSize: string;
  playerAName: string;
  playerBName: string;
  isValidRoute: boolean;
  isLoading: boolean;
}

export function useGameRouteParams({ enabled }: { enabled: boolean }): GameRouteParams {
  const { navigate } = useGameNavigation('guess-logo');
  const params = useParams<{
    logoSet: string;
    listId: string;
    gridSize: string;
    playerA: string;
    playerB: string;
  }>();

  const {
    setSelectedSet,
    setSelectedList,
    setSelectedGrid,
    setPlayerAName,
    setPlayerBName,
  } = useGameStore();

  // Extract params with defaults and decode player names
  const logoSet = (params.logoSet as LogoSetKey) || 'companies';
  const listId = decodeURIComponent(params.listId || 'companies');
  const gridSize = params.gridSize || '8x6';
  const playerAName = decodeURIComponent(params.playerA || 'Player A');
  const playerBName = decodeURIComponent(params.playerB || 'Player B');

  // Validate route
  const isValidRoute = Boolean(logoSets[logoSet]);

  // Set URL params in store on mount or when params change
  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!isValidRoute) {
      navigate('/', { replace: true });
      return;
    }

    const store = useGameStore.getState();
    if (
      store.selectedSet !== logoSet
      || store.selectedList !== listId
      || store.selectedGrid !== gridSize
      || store.playerA.name !== playerAName
      || store.playerB.name !== playerBName
    ) {
      setSelectedSet(logoSet);
      setSelectedList(listId);
      setSelectedGrid(gridSize);
      setPlayerAName(playerAName);
      setPlayerBName(playerBName);
    }
  }, [
    enabled,
    logoSet,
    listId,
    gridSize,
    playerAName,
    playerBName,
    isValidRoute,
    navigate,
    setSelectedSet,
    setSelectedList,
    setSelectedGrid,
    setPlayerAName,
    setPlayerBName,
  ]);

  return {
    logoSet,
    listId,
    gridSize,
    playerAName,
    playerBName,
    isValidRoute,
    isLoading: !isValidRoute,
  };
}
