import type { Difficulty } from '@guess-logo/shared/schemas/five-seconds';
import type { getRandomQuestionRoute } from './questions.routes';
import type { AppRouteHandler } from '@/api/lib/types';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import questions from './data/questions.json';

export const getRandomQuestion: AppRouteHandler<getRandomQuestionRoute> = async (c) => {
  const { difficulty, categoryIds, excludeIds } = c.req.valid('query');
  let filteredQuestions = [...(questions as {
    question: string;
    estimatedReadingTime: string;
    exampleAnswers: string;
    categoryId: string;
    difficulty: Difficulty;
    metadata: Record<string, string>;
  }[])];

  // Filter by difficulty
  if (difficulty) {
    filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
  }

  // Filter by requested categories (multiple)
  if (categoryIds && categoryIds.length > 0) {
    filteredQuestions = filteredQuestions.filter(q =>
      categoryIds.includes(q.categoryId),
    );
  }

  // Exclude certain questions
  if (excludeIds && excludeIds.length > 0) {
    filteredQuestions = filteredQuestions.filter(
      q => !excludeIds.includes(q.question.toLowerCase().replace(/\s/g, '-')),
    );
  }

  if (!filteredQuestions.length) {
    return c.json({ error: 'No questions found matching the criteria' }, HttpStatusCodes.NOT_FOUND);
  }

  // Random selection
  const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
  const randomQuestion = filteredQuestions[randomIndex];

  // Return question with single category
  const randomQuestionWithId = {
    ...randomQuestion,
    id: randomQuestion.question.toLowerCase().replace(/\s/g, '-'),
  };

  return c.json(randomQuestionWithId, HttpStatusCodes.OK);
};
