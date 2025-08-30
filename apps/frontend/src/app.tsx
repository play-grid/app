import { Navigate, Route, Routes } from 'react-router-dom';
import { GamePlayPage } from '@/pages/game-play-page';
import { GameSetupPage } from '@/pages/game-setup-page';
import { LanguageLayout } from './i18n/language-layout';
import { LanguageRouter } from './i18n/language-router';
import { SUPPORTED_LANGUAGES } from './utils/language-utils';

export default function App() {
  return (
    <LanguageLayout>
      <LanguageRouter>
        <Routes>
          {/* Routes with language prefix */}
          {SUPPORTED_LANGUAGES.map(lang => (
            <Route key={lang} path={`/${lang}/*`} element={<LanguageRoutes />} />
          ))}

          {/* Fallback route - LanguageRouter will handle redirects */}
          <Route path="/*" element={<div />} />
        </Routes>
      </LanguageRouter>
    </LanguageLayout>
  );
}

function LanguageRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GameSetupPage />} />
      <Route path="/game/:logoSet/:gridSize/:playerA/:playerB" element={<GamePlayPage />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
