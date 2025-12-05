import { useSearchParams } from 'react-router-dom';

export function useGameMode() {
  const [searchParams] = useSearchParams();

  const mode = searchParams.get('mode') || 'local';
  const roomId = searchParams.get('room');
  const isMultiplayer = mode === 'multiplayer';
  const isHost = searchParams.get('host') === 'true';

  return { isMultiplayer, mode, roomId, isHost };
}
