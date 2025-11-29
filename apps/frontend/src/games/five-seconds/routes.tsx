import type { FiveSecondsAction, FiveSecondsGameState } from '@guess-logo/five-seconds/logic';
import { fiveSecondsGame } from '@guess-logo/five-seconds/definition';
import { FiveSecondsGameStateSchema } from '@guess-logo/five-seconds/logic';
import { difficultySchema } from '@guess-logo/five-seconds/schema';
import {
  AdapterProvider,
  composeReducers,
  createLocalAdapter,
  gameReducer,
} from '@guess-logo/game-core';
import { lazy, useMemo } from 'react';
import { Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import NotFoundPage from '@/pages/not-found-page';

const FiveSecondsPage = lazy(() => import('./five-seconds-page'));

export default function FiveSecondsRoutes() {
  const location = useLocation();
  const lang = location.pathname.split('/')[1];
  const [searchParams] = useSearchParams();

  const adapter = useMemo(() => {
    const composedReducer = composeReducers<
      FiveSecondsGameState,
      FiveSecondsAction
    >(
      fiveSecondsGame.reducer as (state: FiveSecondsGameState, action: FiveSecondsAction) => FiveSecondsGameState,
      gameReducer as any,
    );

    // Read settings from URL on initial load
    const urlDifficulty = searchParams.get('difficulty');
    const urlCategories = searchParams.get('categories');

    const initialSettingsFromUrl: Partial<
      (typeof fiveSecondsGame.initialState)['settings']
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

    return createLocalAdapter(
      FiveSecondsGameStateSchema.parse(initialStateWithUrlSettings),
      composedReducer,
    );
  }, [searchParams]);

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
