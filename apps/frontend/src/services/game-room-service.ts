import type { ExtractJsonPayload } from '@/lib/extract-json-payload';
import client from '@/lib/hono-client';

type CreateRoomPayload = ExtractJsonPayload<(typeof client.api['game-room'])['$post']>;

export async function createGameRoom(payload: CreateRoomPayload) {
  const response = await client.api['game-room'].$post({ json: payload });

  if (!response.ok) {
    throw new Error('Failed to create game room');
  }

  return response.json();
}
