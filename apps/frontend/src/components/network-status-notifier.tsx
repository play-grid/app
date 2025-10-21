import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useNetworkStatus } from '@/hooks/use-network-status';

export function NetworkStatusNotifier() {
  const { t, i18n } = useTranslation();
  const isOnline = useNetworkStatus();
  const toastId = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    // Dismiss existing toast
    if (toastId.current) {
      toast.dismiss(toastId.current);
      toastId.current = undefined;
    }

    // Show new toast only if offline
    if (!isOnline) {
      toastId.current = toast.error(t('common.network.offline'), {
        duration: Infinity,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, i18n.language]); // React to both status and language changes

  return null;
}
