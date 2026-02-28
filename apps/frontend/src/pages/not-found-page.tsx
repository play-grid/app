import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import styles from './not-found-page.module.css';
import '@/features/landing/styles/landing.css';

interface NotFoundPageProps {
  titleKey?: string;
  messageKey?: string;
  backTo?: string;
  backToTextKey?: string;
}

export default function NotFoundPage({
  titleKey = 'notFound.global.title',
  messageKey = 'notFound.global.message',
  backTo = '/play',
  backToTextKey = 'notFound.global.backTo',
}: NotFoundPageProps) {
  const { t } = useTranslation();

  return (
    <main className={styles.root}>
      <div className="grid-bg" aria-hidden="true" />

      <div className={styles.content}>
        <h1 className={styles.code}>{t(titleKey)}</h1>
        <p className={styles.message}>{t(messageKey)}</p>
        <Link to={backTo} className={styles.cta}>
          {t(backToTextKey)}
        </Link>
      </div>
    </main>
  );
}
