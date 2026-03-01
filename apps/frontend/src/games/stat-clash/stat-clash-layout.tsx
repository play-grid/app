import type { ReactNode } from 'react';
import { AdapterProvider } from '@playgrid/game-core';
import { statClashGame } from '@playgrid/stat-clash';
import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useRoomSession } from '@/features/room/room-store';
import { useGameMode } from '@/hooks/use-game-mode';
import { getOrCreateAdapter } from '@/lib/adapter-instance';
import './index.css';

const PERSISTENCE_KEY = 'stat-clash-game:v1';

function createLocalInitialState() {
  const hostId = 'local-player-1';
  const now = Date.now();

  return statClashGame.stateSchema.parse({
    phase: 'lobby',
    hostId,
    settings: {
      mode: 'hotseat',
      category: 'mixed',
      metricType: undefined,
      difficulty: 'medium',
      timeLimit: undefined,
      streakGoal: undefined,
      roundsPerPlayer: 10,
    },
    players: {
      [hostId]: {
        id: hostId,
        name: 'Player 1',
        score: 0,
        streak: 0,
        roundsPlayed: 0,
        isHost: true,
        isReady: true,
      },
    },
    turnState: {
      playerOrder: [hostId],
      currentPlayerIndex: 0,
      currentPlayerId: hostId,
      direction: 'forward',
      roundNumber: 1,
      turnNumber: 0,
      skipsRemaining: 0,
    },
    currentRound: null,
    recentRounds: [],
    availableItems: [],
    usedItemIds: [],
    error: null,
    createdAt: now,
    lastActivityAt: now,
  });
}

export function StatClashLayout({ children }: { children?: ReactNode }) {
  const { session } = useRoomSession();
  const { roomId, canUseMultiplayerFeatures } = useGameMode();

  const initialGameState = session?.initialGameState;
  const initialState = useMemo(() => {
    if (initialGameState) {
      const parsed = statClashGame.stateSchema.safeParse(initialGameState);
      if (parsed.success) {
        return parsed.data;
      }
    }

    return createLocalInitialState();
  }, [initialGameState]);

  const adapter = useMemo(() => {
    const identifier = canUseMultiplayerFeatures ? `stat-clash-multiplayer-${roomId}` : 'stat-clash-local';

    if (canUseMultiplayerFeatures && session?.playerId && session?.credentials) {
      return getOrCreateAdapter(
        statClashGame,
        {
          mode: 'multiplayer',
          roomId: roomId!,
          playerId: session.playerId,
          credentials: session.credentials,
          initialState,
          persistenceKey: PERSISTENCE_KEY,
        },
        identifier,
      );
    }

    return getOrCreateAdapter(
      statClashGame,
      {
        mode: 'local',
        initialState,
        persistenceKey: PERSISTENCE_KEY,
      },
      identifier,
    );
  }, [canUseMultiplayerFeatures, initialState, roomId, session]);

  return (
    <AdapterProvider adapter={adapter}>
      {children || <Outlet />}
    </AdapterProvider>
  );
}
