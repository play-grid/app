import { useGameStore } from '../stores/game-state-store';

export function useLogoListChanger() {
  const setSelectedList = useGameStore(state => state.setSelectedList);

  const changeLogoList = (listId: string) => {
    // 1. Update the state
    setSelectedList(listId);
  };

  return { changeLogoList };
}
