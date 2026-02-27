import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import NotFoundPage from '@/pages/not-found-page';
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
