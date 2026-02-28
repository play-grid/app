import type { PathKey } from '../path-data';
import { useGSAP } from '@gsap/react';
import * as Separator from '@radix-ui/react-separator';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useRef } from 'react';
import styles from './gateway.module.css';

gsap.registerPlugin(ScrollTrigger);

interface GatewayProps {
  onChoose: (path: PathKey) => void;
}

interface HalfProps {
  id: string;
  side: 'left' | 'right';
  num: string;
  eyebrow: string;
  label: string;
  desc: string;
  features: string[];
  ctaLabel: string;
  ctaVariant: 'player' | 'creator';
  ghostWord: string;
  lang: string;
  onClick: () => void;
}

const GatewayHalf: React.FC<HalfProps> = ({
  id,
  side,
  num,
  eyebrow,
  label,
  desc,
  features,
  ctaLabel,
  ctaVariant,
  ghostWord,
  lang,
  onClick,
}) => {
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
      aria-label={`Enter as ${eyebrow}`}
    >
      {/* fill on hover */}
      <div className={styles.fill} aria-hidden="true" />

      {/* ghost Arabic letter */}
      <p className={styles.ghost} aria-hidden="true" lang={lang}>
        {ghostWord}
      </p>

      <div className={styles.halfContent}>
        <p className={styles.num}>{num}</p>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 ref={labelRef} className={styles.label}>
          {label.split('<br/>').map(text => (
            <React.Fragment key={text}>
              {text}
              <br />
            </React.Fragment>
          ))}
        </h2>
        <p className={styles.desc}>{desc}</p>

        <button
          className={`${styles.cta} ${styles[`cta_${ctaVariant}`]}`}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          tabIndex={-1}
          aria-hidden="true"
        >
          {ctaLabel}
        </button>

        <ul className={styles.feats} aria-label={`${eyebrow} features`}>
          {features.map(f => (
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
      aria-label="Choose your path"
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
          <span className={styles.dividerOr}>or</span>
        </div>

        <GatewayHalf
          id="gw-player"
          side="left"
          num="01 —"
          eyebrow="For Players"
          label="I want<br/>to play."
          desc="Instant fun, no friction. Join games in one tap — trivia, &quot;Who's Most Likely,&quot; storytelling, memory challenges, and more."
          features={[
            'No account required',
            'Phone as controller',
            'Online or same room',
          ]}
          ctaLabel="Enter as Player →"
          ctaVariant="player"
          ghostWord="العب"
          lang="ar"
          onClick={() => onChoose('player')}
        />

        <GatewayHalf
          id="gw-creator"
          side="right"
          num="02 —"
          eyebrow="For Creators"
          label="I want<br/>to create."
          desc="Build, publish, earn. Turn your PowerPoint or Canva into a live multiplayer game — zero code, zero servers, full control."
          features={[
            'No-code game builder',
            'Import from PowerPoint / Canva',
            'Track plays & earnings',
          ]}
          ctaLabel="Enter as Creator →"
          ctaVariant="creator"
          ghostWord="اصنع"
          lang="ar"
          onClick={() => onChoose('creator')}
        />
      </div>
    </section>
  );
};
