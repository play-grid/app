import client from '@/lib/hono-client';

export async function createGameRoom(roomConfig: {
  name: string;
  maxPlayers: number;
  gameType: 'logo-guess' | 'quick-match';
  isPrivate: boolean;
}) {
  const response = await client.api['game-room'].$post({ json: roomConfig });

  if (!response.ok) {
    throw new Error('Failed to create game room');
  }

  return response.json();
}
