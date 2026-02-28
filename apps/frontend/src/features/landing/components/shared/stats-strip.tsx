import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GAME_MODE_STATS, STATS_KEYS } from '../../path-data';
import styles from './stats-strip.module.css';

gsap.registerPlugin(ScrollTrigger);

export function StatsStrip() {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDListElement>(null);

  useGSAP(() => {
    const items = rootRef.current?.querySelectorAll(`.${styles.stat}`);
    if (!items)
      return;
    gsap.fromTo(
      items,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.07,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top 82%',
        },
      },
    );
  }, { scope: rootRef });

  return (
    <dl ref={rootRef} className={styles.root}>
      {STATS_KEYS.map((key, index) => {
        const { num, unit } = GAME_MODE_STATS[index];
        const label = t(key);
        return (
          <div key={key} className={styles.stat}>
            <dt className={styles.label}>{label}</dt>
            <dd className={styles.number}>
              {num}
              {unit && <span className={styles.unit}>{unit}</span>}
            </dd>
          </div>
        );
      })}
    </dl>
  );
};
