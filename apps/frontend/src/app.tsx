import { SUPPORTED_LANGUAGES } from '@guess-logo/shared/types';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LanguageLayout } from './i18n/language-layout';
import { LanguageRouter } from './i18n/language-router';
import HomePage from './pages/home-page';

// Lazy-loaded game routes
const GuessLogoRoutes = lazy(() => import('./games/guess-logo/routes'));
// Add more games here as needed

export default function App() {
  return (
    <LanguageLayout>
      <LanguageRouter>
        <Routes>
          {/* Root route for home page */}
          <Route path="/" element={<HomePage />} />

          {/* Language-prefixed routes */}
          {SUPPORTED_LANGUAGES.map(lang => (
            <Route key={lang} path={`/${lang}/*`} element={<LanguageRoutes />} />
          ))}

          {/* Fallback: redirect to default language or home */}
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

        {/* Game-specific routes */}
        <Route path="/guess-logo/*" element={<GuessLogoRoutes />} />
        {/* Add more game routes here */}

        {/* Fallback: redirect to language home */}
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </Suspense>
  );
}
