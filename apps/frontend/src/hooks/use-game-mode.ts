import { useSearchParams } from 'react-router-dom';
import { useRoomSession } from '@/features/room/room-store';

export interface UseGameModeResult {
  /** Whether the game mode is multiplayer based on URL params (intent-based) */
  isMultiplayer: boolean;
  /** Whether multiplayer features can be used (requires valid session connection) */
  canUseMultiplayerFeatures: boolean;
  /** The current game mode from URL ('local' | 'multiplayer') */
  mode: string;
  /** The room ID from URL params (if present) */
  roomId: string | null;
  /** Whether the current user is the host based on URL params */
  isHost: boolean;
}

export function useGameMode(): UseGameModeResult {
  const [searchParams] = useSearchParams();
  const { session } = useRoomSession();

  const mode = searchParams.get('mode') || 'local';
  const roomId = searchParams.get('room');
  const isMultiplayer = mode === 'multiplayer';
  const isHost = searchParams.get('host') === 'true';

  const canUseMultiplayerFeatures = !!(
    isMultiplayer && roomId && session?.roomId === roomId && session?.credentials
  );

  return { isMultiplayer, canUseMultiplayerFeatures, mode, roomId, isHost };
}
