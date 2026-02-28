import * as Separator from '@radix-ui/react-separator';
import { useTranslation } from 'react-i18next';
import styles from './footer.module.css';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className={styles.root}>
      <Separator.Root decorative orientation="horizontal" className={styles.sep} />
      <div className={styles.inner}>
        <div className={styles.logo}>
          {t('landing.footer.logo')}
        </div>
        <p className={styles.copy}>{t('landing.footer.copy')}</p>
        <p className={styles.arabic} lang="ar">{t('landing.footer.arabic')}</p>
      </div>
    </footer>
  );
}
