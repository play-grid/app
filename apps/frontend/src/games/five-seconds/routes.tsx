import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import NotFoundPage from '@/pages/not-found-page';
import { FiveSecondsLayout } from './five-seconds-layout';
import { FiveSecondsSkeleton } from './components/five-seconds-skeleton';

const FiveSecondsPage = lazy(() => import('./five-seconds-page'));

export function FiveSecondsPageContent() {
  const location = useLocation();
  const lang = location.pathname.split('/')[1];

  return (
    <FiveSecondsLayout>
      <Suspense fallback={<FiveSecondsSkeleton />}>
        <FiveSecondsPage />
      </Suspense>
    </FiveSecondsLayout>
  );
}

export function FiveSecondsNotFound() {
  const location = useLocation();
  const lang = location.pathname.split('/')[1];

  return (
    <FiveSecondsLayout>
      <NotFoundPage
        titleKey="notFound.fiveSeconds.title"
        messageKey="notFound.fiveSeconds.message"
        backTo={`/${lang}/five-seconds`}
        backToTextKey="notFound.fiveSeconds.backTo"
      />
    </FiveSecondsLayout>
  );
}
