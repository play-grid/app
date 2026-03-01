import type { GetRandomQuestionResponse } from '@playgrid/api/schemas';
import type { Difficulty, Question } from '@playgrid/five-seconds';
import client from '@/lib/hono-client';

export class NoQuestionsFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoQuestionsFoundError';
  }
}

function isErrorResponse(
  data: GetRandomQuestionResponse,
): data is Extract<GetRandomQuestionResponse, { code: 'NO_QUESTIONS_FOUND' }> {
  return 'code' in data && data.code === 'NO_QUESTIONS_FOUND';
}

export async function getRandomQuestion(
  categoryIds: string[],
  difficulty: Difficulty,
  excludeIds: string[],
  timePerTurn: number = 5,
): Promise<Question> {
  try {
    const res = await client.api.games['five-seconds'].questions.random.$get({
      query: {
        categoryIds,
        difficulty,
        excludeIds,
        timePerTurn,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch random question');
    }

    const data: GetRandomQuestionResponse = await res.json();

    if (isErrorResponse(data)) {
      throw new NoQuestionsFoundError(data.message);
    }

    return data as Question;
  }
  catch (error) {
    if (error instanceof NoQuestionsFoundError) {
      throw error;
    }
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch question',
    );
  }
}
