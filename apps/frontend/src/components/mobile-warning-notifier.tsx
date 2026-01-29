import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function MobileWarningNotifier() {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 1024);
  const hasShownToastRef = useRef<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        hasShownToastRef.current = false;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (isMobile && !hasShownToastRef.current) {
      toast.warning(t('common.mobileWarning'), {
        duration: Infinity,
        action: {
          label: t('common.dismiss'),
          onClick: () => {
            hasShownToastRef.current = true;
          },
        },
      });
      hasShownToastRef.current = true;
    }
  }, [isMobile, t]);

  return null;
}
