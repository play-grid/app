import { difficultySchema, fiveSecondsGame, FiveSecondsGameStateSchema } from '@guess-logo/five-seconds';
import { AdapterProvider } from '@guess-logo/game-core';
import { lazy, useEffect, useMemo } from 'react';
import { Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { destroyAdapter, getOrCreateAdapter } from '@/lib/adapter-instance';
import NotFoundPage from '@/pages/not-found-page';

const FiveSecondsPage = lazy(() => import('./five-seconds-page'));

export default function FiveSecondsRoutes() {
  const location = useLocation();
  const lang = location.pathname.split('/')[1];
  const [searchParams] = useSearchParams();

  const mode = searchParams.get('mode') || 'local';
  const roomId = searchParams.get('room');

  const urlDifficulty = searchParams.get('difficulty');
  const urlCategories = searchParams.get('categories');

  const validatedInitialState = useMemo(() => {
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
    return FiveSecondsGameStateSchema.parse(initialStateWithUrlSettings);
  }, [urlDifficulty, urlCategories]);

  const adapter = useMemo(() => {
    return getOrCreateAdapter(fiveSecondsGame, {
      mode: mode as 'local' | 'multiplayer',
      roomId: roomId ?? undefined,
      initialState: validatedInitialState,
      persistenceKey: 'five-seconds-game:v1',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, mode]);

  useEffect(() => {
    return () => {
      destroyAdapter();
    };
  }, []);

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
