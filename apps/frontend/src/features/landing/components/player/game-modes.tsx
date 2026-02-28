import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGames } from '@/hooks/use-games';
import styles from './game-modes.module.css';

gsap.registerPlugin(ScrollTrigger);

interface ModeItem {
  num: string;
  title: string;
  desc: string;
  tag: string;
  isSpecial?: boolean;
}

interface GameModesProps {
  onNavigateToCreator?: () => void;
}

export function GameModes({ onNavigateToCreator }: GameModesProps) {
  const { t, i18n } = useTranslation();
  const rootRef = useRef<HTMLElement>(null);
  const { data: games } = useGames();

  const modes: ModeItem[] = [
    ...(games || []).slice(0, 3).map((game, index) => ({
      num: String(index + 1).padStart(2, '0'),
      title: game?.name?.[i18n.language as 'en' | 'ar'] || game?.name?.en || '',
      desc: game?.description?.[i18n.language as 'en' | 'ar'] || game?.description?.en || '',
      tag: t(`landing.gameModes.modes.${index}.tag`),
    })),
    {
      num: '04',
      title: t('landing.gameModes.modes.4.title'),
      desc: t('landing.gameModes.modes.4.desc'),
      tag: '',
      isSpecial: true,
    },
  ];

  useGSAP(() => {
    const cards = rootRef.current?.querySelectorAll(`.${styles.card}`);
    if (!cards || cards.length === 0 || modes.length === 0)
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
  }, { scope: rootRef, dependencies: [modes] });

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
          <li
            key={i}
            className={`${styles.card} ${m.isSpecial ? styles.special : ''}`}
            {...(m.isSpecial && onNavigateToCreator
              ? {
                  role: 'button',
                  tabIndex: 0,
                  onClick: onNavigateToCreator,
                  onKeyDown: e => (e.key === 'Enter' || e.key === ' ') && onNavigateToCreator?.(),
                }
              : {})}
          >
            <span className={styles.num} aria-hidden="true">{m.num}</span>
            {m.isSpecial && (
              <div className={styles.plusContainer}>
                <div className={styles.plus} aria-hidden="true">+</div>
              </div>
            )}
            <h3 className={styles.title}>{m.title}</h3>
            <p className={styles.desc}>{m.desc}</p>
            {m.tag && <span className={styles.tag}>{m.tag}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
};
