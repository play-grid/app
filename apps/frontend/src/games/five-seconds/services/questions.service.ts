import type { Difficulty }  from '@guess-logo/five-seconds';
import { HTTPException } from 'hono/http-exception';
import client from '@/lib/hono-client';

export class NoQuestionsFoundError extends Error {
  constructor() {
    super('No questions found matching the criteria');
    this.name = 'NoQuestionsFoundError';
  }
}

export async function getRandomQuestion(
  categoryIds: string[],
  difficulty: Difficulty,
  excludeIds: string[],
) {
  try {
    const res = await client.api.games['five-seconds'].questions.random.$get({
      query: {
        categoryIds,
        difficulty,
        excludeIds,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch random question');
    }
    return res.json();
  }
  catch (err) {
    if (err instanceof HTTPException && err.res && err.res.status === 200) {
      const errorData = await err.res.json();
      if (errorData.code === 'NO_QUESTIONS_FOUND') {
        throw new NoQuestionsFoundError();
      }
    }
    throw err;
  }
}
