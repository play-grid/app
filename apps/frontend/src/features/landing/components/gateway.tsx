import type { PathKey } from '../path-data';
import { useGSAP } from '@gsap/react';
import * as Separator from '@radix-ui/react-separator';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Creator } from './creator/creator';
import styles from './gateway.module.css';
import { Player } from './player/player';

gsap.registerPlugin(ScrollTrigger);

interface GatewayProps {
  onChoose: (path: PathKey) => void;
}

export function Gateway({ onChoose }: GatewayProps) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const halves = rootRef.current?.querySelectorAll('.half, [class*="half"]');
    if (!halves)
      return;
    gsap.fromTo(
      halves,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top 78%',
        },
      },
    );
  }, { scope: rootRef });

  return (
    <section
      id="gateway"
      ref={rootRef}
      className={styles.root}
      aria-label={t('landing.gateway.ariaLabel')}
    >
      <Separator.Root
        decorative
        orientation="horizontal"
        className={styles.topSep}
      />

      <div className={styles.grid}>
        <div className={styles.dividerWrap} aria-hidden="true">
          <div className={styles.dividerLine} />
          <span className={styles.dividerOr}>{t('landing.gateway.divider')}</span>
        </div>

        <Player onClick={() => onChoose('player')} />
        <Creator onClick={() => onChoose('creator')} />
      </div>
    </section>
  );
}
