import type { ReactNode } from 'react';
import type z from 'zod';
import { difficultySchema, fiveSecondsGame, FiveSecondsGameStateSchema } from '@playgrid/five-seconds';
import { AdapterProvider } from '@playgrid/game-core';
import { useMemo } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { useRoomSession } from '@/features/room/room-store';
import { useGameMode } from '@/hooks/use-game-mode';
import { getOrCreateAdapter } from '@/lib/adapter-instance';
import './index.css';

export function FiveSecondsLayout({ children }: { children?: ReactNode }) {
  const [searchParams] = useSearchParams();
  const { session } = useRoomSession();
  const { roomId, canUseMultiplayerFeatures } = useGameMode();
  const urlDifficulty = searchParams.get('difficulty');
  const urlCategories = searchParams.get('categories');

  const validatedInitialState = useMemo(() => {
    const baseState = session?.initialGameState || fiveSecondsGame.initialState;

    const initialSettingsFromUrl: Partial<
      typeof fiveSecondsGame.initialState.settings
    > = {};

    if (urlDifficulty) {
      const parsed = difficultySchema.safeParse(urlDifficulty);
      if (parsed.success) {
        initialSettingsFromUrl.difficulty = parsed.data;
      }
    }

    if (urlCategories) {
      const categoryIds = urlCategories.split(',').filter(Boolean);
      if (categoryIds.length > 0) {
        initialSettingsFromUrl.categoryIds = categoryIds;
      }
    }

    const initialStateWithUrlSettings = {
      ...baseState,
      settings: {
        ...baseState.settings,
        ...initialSettingsFromUrl,
      },
    };
    return FiveSecondsGameStateSchema.parse(initialStateWithUrlSettings);
  }, [urlDifficulty, urlCategories, session?.initialGameState]);

  const adapter = useMemo(() => {
    const identifier = canUseMultiplayerFeatures ? `multiplayer-${roomId}` : 'local';

    if (canUseMultiplayerFeatures && session?.playerId && session?.credentials) {
      return getOrCreateAdapter(
        fiveSecondsGame,
        {
          mode: 'multiplayer',
          roomId: roomId!,
          playerId: session.playerId,
          credentials: session.credentials,
          initialState: validatedInitialState,
          persistenceKey: 'five-seconds-game:v1',
        },
        identifier,
      );
    }

    // Fallback to local mode
    return getOrCreateAdapter(
      fiveSecondsGame,
      {
        mode: 'local',
        initialState: validatedInitialState,
        persistenceKey: 'five-seconds-game:v1',
        partialize: (state: { state: z.infer<typeof FiveSecondsGameStateSchema> }) => {
          const { questionError, turnTimerEndsAt, ...stateToPersist } = state.state;
          return { state: stateToPersist };
        },
      },
      identifier,
    );
  }, [roomId, canUseMultiplayerFeatures, session, validatedInitialState]);

  return (
    <AdapterProvider adapter={adapter}>
      {children || <Outlet />}
    </AdapterProvider>
  );
}
