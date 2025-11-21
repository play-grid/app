import type {
  GamePhase,
  Player,
} from '../../game-logic/schema/state.types';
import { useCallback } from 'react';
import { useDispatch } from './use-dispatch';

/**
 * Pre-built action creators for common game operations.
 * Much cleaner than raw dispatch calls.
 *
 * @example
 * ```tsx
 * function Lobby() {
 *   const { addPlayer, toggleReady, startGame } = useGameActions();
 *
 *   return (
 *     <>
 *       <button onClick={() => addPlayer({ id: '1', name: 'Alice' })}>
 *         Join
 *       </button>
 *       <button onClick={() => toggleReady('1')}>
 *         Ready Up
 *       </button>
 *       <button onClick={startGame}>
 *         Start Game
 *       </button>
 *     </>
 *   );
 * }
 * ```
 */
export function useGameActions() {
  const dispatch = useDispatch();

  // Phase Management

  const setPhase = useCallback(
    async (phase: GamePhase) => {
      await dispatch({ type: 'SET_PHASE', payload: phase });
    },
    [dispatch],
  );

  const startGame = useCallback(
    async () => {
      await dispatch({ type: 'START_GAME' });
    },
    [dispatch],
  );

  const endGame = useCallback(
    async () => {
      await dispatch({ type: 'END_GAME' });
    },
    [dispatch],
  );

  const resetGame = useCallback(
    async () => {
      await dispatch({ type: 'RESET_GAME' });
    },
    [dispatch],
  );

  // Player Management
  const addPlayer = useCallback(
    async (playerData: Omit<Player, 'isHost' | 'isReady' | 'score'>) => {
      await dispatch({
        type: 'ADD_PLAYER',
        payload: playerData,
      });
    },
    [dispatch],
  );

  const removePlayer = useCallback(
    async (playerId: string) => {
      await dispatch({
        type: 'REMOVE_PLAYER',
        payload: { playerId },
      });
    },
    [dispatch],
  );

  const updatePlayer = useCallback(
    async (playerId: string, updates: Partial<Player>) => {
      await dispatch({
        type: 'UPDATE_PLAYER',
        payload: { playerId, updates },
      });
    },
    [dispatch],
  );

  const toggleReady = useCallback(
    async (playerId: string) => {
      await dispatch({
        type: 'TOGGLE_PLAYER_READY',
        payload: { playerId },
      });
    },
    [dispatch],
  );

  // Settings Management

  const updateSettings = useCallback(
    async (updates: Record<string, unknown>) => {
      await dispatch({
        type: 'UPDATE_SETTINGS',
        payload: updates,
      });
    },
    [dispatch],
  );

  // Turn Management

  const nextTurn = useCallback(
    async () => {
      await dispatch({ type: 'NEXT_TURN' });
    },
    [dispatch],
  );

  const previousTurn = useCallback(
    async () => {
      await dispatch({ type: 'PREVIOUS_TURN' });
    },
    [dispatch],
  );

  const setCurrentPlayer = useCallback(
    async (playerId: string) => {
      await dispatch({
        type: 'SET_CURRENT_PLAYER',
        payload: { playerId },
      });
    },
    [dispatch],
  );

  const nextRound = useCallback(
    async () => {
      await dispatch({ type: 'NEXT_ROUND' });
    },
    [dispatch],
  );

  // Return all actions
  return {
    // Phase
    setPhase,
    startGame,
    endGame,
    resetGame,

    // Players
    addPlayer,
    removePlayer,
    updatePlayer,
    toggleReady,

    // Settings
    updateSettings,

    // Turns
    nextTurn,
    previousTurn,
    setCurrentPlayer,
    nextRound,
  };
}
