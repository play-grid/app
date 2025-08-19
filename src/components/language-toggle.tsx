import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function LanguageToggle({ currentLocale, onChange }: { currentLocale: string, onChange: (lng: string) => void }) {
  const { t } = useTranslation()
  return (
    <div>
      <Select onValueChange={onChange} value={currentLocale}>
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
