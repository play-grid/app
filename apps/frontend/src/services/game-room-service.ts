import type { ExtractJsonPayload } from '@/lib/extract-json-payload';
import client from '@/lib/hono-client';

type CreateRoomPayload = ExtractJsonPayload<(typeof client.api['game-room'])['$post']>;
type JoinRoomPayload = ExtractJsonPayload<(typeof client.api['game-room'][':id']['join'])['$post']>;

export async function createGameRoom(payload: CreateRoomPayload) {
  const response = await client.api['game-room'].$post({ json: payload });

  if (!response.ok) {
    throw new Error('Failed to create game room');
  }

  return response.json();
}

export async function joinGameRoom(roomId: string, payload: JoinRoomPayload) {
  const response = await client.api['game-room'][':id'].join.$post({
    param: { id: roomId },
    json: payload,
  });

  if (!response.ok) {
    throw new Error('Failed to join game room');
  }

  return response.json();
}
