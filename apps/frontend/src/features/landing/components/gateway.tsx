import type { PathKey } from '../path-data';
import { useGSAP } from '@gsap/react';
import * as Separator from '@radix-ui/react-separator';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './gateway.module.css';

gsap.registerPlugin(ScrollTrigger);

interface GatewayProps {
  onChoose: (path: PathKey) => void;
}

interface HalfProps {
  id: string;
  side: 'left' | 'right';
  numKey: string;
  eyebrowKey: string;
  labelKey: string;
  descKey: string;
  featuresKey: string;
  ctaLabelKey: string;
  ctaVariant: 'player' | 'creator';
  ghostWordKey: string;
  lang: string;
  onClick: () => void;
}

const GatewayHalf: React.FC<HalfProps> = ({
  id,
  side,
  numKey,
  eyebrowKey,
  labelKey,
  descKey,
  featuresKey,
  ctaLabelKey,
  ctaVariant,
  ghostWordKey,
  lang,
  onClick,
}) => {
  const { t } = useTranslation();
  const halfRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLHeadingElement>(null);

  // Cursor-driven label tilt
  useGSAP(() => {
    const el = halfRef.current;
    const lbl = labelRef.current;
    if (!el || !lbl)
      return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 12;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 7;
      gsap.to(lbl, { x, y, duration: 0.35, ease: 'power1.out' });
    };
    const onLeave = () => {
      gsap.to(lbl, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' });
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, { scope: halfRef });

  return (
    <div
      id={id}
      ref={halfRef}
      className={`${styles.half} ${styles[side]}`}
      onClick={onClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
      role="button"
      tabIndex={0}
      aria-label={`Enter as ${t(eyebrowKey)}`}
    >
      {/* fill on hover */}
      <div className={styles.fill} aria-hidden="true" />

      {/* ghost Arabic letter */}
      <p className={styles.ghost} aria-hidden="true" lang={lang}>
        {t(ghostWordKey)}
      </p>

      <div className={styles.halfContent}>
        <p className={styles.num}>{t(numKey)}</p>
        <p className={styles.eyebrow}>{t(eyebrowKey)}</p>
        <h2 ref={labelRef} className={styles.label}>
          {t(labelKey).split('<br/>').map(text => (
            <React.Fragment key={text}>
              {text}
              <br />
            </React.Fragment>
          ))}
        </h2>
        <p className={styles.desc}>{t(descKey)}</p>

        <button
          className={`${styles.cta} ${styles[`cta_${ctaVariant}`]}`}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          tabIndex={-1}
          aria-hidden="true"
        >
          {t(ctaLabelKey)}
        </button>

        <ul className={styles.feats} aria-label={`${t(eyebrowKey)} features`}>
          {t(featuresKey, { returnObjects: true }).map((f: string) => (
            <li key={f} className={styles.feat}>
              <span className={styles.featDot} aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const Gateway: React.FC<GatewayProps> = ({ onChoose }) => {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLElement>(null);

  // Scroll-reveal the two halves
  useGSAP(() => {
    const halves = rootRef.current?.querySelectorAll(`.${styles.half}`);
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
        {/* vertical divider */}
        <div className={styles.dividerWrap} aria-hidden="true">
          <div className={styles.dividerLine} />
          <span className={styles.dividerOr}>{t('landing.gateway.divider')}</span>
        </div>

        <GatewayHalf
          id="gw-player"
          side="left"
          numKey="landing.gateway.player.num"
          eyebrowKey="landing.gateway.player.eyebrow"
          labelKey="landing.gateway.player.label"
          descKey="landing.gateway.player.desc"
          featuresKey="landing.gateway.player.features"
          ctaLabelKey="landing.gateway.player.cta"
          ctaVariant="player"
          ghostWordKey="landing.cta.playerTitle"
          lang="ar"
          onClick={() => onChoose('player')}
        />

        <GatewayHalf
          id="gw-creator"
          side="right"
          numKey="landing.gateway.creator.num"
          eyebrowKey="landing.gateway.creator.eyebrow"
          labelKey="landing.gateway.creator.label"
          descKey="landing.gateway.creator.desc"
          featuresKey="landing.gateway.creator.features"
          ctaLabelKey="landing.gateway.creator.cta"
          ctaVariant="creator"
          ghostWordKey="landing.cta.creatorTitle"
          lang="ar"
          onClick={() => onChoose('creator')}
        />
      </div>
    </section>
  );
};
