import type { Difficulty } from '@guess-logo/shared/schemas/five-seconds';
import client from '@/lib/hono-client';

export async function getRandomQuestion(
  categoryIds: string[],
  difficulty: Difficulty,
  excludeIds: string[],
) {
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
