import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

// Lazy-load pages
const GameSetupPage = lazy(() => import('./pages/game-setup-page'));
const GamePlayPage = lazy(() => import('./pages/game-play-page'));

export default function GuessLogoRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GameSetupPage />} />
      <Route path="/game/room/:roomId" element={<GamePlayPage />} />
      <Route path="/game/:logoSet/:listId/:gridSize/:playerA/:playerB" element={<GamePlayPage />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
