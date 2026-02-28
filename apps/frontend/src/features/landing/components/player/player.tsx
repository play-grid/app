import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../gateway.module.css';

interface PlayerProps {
  onClick: () => void;
}

export function Player({ onClick }: PlayerProps) {
  const { t } = useTranslation();
  const halfRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLHeadingElement>(null);

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
      id="gw-player"
      ref={halfRef}
      className={`${styles.half} ${styles.left}`}
      onClick={onClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
      role="button"
      tabIndex={0}
      aria-label={`Enter as ${t('landing.gateway.player.eyebrow')}`}
    >
      <div className={styles.fill} aria-hidden="true" />

      <p className={styles.ghost} aria-hidden="true" lang="ar">
        {t('landing.cta.playerTitle')}
      </p>

      <div className={styles.halfContent}>
        <p className={styles.num}>{t('landing.gateway.player.num')}</p>
        <p className={styles.eyebrow}>{t('landing.gateway.player.eyebrow')}</p>
        <h2 ref={labelRef} className={styles.label}>
          {(t('landing.gateway.player.label') as string).split('<br/>').map(text => (
            <Fragment key={text}>
              {text}
              <br />
            </Fragment>
          ))}
        </h2>
        <p className={styles.desc}>{t('landing.gateway.player.desc')}</p>

        <button
          className={`${styles.cta} ${styles.cta_player}`}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          tabIndex={-1}
          aria-hidden="true"
        >
          {t('landing.gateway.player.cta')}
        </button>

        <ul className={styles.feats} aria-label={`${t('landing.gateway.player.eyebrow')} features`}>
          {(t('landing.gateway.player.features', { returnObjects: true }) as string[]).map((f: string) => (
            <li key={f} className={styles.feat}>
              <span className={styles.featDot} aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Fragment({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
