import { useTranslation } from 'react-i18next'
import { useLocation } from 'wouter'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function LanguageToggle() {
  const { t, i18n } = useTranslation()
  const [location, navigate] = useLocation()
  const currentLocale = i18n.language

  const handleChange = (newLocale: string) => {
    // Proactively change the i18n language.
    i18n.changeLanguage(newLocale)

    // A more robust way to get the path without the locale prefix
    // 1. Split the path into an array of segments
    const pathSegments = location.split('/').filter(Boolean)
    // 2. Remove the first segment (the current language)
    const restOfPath = pathSegments.slice(1).join('/')

    // 3. Construct the new path with the new locale
    const newPath = `/${newLocale}/${restOfPath}`

    navigate(newPath)
  }

  return (
    <div>
      <Select onValueChange={handleChange} defaultValue={currentLocale}>
        <SelectTrigger className="text-right">
          <SelectValue placeholder={t('common.LanguageToggle_placeholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ar">{t('common.LanguageToggle_ar')}</SelectItem>
          <SelectItem value="en">{t('common.LanguageToggle_en')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default LanguageToggle
