import type { FiveSecondsAction } from '@playgrid/five-seconds';
import { useFiveSecondsActions, useFiveSecondsState } from '@playgrid/five-seconds';
import { useDispatch } from '@playgrid/game-core';
import { useCallback, useEffect } from 'react';
import { useCustomQuestionsStore } from '../stores/custom-questions-store';
import { normalizeDifficulty } from '../utils/difficulty-utils';

function getFilteredCustomQuestions(
  allQuestions: any[],
  categoryIds: string[],
  difficulty: string,
  excludeIds: string[],
) {
  const normalizedSelectedCategories = categoryIds.map(c => c.trim().toLowerCase());
  const normalizedDifficulty = difficulty.trim().toLowerCase();

  const filtered = allQuestions
    .filter((q) => {
      const qCat = q.categoryId.trim().toLowerCase();
      const qDiff = normalizeDifficulty(q.difficulty);
      return normalizedSelectedCategories.includes(qCat) && qDiff === normalizedDifficulty && !excludeIds.includes(q.id);
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
      // Use custom questions for local mode
      const filteredQuestions = getFilteredCustomQuestions(
        customQuestions,
        state.settings.customCategoryIds || [],
        state.settings.difficulty,
        state.seenQuestionIds,
      );

      if (filteredQuestions.length > 0) {
        // Load multiple questions for buffer if needed
        const questionsNeeded = Math.max(5 - state.questions.length, 0);
        if (questionsNeeded > 0 && state.questions.length < 5) {
          const bufferQuestions = filteredQuestions.slice(0, questionsNeeded);

          await dispatch({
            type: 'LOAD_QUESTIONS',
            payload: { questions: bufferQuestions },
          });
        }

        // Set current question if none exists
        if (!state.currentQuestion && filteredQuestions.length > 0) {
          await dispatch({
            type: 'SET_QUESTION',
            payload: { question: filteredQuestions[0] },
          });
        }
      }
      else {
        console.warn('[useQuestion] No questions available after filtering');

        // Handle no questions available
        await dispatch({
          type: 'FETCH_QUESTIONS_ERROR',
          payload: {
            message: 'No custom questions available with current settings. Please add questions or change category/difficulty.',
            canRetry: false,
            suggestSettingsChange: true,
          },
        });
      }
    }
    else {
      // Use server questions
      await fetchQuestionMultiplayer();
    }
  }, [
    state.settings.useCustomQuestions,
    state.settings.customCategoryIds,
    state.settings.difficulty,
    state.seenQuestionIds,
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
