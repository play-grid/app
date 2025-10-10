import { useQueryClient } from '@tanstack/react-query';
import { useGameStore } from '../stores/game-state-store';

export function useLogoListChanger() {
  const queryClient = useQueryClient();
  const setSelectedList = useGameStore(state => state.setSelectedList);

  const changeLogoList = (listId: string) => {
    // 1. Update the state
    setSelectedList(listId);

    // 2. Invalidate the query to trigger a refetch
    queryClient.invalidateQueries({ queryKey: ['logos'] });
  };

  return { changeLogoList };
}
