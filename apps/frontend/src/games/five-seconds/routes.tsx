import { lazy } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import NotFoundPage from '@/pages/not-found-page';

const FiveSecondsPage = lazy(() => import('./five-seconds-page'));

export default function FiveSecondsRoutes() {
  const location = useLocation();
  const lang = location.pathname.split('/')[1];
  return (
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
  );
}
