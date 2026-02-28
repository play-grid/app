import type { PathData } from '../../path-data';
import * as Separator from '@radix-ui/react-separator';
import React from 'react';
import styles from './path-bar.module.css';

interface PathBarProps {
  data: PathData;
}

export const PathBar: React.FC<PathBarProps> = ({ data }) => (
  <div className={styles.root} role="status" aria-live="polite">
    <Separator.Root decorative orientation="horizontal" className={styles.sep} />
    <div className={styles.inner}>
      <span className={styles.label}>Now viewing:</span>
      <span className={styles.value}>{data.pathBarLabel}</span>
    </div>
  </div>
);
