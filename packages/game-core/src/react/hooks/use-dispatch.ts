import type { GameAction } from '../../game-logic/schema/actions.types';
import { useCallback } from 'react';
import { useAdapter } from '../adapter-context';

/**
 * Hook to get the dispatch function for sending actions.
 */
export function useDispatch<TAction = GameAction>() {
  const adapter = useAdapter();

  return useCallback(
    async (action: TAction) => {
      await adapter.dispatch(action as any);
    },
    [adapter],
  );
}
