import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Root from './app-providers';
import ErrorBoundary from './context/error-boundry';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </StrictMode>,
);
