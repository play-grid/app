import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { addLanguageToPath, getLanguageFromPath } from '@/utils/language-utils'

export function LanguageRedirect() {
  const navigate = useNavigate()
  const location = useLocation()
  const { i18n } = useTranslation()

  useEffect(() => {
    const currentLangInPath = getLanguageFromPath(location.pathname)

    if (!currentLangInPath) {
      // No language in path, redirect to current i18n language
      const newPath = addLanguageToPath(location.pathname, i18n.language as any)
      navigate(newPath + location.search + location.hash, { replace: true })
    }
    else if (currentLangInPath !== i18n.language) {
      // Language in path doesn't match current i18n language, update i18n
      i18n.changeLanguage(currentLangInPath)
    }
  }, [location.pathname, i18n.language, navigate, i18n])

  return null
}
