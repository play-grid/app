import client from '@/lib/hono-client';

export async function getGameTypes() {
  const response = await client.api['game-types'].$get();

  if (!response.ok) {
    throw new Error('Failed to fetch game types');
  }

  return response.json();
}
