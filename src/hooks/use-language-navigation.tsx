import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { addLanguageToPath, removeLanguageFromPath } from '@/utils/language-utils'

export function useLanguageNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { i18n } = useTranslation()

  const navigateWithLanguage = (path: string, options?: { replace?: boolean }) => {
    const pathWithLanguage = addLanguageToPath(path, i18n.language as any)
    navigate(pathWithLanguage, options)
  }

  const getCurrentPathWithoutLanguage = () => {
    return removeLanguageFromPath(location.pathname)
  }

  const changeLanguage = (lng: string) => {
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng)
    }
    const pathWithoutLang = getCurrentPathWithoutLanguage()
    const newPath = addLanguageToPath(pathWithoutLang, lng as any)
    navigate(newPath, { replace: true })
  }

  return {
    navigate: navigateWithLanguage,
    getCurrentPathWithoutLanguage,
    currentPath: location.pathname,
    currentLanguage: i18n.language,
    changeLanguage,
  }
}
