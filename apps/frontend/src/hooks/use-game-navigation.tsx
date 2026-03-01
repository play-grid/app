import type { SupportedLanguage } from '@playgrid/shared/types';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { addLanguageToPath, removeLanguageFromPath } from '../utils/language-utils';

export function useGameNavigation(defaultGameId: string = 'guess-logo') {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  const navigateWithGameAndLanguage = (
    path: string,
    options: { replace?: boolean; gameId?: string } = {},
  ) => {
    const gameId = options.gameId || defaultGameId;
    const gamePath = `/play/${gameId}${path.startsWith('/') ? path : `/${path}`}`;
    const pathWithLanguage = addLanguageToPath(gamePath, i18n.language as any);
    navigate(pathWithLanguage, options);
  };

  const getCurrentPathWithoutGameAndLanguage = () => {
    const withoutLang = removeLanguageFromPath(location.pathname);
    return withoutLang.replace(`/`, '');
  };

  const changeLanguage = (lng: string) => {
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng);
    }
    const pathWithoutLang = getCurrentPathWithoutGameAndLanguage();
    const newPath = addLanguageToPath(`/${pathWithoutLang}`, lng as any);
    navigate(newPath, { replace: true });
  };

  return {
    navigate: navigateWithGameAndLanguage,
    getCurrentPathWithoutGameAndLanguage,
    currentPath: location.pathname,
    currentLanguage: i18n.language as SupportedLanguage,
    changeLanguage,
  };
}
