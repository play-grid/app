import { lazy, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import NotFoundPage from '@/pages/not-found-page';
import { GameplayPage } from './pages/gameplay-page';
import { Step2HotseatPlayers } from './pages/lobby/hotseat/step-2-players';
import { Step5HotseatRounds } from './pages/lobby/hotseat/step-5-rounds';
import { Step6ReviewHotseat } from './pages/lobby/hotseat/step-6-review-hotseat';
import { Step1ModeSelection } from './pages/lobby/step-1-mode-selection';
import { Step2Category } from './pages/lobby/step-2-category';
import { Step3Difficulty } from './pages/lobby/step-3-difficulty';
import { Step4MetricType } from './pages/lobby/step-4-metric-type';
import { Step5ReviewSolo } from './pages/lobby/step-5-review-solo';
import { ResultsPage } from './pages/results-page';
import { StatClashLayout } from './stat-clash-layout';

const StatClashPage = lazy(() => import('./stat-clash-page'));

export function StatClashPageContent() {
  return (
    <StatClashLayout>
      <Suspense fallback={<StatClashPageSkeleton />}>
        <StatClashPage />
      </Suspense>
    </StatClashLayout>
  );
}

export function StatClashNotFound() {
  const location = useLocation();
  const lang = location.pathname.split('/')[1] || 'en';

  return (
    <StatClashLayout>
      <NotFoundPage backTo={`/${lang}/stat-clash`} />
    </StatClashLayout>
  );
}

export function StatClashLobbyRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Step1ModeSelection />} />
      <Route path="solo/*" element={<SoloRoutes />} />
      <Route path="hotseat/*" element={<HotseatRoutes />} />
    </Routes>
  );
}

function SoloRoutes() {
  return (
    <Routes>
      <Route path="/category" element={<Step2Category />} />
      <Route path="/difficulty" element={<Step3Difficulty />} />
      <Route path="/metric-type" element={<Step4MetricType />} />
      <Route path="/review" element={<Step5ReviewSolo />} />
    </Routes>
  );
}

function HotseatRoutes() {
  return (
    <Routes>
      <Route path="/players" element={<Step2HotseatPlayers />} />
      <Route path="/category" element={<Step2Category />} />
      <Route path="/difficulty" element={<Step3Difficulty />} />
      <Route path="/rounds" element={<Step5HotseatRounds />} />
      <Route path="/metric-type" element={<Step4MetricType />} />
      <Route path="/review" element={<Step6ReviewHotseat />} />
    </Routes>
  );
}

export function StatClashGameRoutes() {
  return (
    <Routes>
      <Route path="/gameplay" element={<GameplayPage />} />
      <Route path="/results" element={<ResultsPage />} />
    </Routes>
  );
}

function StatClashPageSkeleton() {
  return (
    <div className="stat-clash-shell min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto max-w-5xl animate-pulse space-y-4">
        <div className="h-10 w-32 rounded bg-muted" />
        <div className="h-14 w-56 rounded bg-muted" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-72 rounded bg-muted" />
          <div className="h-72 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
