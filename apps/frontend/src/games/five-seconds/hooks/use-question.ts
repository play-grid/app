import type { Difficulty, Question } from '@guess-logo/five-seconds';
import { useFiveSecondsActions, useFiveSecondsState } from '@guess-logo/five-seconds';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { useGameMode } from '@/hooks/use-game-mode';
import { getRandomQuestion, NoQuestionsFoundError } from '../services/questions.service';

interface UseQuestionOptions {
  categoryIds: string[];
  difficulty: Difficulty;
  excludeIds: string[];
  timePerTurn: number;
  enabled: boolean;
}

export function useQuestion({
  categoryIds,
  difficulty,
  excludeIds,
  timePerTurn,
  enabled,
}: UseQuestionOptions) {
  const queryClient = useQueryClient();
  const { fetchQuestionMultiplayer } = useFiveSecondsActions();
  const state = useFiveSecondsState();
  const { isMultiplayer } = useGameMode();

  const queryKey = useMemo(
    () => [
      'questions',
      categoryIds.sort().join(','),
      difficulty,
      timePerTurn,
    ] as const,
    [categoryIds, difficulty, timePerTurn],
  );

  const reactQueryResult = useQuery({
    queryKey,
    queryFn: async (): Promise<Question> => {
      return getRandomQuestion(
        categoryIds,
        difficulty,
        excludeIds,
        timePerTurn,
      );
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
    enabled: !isMultiplayer && enabled,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const fetchQuestionLocal = useCallback(async () => {
    if (!isMultiplayer) {
      await reactQueryResult.refetch();
    }
  }, [isMultiplayer, reactQueryResult]);

  const handleFetchQuestion = useCallback(async () => {
    if (isMultiplayer) {
      await fetchQuestionMultiplayer();
    }
    else {
      await fetchQuestionLocal();
    }
  }, [isMultiplayer, fetchQuestionMultiplayer, fetchQuestionLocal]);

  const question = isMultiplayer ? state.currentQuestion : reactQueryResult.data;
  const isLoading = isMultiplayer
    ? state.currentQuestion === null
    : reactQueryResult.isLoading;

  const error = isMultiplayer
    ? undefined
    : reactQueryResult.error instanceof NoQuestionsFoundError
      ? reactQueryResult.error.message
      : reactQueryResult.error?.message;

  useEffect(() => {
    if (!isMultiplayer && enabled && !question && !isLoading && !error) {
      handleFetchQuestion();
    }
  }, [isMultiplayer, enabled, question, isLoading, error, handleFetchQuestion]);

  useEffect(() => {
    return () => {
      if (!isMultiplayer) {
        queryClient.removeQueries({ queryKey });
      }
    };
  }, [queryClient, queryKey, isMultiplayer]);

  return {
    question,
    isLoading,
    error,
    fetchQuestion: handleFetchQuestion,
    bufferedQuestionCount: isMultiplayer ? state.questions.length : 0,
  };
}
