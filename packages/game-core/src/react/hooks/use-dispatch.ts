import type { GameAction } from '../../game-logic/schema/actions.types';
import { useCallback } from 'react';
import { useAdapter } from '../adapter-context';

/**
 * Hook to get the dispatch function for sending actions.
 *
 * **Note:** Always async to support multiplayer mode.
 * In local mode, resolves immediately. In multiplayer, waits for server acknowledgment.
 *
 * @example
 * ```tsx
 * function GameControls() {
 *   const dispatch = useDispatch();
 *
 *   const handleAddPlayer = async () => {
 *     await dispatch({
 *       type: 'ADD_PLAYER',
 *       payload: { id: '123', name: 'Alice' }
 *     });
 *   };
 *
 *   return <button onClick={handleAddPlayer}>Join Game</button>;
 * }
 * ```
 *
 * @returns Async dispatch function
 */
export function useDispatch() {
  const adapter = useAdapter();

  // Memoize to prevent unnecessary re-renders
  return useCallback(
    async (action: GameAction) => {
      await adapter.dispatch(action);
    },
    [adapter],
  );
}
