import { useEffect } from 'react';
import { useRoomSession } from './room-store';

/**
 * Hook to clean up session when user navigates away from multiplayer game
 * Call this in your game page component
 */
export function useSessionCleanup(options?: {
  /**
   * If true, clears session when component unmounts
   * Default: false (keeps session for page refreshes)
   */
  clearOnUnmount?: boolean;

  /**
   * If provided, only clears if current session matches this roomId
   */
  roomId?: string;
}) {
  const { session, clearSession } = useRoomSession();

  useEffect(() => {
    return () => {
      if (options?.clearOnUnmount) {
        // Only clear if roomId matches or no roomId specified
        if (!options.roomId || session?.roomId === options.roomId) {
          clearSession();
        }
      }
    };
  }, [options?.clearOnUnmount, options?.roomId, session?.roomId, clearSession]);

  return { clearSession };
}

/**
 * Clear session when user explicitly leaves (e.g., clicks "Leave Game")
 */
export function useClearSession() {
  const { clearSession } = useRoomSession();
  return clearSession;
}
