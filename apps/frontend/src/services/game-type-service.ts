import client from '@/lib/hono-client';

export async function getGameTypes() {
  const res = await client.api['game-types'].$get();
  if (res.status === 304) {
    return null;
  }
  if (!res.ok) {
    throw new Error('Failed to fetch game types');
  }
  return res.json();
}
