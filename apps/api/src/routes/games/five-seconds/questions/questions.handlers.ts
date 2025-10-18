import type { Difficulty } from '@guess-logo/shared/schemas/five-seconds';
import type { getRandomQuestionRoute } from './questions.routes';
import type { AppRouteHandler } from '@/api/lib/types';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import questions from './data/questions.json';

export const getRandomQuestion: AppRouteHandler<getRandomQuestionRoute> = async (c) => {
  const { difficulty, categoryIds, excludeIds } = c.req.query();

  // TODO: Replace this with a call to the KV store, not now we will use local json
  const allQuestions = questions;

  let filteredQuestions = allQuestions;

  if (difficulty) {
    const difficultyFiltered = allQuestions.filter(q => q.difficulty === difficulty);
    if (difficultyFiltered.length > 0) {
      filteredQuestions = difficultyFiltered;
    }
  }

  if (categoryIds) {
    filteredQuestions = filteredQuestions.filter(q =>
      q.categoryIds.some((id: string) => categoryIds.includes(id)),
    );
  }

  if (excludeIds) {
    const excluded = Array.isArray(excludeIds) ? excludeIds : [excludeIds];
    filteredQuestions = filteredQuestions.filter(q => !excluded.includes(q.question));
  }

  if (filteredQuestions.length === 0) {
    return c.json({ error: 'No questions found' }, HttpStatusCodes.NOT_FOUND);
  }

  const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
  const randomQuestion = filteredQuestions[randomIndex];

  const randomQuestionWithId = {
    ...randomQuestion,
    id: randomQuestion.question.toLowerCase().replace(/\s/g, '-'),
    difficulty: randomQuestion.difficulty as Difficulty,
  };

  return c.json(randomQuestionWithId, HttpStatusCodes.OK);
};
