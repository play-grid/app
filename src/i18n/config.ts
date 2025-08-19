import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

i18next
  .use(HttpBackend)
  .use(
    new LanguageDetector({
      // We don't need 'path' in the detector's order now
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }),
  )
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    ns: ['default'],
    defaultNS: 'default',
    backend: {
      loadPath: '/locales/{{lng}}.json',
    },
  })

export default i18next
