import React, { useEffect, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import i18n from './config';

interface LanguageRouterProps {
  children: React.ReactNode;
}

const supported = i18n.options.supportedLngs?.filter(lang => lang !== 'cimode') || ['en', 'ar'];

export function LanguageRouter({ children }: LanguageRouterProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n: i18nInstance } = useTranslation();

  // This effect handles the language change based on the URL
  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const firstSegment = pathSegments[0];

    if (!firstSegment || !supported.includes(firstSegment)) {
      // No language prefix in the URL → redirect to use current i18n.language
      const currentLang = i18nInstance.language;
      const newPath = `/${currentLang}${location.pathname === '/' ? '' : location.pathname}`;
      const fullUrl = `${newPath}${location.search}${location.hash}`;
      navigate(fullUrl, { replace: true });
    }
    else if (firstSegment !== i18nInstance.language) {
      // URL has a language prefix different from current → update i18n language
      i18nInstance.changeLanguage(firstSegment);
    }
  }, [location.pathname, location.search, location.hash, i18nInstance, navigate]);

  // Use useLayoutEffect to synchronously update the DOM's direction
  useLayoutEffect(() => {
    document.body.dir = i18nInstance.dir();
    // Also set the html lang attribute for accessibility
    document.documentElement.lang = i18nInstance.language;
  }, [i18nInstance, i18nInstance.language]);

  // Don't render children until we have a valid language in the URL
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];

  if (!firstSegment || !supported.includes(firstSegment)) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
