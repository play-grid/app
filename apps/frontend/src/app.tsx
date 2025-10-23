import { SUPPORTED_LANGUAGES } from '@guess-logo/shared/types';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { FiveSecondsSkeleton } from './games/five-seconds/components/five-seconds-skeleton';
import { GuessLogoSkeleton } from './games/guess-logo/components/guess-logo-skeleton';
import { LanguageLayout } from './i18n/language-layout';
import { LanguageRouter } from './i18n/language-router';
import AboutPage from './pages/about-page';
import HomePage from './pages/home-page';

// Lazy-loaded game routes
const GuessLogoRoutes = lazy(() => import('./games/guess-logo/routes'));
const FiveSecondsRoutes = lazy(() => import('./games/five-seconds/routes'));
// Add more games here as needed

export default function App() {
  return (
    <LanguageLayout>
      <LanguageRouter>
        <Routes>
          {/* Root route - redirect to default language */}
          <Route path="/" element={<Navigate to="/en" replace />} />

          {/* Language-prefixed routes */}
          {SUPPORTED_LANGUAGES.map(lang => (
            <Route key={lang} path={`/${lang}/*`} element={<LanguageRoutes />} />
          ))}

          {/* Fallback: redirect to default language */}
          <Route path="/*" element={<Navigate to="/en" replace />} />
        </Routes>
      </LanguageRouter>
    </LanguageLayout>
  );
}

// function NeverResolve() {
//   throw new Promise(() => {});
// }

export function LanguageRoutes() {
  return (
    <Routes>
      {/* Home page for language prefix */}
      <Route path="/" element={<HomePage />} />

      {/* About page */}
      <Route path="/about" element={<AboutPage />} />

      {/* Game-specific routes */}
      <Route
        path="/guess-logo/*"
        element={(
          <Suspense fallback={<GuessLogoSkeleton />}>
            <GuessLogoRoutes />
          </Suspense>
        )}
      />
      <Route
        path="/five-seconds/*"
        element={(
          <Suspense fallback={<FiveSecondsSkeleton />}>
            <FiveSecondsRoutes />
          </Suspense>
        )}
      />

      {/* Fallback: redirect to language home */}
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
