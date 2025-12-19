import { difficultySchema, fiveSecondsGame, FiveSecondsGameStateSchema } from '@guess-logo/five-seconds';
import { AdapterProvider } from '@guess-logo/game-core';
import { useEffect, useMemo } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { useRoomSession } from '@/features/room/room-store';
import { useIsDarkTheme } from '@/hooks/use-is-dark-theme';
import { destroyAdapter, getOrCreateAdapter } from '@/lib/adapter-instance';
import './index.css';

export function FiveSecondsLayout() {
  const [searchParams] = useSearchParams();
  const { session } = useRoomSession();

  const roomId = searchParams.get('room');
  const mode = (roomId && searchParams.get('mode') === 'multiplayer') ? 'multiplayer' : 'local';

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
    const hasValidSession = session?.roomId === roomId && session?.credentials;
    const isMultiplayer = mode === 'multiplayer' && roomId && hasValidSession;

    const identifier = isMultiplayer ? `multiplayer-${roomId}` : 'local';

    if (isMultiplayer) {
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
      },
      identifier,
    );
  }, [roomId, mode, session, validatedInitialState]);

  useEffect(() => {
    return () => {
      destroyAdapter();
    };
  }, []);

  const isDark = useIsDarkTheme();

  useEffect(() => {
    const themeClasses = ['fiveSeconds'];
    if (isDark) {
      themeClasses.push('dark');
    }
    document.body.classList.add(...themeClasses);
    return () => {
      document.body.classList.remove(...themeClasses);
    };
  }, [isDark]);

  return (
    <AdapterProvider adapter={adapter}>
      <Outlet />
    </AdapterProvider>
  );
}
