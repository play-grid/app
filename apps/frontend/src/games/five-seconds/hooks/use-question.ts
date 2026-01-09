import { useFiveSecondsActions, useFiveSecondsState } from '@guess-logo/five-seconds';
import { useCallback } from 'react';

export function useQuestion() {
  const { fetchQuestionMultiplayer } = useFiveSecondsActions();
  const state = useFiveSecondsState();
  const handleFetchQuestion = useCallback(async () => {
    await fetchQuestionMultiplayer();
  }, [fetchQuestionMultiplayer]);

  const question = state.currentQuestion;
  const isLoading = state.currentQuestion === null && !state.questionError;
  const error = state.questionError?.message;

  return {
    question,
    isLoading,
    error,
    fetchQuestion: handleFetchQuestion,
    bufferedQuestionCount: state.questions.length,
  };
}
