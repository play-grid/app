import type { StatClashAction } from 'src/logic/schema';
import { useDispatch, useGameActions } from '@guess-logo/game-core';
import { useCallback } from 'react';

export function useStatClashActions() {
  const dispatch = useDispatch<StatClashAction>();
  const coreActions = useGameActions();

  const startGame = useCallback(
    (settings: any) => {
      dispatch({ type: 'START_GAME', payload: settings });
      dispatch({
        type: 'REQUEST_STAT_ITEMS',
        payload: {
          category: settings.category,
          metricType: settings.metricType,
          limit: 80,
        },
      });
    },
    [dispatch],
  );

  const guessHigher = useCallback(
    (direction: 'left' | 'right', playerId: string) => {
      dispatch({ type: 'GUESS_HIGHER', payload: { direction, playerId } });
    },
    [dispatch],
  );

  const addHotseatPlayer = useCallback(
    (name: string) => {
      dispatch({ type: 'ADD_HOTSEAT_PLAYER', payload: { name } });
    },
    [dispatch],
  );

  const removeHotseatPlayer = useCallback(
    (playerId: string) => {
      dispatch({ type: 'REMOVE_HOTSEAT_PLAYER', payload: { playerId } });
    },
    [dispatch],
  );

  const statClashError = useCallback(
    (message: string, canRetry: boolean) => {
      dispatch({ type: 'STAT_CLASH_ERROR', payload: { message, canRetry } });
    },
    [dispatch],
  );

  return {
    ...coreActions,
    dispatch,
    startGame,
    guessHigher,
    addHotseatPlayer,
    removeHotseatPlayer,
    statClashError,
  };
}

export type { StatClashAction } from '../logic';
