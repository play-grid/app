import { difficultySchema, fiveSecondsGame, FiveSecondsGameStateSchema } from '@guess-logo/five-seconds';
import { AdapterProvider } from '@guess-logo/game-core';
import { lazy, useMemo } from 'react';
import { Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { createGameAdapter } from '@/lib/create-game-adapter';
import NotFoundPage from '@/pages/not-found-page';

const FiveSecondsPage = lazy(() => import('./five-seconds-page'));

export default function FiveSecondsRoutes() {
  const location = useLocation();
  const lang = location.pathname.split('/')[1];
  const [searchParams] = useSearchParams();

  // Determine mode: local or multiplayer
  const mode = searchParams.get('mode') || 'local';
  const roomId = searchParams.get('room');

  // Get URL parameters
  const urlDifficulty = searchParams.get('difficulty');
  const urlCategories = searchParams.get('categories');

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
    ...fiveSecondsGame.initialState,
    settings: {
      ...fiveSecondsGame.initialState.settings,
      ...initialSettingsFromUrl,
    },
  };

  const validatedInitialState = FiveSecondsGameStateSchema.parse(
    initialStateWithUrlSettings,
  );

  const adapter = useMemo(() => {
    return createGameAdapter(fiveSecondsGame, {
      mode: mode as 'local' | 'multiplayer',
      roomId: roomId ?? undefined,
      initialState: validatedInitialState,
    });
  }, [mode, roomId, validatedInitialState]);

  return (
    <AdapterProvider adapter={adapter}>
      <Routes>
        <Route path="/" element={<FiveSecondsPage />} />
        <Route
          path="*"
          element={(
            <NotFoundPage
              titleKey="notFound.fiveSeconds.title"
              messageKey="notFound.fiveSeconds.message"
              backTo={`/${lang}/five-seconds`}
              backToTextKey="notFound.fiveSeconds.backTo"
            />
          )}
        />
      </Routes>
    </AdapterProvider>
  );
}
