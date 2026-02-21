import type { ExtractJsonPayload } from '@/lib/extract-json-payload';
import client from '@/lib/hono-client';

const gameRoomById = client.api['game-room'][':id'];

export type CreateRoomPayload = ExtractJsonPayload<(typeof client.api['game-room'])['$post']>;
export type CreateRoomResponse = Awaited<ReturnType<typeof createGameRoom>>;

export async function createGameRoom(payload: CreateRoomPayload) {
  const response = await client.api['game-room'].$post({ json: payload });

  if (!response.ok) {
    throw new Error('Failed to create game room');
  }
  return response.json();
}

type JoinRoomPayload = ExtractJsonPayload<(typeof client.api['game-room'][':id']['join'])['$post']>;
export type JoinRoomResponse = Awaited<ReturnType<typeof joinGameRoom>>;

export async function joinGameRoom(
  roomId: string,
  payload: JoinRoomPayload,
) {
  const response = await gameRoomById.join.$post({
    param: { id: roomId },
    json: payload,
  });

  if (!response.ok) {
    throw new Error('Failed to join game room');
  }

  return response.json();
}

export async function getRoomById(roomId: string) {
  const response = await gameRoomById.stats.$get({
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
export type GetRoomByIdResponse = Awaited<ReturnType<typeof getRoomById>>;

const invite = gameRoomById.invite;

type GenerateInvitePayload = ExtractJsonPayload<(typeof invite)['$post']>;
export type GenerateInviteResponse = Awaited<ReturnType<typeof generateInviteToken>>;

export async function generateInviteToken(
  roomId: string,
  payload?: GenerateInvitePayload,
) {
  const response = await invite.$post({
    param: { id: roomId },
    json: payload || {},
  });

  if (!response.ok) {
    throw new Error('Failed to generate invite token');
  }

  return response.json();
}

export async function validateInviteToken(
  roomId: string,
  token: string,
) {
  const response = await invite[':token'].validate.$get({
    param: { id: roomId, token },
  });

  if (!response.ok) {
    throw new Error('Failed to validate invite token');
  }

  return response.json();
}
export type ValidateInviteResponse = Awaited<ReturnType<typeof validateInviteToken>>;

export type RevokeInvitePayload = ExtractJsonPayload<(typeof invite)['$delete']>;
export type RevokeInviteResponse = Awaited<ReturnType<typeof revokeInviteToken>>;

export async function revokeInviteToken(
  roomId: string,
  payload: RevokeInvitePayload,
) {
  const response = await invite.$delete({
    param: { id: roomId },
    json: payload,
  });

  if (!response.ok) {
    throw new Error('Failed to revoke invite token');
  }

  return response.json();
}
