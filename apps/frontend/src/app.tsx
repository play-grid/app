import { SUPPORTED_LANGUAGES } from '@guess-logo/shared/types';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { FiveSecondsRoute } from '@/games/five-seconds/five-seconds-route';
import { FiveSecondsNotFound, FiveSecondsPageContent } from '@/games/five-seconds/routes';
import { GuessLogoSkeleton } from '@/games/guess-logo/components/guess-logo-skeleton';
import { StatClashNotFound, StatClashPageContent } from '@/games/stat-clash/routes';
import { StatClashRoute } from '@/games/stat-clash/stat-clash-route';
import { Footer } from './components/footer';
import { Navbar } from './components/navbar';
import ErrorBoundary from './context/error-boundry';
import { LanguageLayout } from './i18n/language-layout';
import { LanguageRouter } from './i18n/language-router';
import AboutPage from './pages/about-page';
import AccountPage from './pages/auth/account-page';
import AuthPage from './pages/auth/auth-page';
import HomePage from './pages/home-page';
import LegalPage from './pages/legal-page';
import NotFoundPage from './pages/not-found-page';
import PrivacyPage from './pages/privacy-page';

// Lazy-loaded game routes
const GuessLogoRoutes = lazy(() => import('./games/guess-logo/routes'));

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

  const isNavAndFooterVisible = !location.pathname.includes('/guess-logo')
    && !location.pathname.includes('/five-seconds')
    && !location.pathname.includes('/stat-clash');
  return (
    <>
      {isNavAndFooterVisible && <Navbar className="mb-3" />}
      <ErrorBoundary>
        <Routes>
          {/* Home page for language prefix */}
          <Route path="/" element={<HomePage />} />

          {/* About page */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/:pathname" element={<AuthPage />} />
          <Route path="/account/:pathname" element={<AccountPage />} />

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
            element={<FiveSecondsRoute />}
          >
            <Route index element={<FiveSecondsPageContent />} />
            <Route path="*" element={<FiveSecondsNotFound />} />
          </Route>
          <Route
            path="/stat-clash/*"
            element={<StatClashRoute />}
          >
            <Route index element={<StatClashPageContent />} />
            <Route path="lobby/*" element={<StatClashPageContent />} />
            <Route path="gameplay" element={<StatClashPageContent />} />
            <Route path="results" element={<StatClashPageContent />} />
            <Route path="*" element={<StatClashNotFound />} />
          </Route>

          {/* Fallback: Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
      {isNavAndFooterVisible && <Footer />}
    </>
  );
}
