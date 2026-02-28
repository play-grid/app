import type { PathData } from '../../path-data';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './features.module.css';

gsap.registerPlugin(ScrollTrigger);

interface FeaturesProps {
  data: PathData;
}

export function Features({ data }: FeaturesProps) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const cards = rootRef.current?.querySelectorAll(`.${styles.card}`);
    if (!cards)
      return;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 72%' },
      },
    );
  }, { scope: rootRef, dependencies: [data.key] });

  const features = t(data.featuresKey, { returnObjects: true }) as Array<{
    icon: string;
    name: string;
    desc: string;
  }>;

  return (
    <section
      ref={rootRef}
      className={styles.root}
      aria-labelledby="feat-heading"
    >
      <p className="section-tag">{t(data.featTagKey)}</p>
      <h2 id="feat-heading" className="section-title">
        {t(data.featTitleKey)}
      </h2>

      <ul className={styles.grid} role="list">
        {features.map((f, i) => (
          <li
            key={f.name}
            className={styles.card}
            style={i === features.length - 1 ? { borderRight: 'none' } : undefined}
          >
            <div className={styles.icon} aria-hidden="true">{f.icon}</div>
            <h3 className={styles.name}>{f.name}</h3>
            <p className={styles.desc}>{f.desc}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};
