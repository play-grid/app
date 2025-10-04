import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ErrorBoundary from './context/error-boundry';
import Root from './root';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>

      <Root />
    </ErrorBoundary>
  </StrictMode>,
);
