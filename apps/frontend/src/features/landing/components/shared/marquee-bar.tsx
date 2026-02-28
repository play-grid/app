import * as Separator from '@radix-ui/react-separator';
import React from 'react';
import { MARQUEE_ITEMS } from '../../path-data';
import styles from './marquee-bar.module.css';

export const MarqueeBar: React.FC = () => {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className={styles.root} role="marquee" aria-label="Upcoming features">
      <Separator.Root decorative orientation="horizontal" className={styles.sep} />
      <div className={styles.track} aria-hidden="true">
        {items.map((item, i) => (
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
