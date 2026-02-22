import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RoomSession {
  roomId: string;
  playerId: string;
  playerName: string;
  credentials: string;
  initialGameState?: any;
  inviteToken?: string | null;
  inviteExpiresAt?: string | null;
}

interface RoomSessionState {
  session: RoomSession | null;
  setSession: (session: RoomSession | null) => void;
  clearSession: () => void;

  // Helper to check if session is valid for a specific room
  isValidForRoom: (roomId: string) => boolean;
}

export const useRoomSessionStore = create<RoomSessionState>()(
  persist(
    (set, get) => ({
      session: null,

      setSession: (session) => {
        set({ session });
      },

      clearSession: () => {
        set({ session: null });
      },

      isValidForRoom: (roomId) => {
        const { session } = get();
        return session?.roomId === roomId && !!session.credentials;
      },
    }),
    {
      name: 'room-session-storage', // localStorage key

      // Only persist these fields (skip initialGameState as it's large)
      partialize: state => ({
        session: state.session
          ? {
              roomId: state.session.roomId,
              playerId: state.session.playerId,
              playerName: state.session.playerName,
              credentials: state.session.credentials,
              inviteToken: state.session.inviteToken,
              inviteExpiresAt: state.session.inviteExpiresAt,
            }
          : null,
      }),

      // Optional: Add version for migration support
      version: 1,
    },
  ),
);

export function useRoomSession() {
  const session = useRoomSessionStore(state => state.session);
  const setSession = useRoomSessionStore(state => state.setSession);
  const clearSession = useRoomSessionStore(state => state.clearSession);

  return {
    session,
    setSession,
    clearSession,
  };
}
