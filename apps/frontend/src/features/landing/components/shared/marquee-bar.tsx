import * as Separator from '@radix-ui/react-separator';
import { useTranslation } from 'react-i18next';
import { MARQUEE_KEY } from '../../path-data';
import styles from './marquee-bar.module.css';

export function MarqueeBar() {
  const { t } = useTranslation();
  const items = t(MARQUEE_KEY, { returnObjects: true }) as string[];
  const doubledItems = [...items, ...items];

  return (
    <div className={styles.root} role="marquee" aria-label={t('landing.marquee.ariaLabel')}>
      <Separator.Root decorative orientation="horizontal" className={styles.sep} />
      <div className={styles.track} aria-hidden="true">
        {doubledItems.map((item, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={`${item}-${i}`} className={styles.item}>
            {item}
            <span className={styles.dot} />
          </span>
        ))}
      </div>
    </div>
  );
};
