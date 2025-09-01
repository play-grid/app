import { env } from '@/env';

export async function createGameRoom(): Promise<{ roomId: string }> {
  const response = await fetch(`${env.VITE_API_URL}/game-room/create`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to create game room');
  }

  return response.json();
}
