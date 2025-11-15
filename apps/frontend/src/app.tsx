import { SUPPORTED_LANGUAGES } from '@guess-logo/shared/types';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from './components/navbar';
import { FiveSecondsSkeleton } from './games/five-seconds/components/five-seconds-skeleton';
import { GuessLogoSkeleton } from './games/guess-logo/components/guess-logo-skeleton';
import { LanguageLayout } from './i18n/language-layout';
import { LanguageRouter } from './i18n/language-router';
import AboutPage from './pages/about-page';
import AuthPage from './pages/auth/auth-page';
import HomePage from './pages/home-page';
import NotFoundPage from './pages/not-found-page';

// Lazy-loaded game routes
const GuessLogoRoutes = lazy(() => import('./games/guess-logo/routes'));
const FiveSecondsRoutes = lazy(() => import('./games/five-seconds/routes'));

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
        </Routes>
      </LanguageRouter>
    </LanguageLayout>
  );
}

// function NeverResolve() {
//   throw new Promise(() => {});
// }

export function LanguageRoutes() {
  const location = useLocation();

  const showNavbar
    = !location.pathname.includes('/guess-logo') && !location.pathname.includes('/five-seconds');
  return (
    <>
      {showNavbar && <Navbar className="mb-3" />}
      <Routes>
        {/* Home page for language prefix */}

        <Route path="/" element={<HomePage />} />

        {/* About page */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/auth/:pathname" element={<AuthPage />} />

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

        {/* Fallback: Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
