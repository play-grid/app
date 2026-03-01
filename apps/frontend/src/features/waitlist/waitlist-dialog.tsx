import * as Dialog from '@radix-ui/react-dialog';

import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Spinner } from '@/components/ui/spinner';

import styles from './waitlist-dialog.module.css';
import { joinWaitlist } from './waitlist-service';

interface WaitlistDialogProps {
  open: boolean;
  onClose: () => void;
}

export function WaitlistDialog({ open, onClose }: WaitlistDialogProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !validateEmail(email)) {
      setEmailError(t('landing.cta.waitlistDialog.error'));
      return;
    }

    setError('');
    setEmailError('');
    setIsLoading(true);

    try {
      await joinWaitlist(email);
      setSuccess(true);
      setEmail('');
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    }
    catch {
      setError(t('landing.cta.waitlistDialog.error'));
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setEmailError('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.root}>
          <div className={styles.content}>
            {success
              ? (
                  <div className={styles.success}>
                    <span className={styles.successIcon}>🎉</span>
                    <p className={styles.successMessage}>{t('landing.cta.waitlistDialog.success')}</p>
                  </div>
                )
              : (
                  <>
                    <Dialog.Title className={styles.title}>{t('landing.cta.waitlistDialog.title')}</Dialog.Title>
                    <p className={styles.subtitle}>{t('landing.cta.waitlistDialog.subtitle')}</p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                      <div>
                        <label htmlFor="email" className={styles.label}>
                          {t('landing.cta.waitlistDialog.email')}
                        </label>
                        <input
                          id="email"
                          type="email"
                          className={styles.input}
                          placeholder={t('landing.cta.waitlistDialog.emailPlaceholder')}
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>

                      {emailError && <div className={styles.error}>{emailError}</div>}
                      {error && <div className={styles.error}>{error}</div>}

                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={`${styles.button} ${styles.buttonOutline}`}
                          onClick={handleClose}
                          disabled={isLoading}
                        >
                          {t('landing.cta.waitlistDialog.close')}
                        </button>
                        <button
                          type="submit"
                          className={`${styles.button} ${styles.buttonPrimary}`}
                          disabled={isLoading}
                        >
                          {isLoading
                            ? <Spinner />
                            : t('landing.cta.waitlistDialog.submit')}
                        </button>
                      </div>
                    </form>
                  </>
                )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
