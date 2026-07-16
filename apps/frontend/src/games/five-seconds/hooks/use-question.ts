import type { FiveSecondsAction } from '@playgrid/five-seconds';
import { useFiveSecondsActions, useFiveSecondsState } from '@playgrid/five-seconds';
import { useDispatch } from '@playgrid/game-core';
import { useCallback, useEffect } from 'react';
import { useCustomQuestionsStore } from '../stores/custom-questions-store';
import { normalizeDifficulty } from '../utils/difficulty-utils';

export function getFilteredCustomQuestions(
  allQuestions: any[],
  categoryIds: string[],
  difficulty: string,
  excludeIds: string[],
) {
  const normalizedDifficulty = difficulty.trim().toLowerCase();
  const isAllDifficulty = normalizedDifficulty === 'all';

  const selectedCategories = categoryIds.length > 0
    ? categoryIds.map(c => c.trim().toLowerCase())
    : [...new Set(allQuestions.map((q: any) => q.categoryId?.trim().toLowerCase()).filter(Boolean))];

  const filtered = allQuestions
    .filter((q) => {
      const qCat = q.categoryId?.trim().toLowerCase();
      const qDiff = normalizeDifficulty(q.difficulty);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(qCat);
      const matchesDifficulty = isAllDifficulty || qDiff === normalizedDifficulty;
      return matchesCategory && matchesDifficulty && !excludeIds.includes(q.id);
    })
    .sort(() => Math.random() - 0.5);
  return filtered;
}

export function useQuestion() {
  const dispatch = useDispatch<FiveSecondsAction>();
  const { fetchQuestionMultiplayer } = useFiveSecondsActions();
  const state = useFiveSecondsState();
  const { customQuestions } = useCustomQuestionsStore();

  const handleFetchQuestion = useCallback(async () => {
    if (state.settings.useCustomQuestions) {
      const excludeIds = state.customSeenQuestionIds || [];
      const filteredQuestions = getFilteredCustomQuestions(
        customQuestions,
        state.settings.customCategoryIds || [],
        state.settings.difficulty,
        excludeIds,
      );

      if (filteredQuestions.length > 0) {
        const questionsNeeded = Math.max(5 - state.questions.length, 0);
        if (questionsNeeded > 0 && state.questions.length < 5) {
          const bufferQuestions = filteredQuestions.slice(0, questionsNeeded);

          await dispatch({
            type: 'LOAD_QUESTIONS',
            payload: { questions: bufferQuestions },
          });
        }

        if (!state.currentQuestion && filteredQuestions.length > 0) {
          await dispatch({
            type: 'SET_QUESTION',
            payload: { question: filteredQuestions[0] },
          });
        }
      }
      else {
        const isExhausted = customQuestions.length > 0;
        const message = isExhausted
          ? 'All custom questions have been used. Please add more questions or switch to server questions.'
          : 'No custom questions available. Import questions to get started.';

        await dispatch({
          type: 'FETCH_QUESTIONS_ERROR',
          payload: {
            message,
            canRetry: false,
            suggestSettingsChange: true,
          },
        });
      }
    }
    else {
      await fetchQuestionMultiplayer();
    }
  }, [
    state.settings.useCustomQuestions,
    state.settings.customCategoryIds,
    state.settings.difficulty,
    state.customSeenQuestionIds,
    state.questions.length,
    state.currentQuestion,
    customQuestions,
    fetchQuestionMultiplayer,
    dispatch,
  ]);

  // Auto-fetch when component mounts or when question is needed
  useEffect(() => {
    if (!state.currentQuestion && !state.questionError) {
      handleFetchQuestion();
    }
  }, [state.currentQuestion, state.questionError, handleFetchQuestion]);

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
