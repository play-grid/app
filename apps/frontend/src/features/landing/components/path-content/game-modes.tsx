import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GAME_MODE_KEYS } from '../../path-data';
import styles from './game-modes.module.css';

gsap.registerPlugin(ScrollTrigger);

export const GameModes: React.FC = () => {
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
  }, { scope: rootRef });

  const modes = GAME_MODE_KEYS.map(key => ({
    ...t(`landing.gameModes.modes.${key}`, { returnObjects: true }) as {
      num: string;
      title: string;
      desc: string;
      tag: string;
    },
    icon: ['🧠', '🎭', '📖', '🧩'][Number.parseInt(key, 10)],
  }));

  return (
    <section
      ref={rootRef}
      className={styles.root}
      aria-labelledby="modes-heading"
    >
      <p className="section-tag">{t('landing.gameModes.sectionTag')}</p>
      <h2 id="modes-heading" className="section-title">
        {t('landing.gameModes.sectionTitle')}
      </h2>

      <ul className={styles.grid} role="list">
        {modes.map((m, i) => (
          <li key={i} className={styles.card}>
            <span className={styles.num} aria-hidden="true">{m.num}</span>
            <span className={styles.icon} role="img" aria-label={m.title}>{m.icon}</span>
            <h3 className={styles.title}>{m.title}</h3>
            <p className={styles.desc}>{m.desc}</p>
            <span className={styles.tag}>{m.tag}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
