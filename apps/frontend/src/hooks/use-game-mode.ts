import { useSearchParams } from 'react-router-dom';
import { useRoomSession } from '@/features/room/room-store';

export function useGameMode() {
  const [searchParams] = useSearchParams();
  const { session } = useRoomSession();

  const mode = searchParams.get('mode') || 'local';
  const roomId = searchParams.get('room');
  const isMultiplayer = !!session?.playerId;
  const isHost = searchParams.get('host') === 'true';

  return { isMultiplayer, mode, roomId, isHost };
}
