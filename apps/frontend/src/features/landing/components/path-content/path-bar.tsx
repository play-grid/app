import type { PathData } from '../../path-data';
import * as Separator from '@radix-ui/react-separator';
import { useTranslation } from 'react-i18next';
import styles from './path-bar.module.css';

interface PathBarProps {
  data: PathData;
}

export const PathBar: React.FC<PathBarProps> = ({ data }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.root} role="status" aria-live="polite">
      <Separator.Root decorative orientation="horizontal" className={styles.sep} />
      <div className={styles.inner}>
        <span className={styles.label}>{t('landing.pathBar.nowViewing')}</span>
        <span className={styles.value}>{t(data.pathBarLabelKey)}</span>
      </div>
    </div>
  );
};
