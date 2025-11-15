import { lazy } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import NotFoundPage from '@/pages/not-found-page';

// Lazy-load pages
const GameSetupPage = lazy(() => import('./pages/game-setup-page'));
const GamePlayPage = lazy(() => import('./pages/game-play-page'));

export default function GuessLogoRoutes() {
  const location = useLocation();
  const lang = location.pathname.split('/')[1];
  return (
    <Routes>
      <Route path="/" element={<GameSetupPage />} />
      <Route path="/game/room/:roomId" element={<GamePlayPage />} />
      <Route path="/game/:logoSet/:listId/:gridSize/:playerA/:playerB" element={<GamePlayPage />} />
      <Route
        path="*"
        element={(
          <NotFoundPage
            titleKey="notFound.guessLogo.title"
            messageKey="notFound.guessLogo.message"
            backTo={`/${lang}/guess-logo`}
            backToTextKey="notFound.guessLogo.backTo"
          />
        )}
      />
    </Routes>
  );
}
