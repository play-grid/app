import { useGameNavigation } from '@/hooks/use-game-navigation';
import { useGameStore } from '../stores/game-state-store';

export function useLogoListChanger() {
  const { navigate } = useGameNavigation('guess-logo');
  const { selectedList, setSelectedList, selectedSet, selectedGrid, playerA, playerB } = useGameStore();

  const changeLogoList = (listId: string) => {
    if (listId === selectedList || !listId) {
      return;
    }
    // 1. Update the state
    setSelectedList(listId);

    // 2. Update the URL
    navigate(
      `/game/${selectedSet}/${listId}/${selectedGrid}/${encodeURIComponent(
        playerA.name,
      )}/${encodeURIComponent(playerB.name)}`,
      { replace: true },
    );
  };

  return { changeLogoList };
}
