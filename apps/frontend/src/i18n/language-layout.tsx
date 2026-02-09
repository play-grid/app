import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageLayoutProps {
  children: React.ReactNode;
}

export function LanguageLayout({ children }: LanguageLayoutProps) {
  const { i18n } = useTranslation();

  useLayoutEffect(() => {
    if (!i18n)
      return;

    document.documentElement.lang = i18n.language || 'en';
    const dir = typeof i18n.dir === 'function' ? i18n.dir() : 'ltr';
    document.documentElement.dir = dir;
  }, [i18n, i18n.language]);

  return <>{children}</>;
}
