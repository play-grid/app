import type { SupportedLanguage } from '@guess-logo/shared/types';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGameNavigation } from '@/hooks/use-game-navigation';

interface LanguageToggleProps {
  currentLocale?: string;
  onChange?: (lng: string) => void;
  // For compatibility with existing usage patterns
}

function LanguageToggle({ currentLocale, onChange }: LanguageToggleProps) {
  const { t } = useTranslation();
  const { changeLanguage, currentLanguage } = useGameNavigation();

  // Use currentLanguage from hook if currentLocale is not provided
  const activeLanguage = currentLocale || currentLanguage;

  const handleLanguageChange = (lng: string) => {
    if (onChange) {
      // If onChange is provided, use the existing pattern (for pending changes)
      onChange(lng);
    }
    else {
      // Otherwise, change language immediately via URL navigation
      changeLanguage(lng as SupportedLanguage);
    }
  };

  return (
    <div>
      <Select onValueChange={handleLanguageChange} value={activeLanguage}>
        <SelectTrigger className="text-right" data-testid="language-toggle-trigger">
          <SelectValue placeholder={t('common.LanguageToggle_placeholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ar">{t('common.LanguageToggle_ar')}</SelectItem>
          <SelectItem value="en">{t('common.LanguageToggle_en')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default LanguageToggle;
