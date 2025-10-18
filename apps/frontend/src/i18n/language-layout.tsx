import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageLayoutProps {
  children: React.ReactNode;
}

export function LanguageLayout({ children }: LanguageLayoutProps) {
  const { i18n } = useTranslation();

  useLayoutEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.dir();
  }, [i18n, i18n.language]);

  return <>{children}</>;
}
