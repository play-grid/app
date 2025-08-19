// src/components/LanguageRouter.tsx
import React, { useEffect, useLayoutEffect } from 'react' // Import useLayoutEffect
import { useTranslation } from 'react-i18next'
import { Router, useLocation } from 'wouter'
import i18n from './config'

interface LanguageRouterProps {
  children: React.ReactNode
}
const supported = i18n.options.supportedLngs || ['en', 'ar'] // Default to English and Arabic if not defined

export function LanguageRouter({ children }: LanguageRouterProps) {
  const [location, setLocation] = useLocation()
  const { i18n } = useTranslation()

  // This effect handles the language change based on the URL
  useEffect(() => {
    const pathSegments = location.split('/').filter(Boolean)
    const firstSegment = pathSegments[0]

    // If the path doesn't have a language prefix
    if (!firstSegment || !supported.includes(firstSegment)) {
      const lastLng = i18n.language
      const newPath = `/${lastLng}/${location.substring(1)}`
      setLocation(newPath, { replace: true })
    }
    else {
      // The path has a language prefix. Change the i18n language if different.
      if (firstSegment !== i18n.language) {
        i18n.changeLanguage(firstSegment)
      }
    }
  }, [location, i18n, setLocation])

  // Use useLayoutEffect to synchronously update the DOM's direction
  // This guarantees that the direction is correct before the browser paints.
  useLayoutEffect(() => {
    document.body.dir = i18n.dir()
  }, [i18n.dir()])

  const pathSegments = location.split('/').filter(Boolean)
  const firstSegment = pathSegments[0]

  if (!firstSegment || !supported.includes(firstSegment)) {
    return null
  }

  const basePath = `/${i18n.language}`

  return (
    <Router base={basePath}>
      {children}
    </Router>
  )
}
