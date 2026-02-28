import * as Separator from '@radix-ui/react-separator';
import React from 'react';
import styles from './footer.module.css';

export function Footer() {
  return (
    <footer className={styles.root}>
      <Separator.Root decorative orientation="horizontal" className={styles.sep} />
      <div className={styles.inner}>
        <div className={styles.logo}>
          Play
          <em>Grid</em>
        </div>
        <p className={styles.copy}>© 2025 PlayGrid. All rights reserved.</p>
        <p className={styles.arabic} lang="ar">العب معاً</p>
      </div>
    </footer>
  );
}
