import { useGameNavigation } from '@/hooks/use-game-navigation';
import { useGameStore } from '../stores/game-state-store';
import { useGameRouteParams } from './game-room/use-game-route-params';

export function useLogoListChanger() {
  const { navigate } = useGameNavigation('guess-logo');
  const routeParams = useGameRouteParams({ enabled: true });
  const { selectedList, setSelectedList } = useGameStore();

  const changeLogoList = (listId: string) => {
    if (listId === selectedList) {
      return;
    }
    // 1. Update the state
    setSelectedList(listId);

    // 2. Update the URL
    navigate(
      `/game/${routeParams.logoSet}/${listId}/${routeParams.gridSize}/${encodeURIComponent(
        routeParams.playerAName,
      )}/${encodeURIComponent(routeParams.playerBName)}`,
      { replace: true },
    );
  };

  return { changeLogoList };
}
