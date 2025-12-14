import type { Room } from '@guess-logo/shared/schemas';
import type { ExtractJsonPayload } from '@/lib/extract-json-payload';
import client from '@/lib/hono-client';

export type CreateRoomPayload = ExtractJsonPayload<(typeof client.api['game-room'])['$post']>;

export type CreateRoomResponse = Room & {
  websocketUrl?: string;
  hostPlayer?: { id: string; name: string };
  credentials?: string;
  currentState?: any;
};

type JoinRoomPayload = ExtractJsonPayload<(typeof client.api['game-room'][':id']['join'])['$post']>;

export async function createGameRoom(payload: CreateRoomPayload): Promise<CreateRoomResponse> {
  const response = await client.api['game-room'].$post({ json: payload });

  if (!response.ok) {
    throw new Error('Failed to create game room');
  }
  return response.json();
}

export async function joinGameRoom(
  roomId: string,
  payload: JoinRoomPayload,
): Promise<Room & {
  websocketUrl: string;
  player: { id: string; name: string };
  credentials: string;
  currentState?: any;
}> {
  const response = await client.api['game-room'][':id'].join.$post({
    param: { id: roomId },
    json: payload,
  });

  if (!response.ok) {
    throw new Error('Failed to join game room');
  }

  return response.json();
}

export async function getRoomById(roomId: string): Promise<Room> {
  const response = await client.api['game-room'][':id'].stats.$get({
    param: { id: roomId },
  });

  if (!response.ok) {
    throw new Error('Failed to get room by ID');
  }

  const data = await response.json();

  if (!data.roomConfig) {
    throw new Error('Room configuration not found');
  }

  return {
    ...data.roomConfig,
    currentPlayers: data.totalConnections,
    status: 'active',
  };
}
