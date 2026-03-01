import type { FiveSecondsAction } from '../logic';
import { useDispatch, useGameActions } from '@playgrid/game-core';
import { useCallback } from 'react';

export function useFiveSecondsActions() {
  const dispatch = useDispatch<FiveSecondsAction>();
  const coreActions = useGameActions();

  const setGameTurnPhase = useCallback(
    async (phase: string) => {
      await dispatch({ type: 'SET_GAME_TURN_PHASE', payload: { phase } });
    },
    [dispatch],
  );

  const fetchQuestionMultiplayer = useCallback(async () => {
    await dispatch({ type: 'FETCH_QUESTION' });
  }, [dispatch]);

  const startTurn = useCallback(async () => {
    await dispatch({ type: 'START_TURN' });
  }, [dispatch]);

  const addSeenQuestionId = useCallback(
    async (id: string) => {
      await dispatch({
        type: 'ADD_SEEN_QUESTION_ID',
        payload: { id },
      });
    },
    [dispatch],
  );

  const startVoting = useCallback(
    async (voters: string[]) => {
      await dispatch({
        type: 'START_VOTING',
        payload: { voters },
      });
    },
    [dispatch],
  );

  const submitVote = useCallback(
    async (isValid: boolean) => {
      await dispatch({
        type: 'SUBMIT_VOTE',
        payload: { isValid },
      });
    },
    [dispatch],
  );

  const tallyVotes = useCallback(async (currentPlayerId: string) => {
    await dispatch({ type: 'TALLY_VOTES', payload: { currentPlayerId } });
  }, [dispatch]);

  return {
    ...coreActions,
    setGameTurnPhase,
    dispatch,
    fetchQuestionMultiplayer,
    startTurn,
    addSeenQuestionId,
    startVoting,
    submitVote,
    tallyVotes,
  };
}
