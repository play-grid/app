import { Suspense, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { i18nInitPromise } from './config';

interface I18nReadyProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function I18nReadyProvider({ children, fallback }: I18nReadyProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    i18nInitPromise
      .then(() => {
        setIsReady(true);
      })
      .catch((error) => {
        console.error('Failed to initialize i18n:', error);
        setIsReady(true);
      });
  }, []);

  if (!isReady) {
    return fallback || null;
  }

  return <Suspense fallback={fallback || null}>{children}</Suspense>;
}
