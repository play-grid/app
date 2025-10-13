import { SUPPORTED_LANGUAGES } from '@guess-logo/shared/types';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
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

function LanguageRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Home page for language prefix */}
        <Route path="/" element={<HomePage />} />

        {/* About page */}
        <Route path="/about" element={<AboutPage />} />

        {/* Game-specific routes */}
        <Route path="/guess-logo/*" element={<GuessLogoRoutes />} />
        <Route path="/five-seconds/*" element={<FiveSecondsRoutes />} />
        {/* Add more game routes here */}

        {/* Fallback: redirect to language home */}
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </Suspense>
  );
}
