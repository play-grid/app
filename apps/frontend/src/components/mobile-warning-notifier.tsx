import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getUserPreferences, setUserPreferences } from '@/lib/user-preferences';

export function MobileWarningNotifier() {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 1024);
  const [hasDismissed, setHasDismissed] = useState<boolean>(() => {
    const prefs = getUserPreferences();
    return prefs.mobileWarningDismissed ?? false;
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (isMobile && !hasDismissed) {
      toast.warning(t('common.mobileWarning'), {
        duration: Infinity,
        actionButtonStyle: { backgroundColor: '#F3CF58' },
        action: {
          label: t('common.dismiss'),
          onClick: () => {
            setUserPreferences('mobileWarningDismissed', true);
            setHasDismissed(true);
          },
        },
      });
    }
  }, [isMobile, hasDismissed, t]);

  return null;
}
