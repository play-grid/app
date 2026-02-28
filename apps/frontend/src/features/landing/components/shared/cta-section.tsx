import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useGameNavigation } from '@/hooks/use-game-navigation';
import styles from './cta-section.module.css';

gsap.registerPlugin(ScrollTrigger);

interface CtaSectionProps {
  ghostWordKey: string;
  titleKey: string;
}

export function CtaSection({ ghostWordKey, titleKey }: CtaSectionProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useGameNavigation();
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    if (!titleRef.current)
      return;
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 44, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 70%' },
      },
    );
  }, { scope: rootRef });

  return (
    <section id="cta" ref={rootRef} className={styles.root}>
      <p className={styles.ghost} aria-hidden="true">{t(ghostWordKey)}</p>
      <p className={styles.badge}>{t('landing.cta.badge')}</p>
      <h2 ref={titleRef} className={styles.title}>
        {t(titleKey)}
      </h2>
      <div className={styles.actions}>
        {/* <Link to={`/${currentLanguage}/play`} className="btn-primary">{t('landing.cta.earlyAccess')}</Link> */}
        <Link to={`/${currentLanguage}/play`} className="btn-primary">{t('landing.cta.playNow')}</Link>
      </div>
    </section>
  );
};
