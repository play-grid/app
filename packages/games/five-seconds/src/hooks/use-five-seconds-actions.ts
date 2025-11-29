import type { FiveSecondsAction } from '../logic';
import { useDispatch, useGameActions } from '@guess-logo/game-core';
import { useCallback } from 'react';

export function useFiveSecondsActions() {
  const dispatch = useDispatch<FiveSecondsAction>();
  const coreActions = useGameActions();

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

  const resetVoting = useCallback(async () => {
    await dispatch({ type: 'RESET_VOTING' });
  }, [dispatch]);

  return {
    ...coreActions,

    addSeenQuestionId,
    startVoting,
    submitVote,
    tallyVotes,
    resetVoting,
  };
}
