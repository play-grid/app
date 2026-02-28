import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CREATOR_STEP_KEYS } from '../../path-data';
import styles from './before-after.module.css';

gsap.registerPlugin(ScrollTrigger);

function LiveGame() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(0);

  const answers = [
    t('landing.beforeAfter.liveGame.answers.0'),
    t('landing.beforeAfter.liveGame.answers.1'),
    t('landing.beforeAfter.liveGame.answers.2'),
    t('landing.beforeAfter.liveGame.answers.3'),
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setSelected(s => (s + 1) % answers.length);
    }, 1100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.live} role="img" aria-label="Live game preview">
      <div className={styles.liveHeader}>
        <span className={styles.liveDot} aria-hidden="true" />
        <span>{t('landing.beforeAfter.liveGame.liveLabel')}</span>
      </div>
      <div className={styles.liveBody}>
        <p className={styles.liveQ} lang="ar">{t('landing.beforeAfter.liveGame.question')}</p>
        <ul className={styles.opts} aria-label="Answer options">
          {answers.map((a, i) => (
            <li
              key={a}
              className={`${styles.opt} ${i === selected ? styles.optSel : ''}`}
              lang="ar"
            >
              {a}
              {i === selected ? ' ✓' : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export function BeforeAfter() {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  const steps = CREATOR_STEP_KEYS.map(key =>
    t(`landing.beforeAfter.steps.${key}`, { returnObjects: true }) as {
      num: string;
      title: string;
      desc: string;
    },
  );

  useGSAP(() => {
    if (!copyRef.current || !visualRef.current)
      return;

    const copyEls = copyRef.current.querySelectorAll('[data-animate]');
    gsap.fromTo(
      copyEls,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 70%' },
      },
    );
    gsap.fromTo(
      visualRef.current,
      { opacity: 0, x: 32 },
      {
        opacity: 1,
        x: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 70%' },
      },
    );
  }, { scope: rootRef });

  return (
    <section
      ref={rootRef}
      className={styles.root}
      aria-labelledby="ba-heading"
    >
      <div className={styles.grid}>
        {/* copy */}
        <div ref={copyRef}>
          <p className="section-tag" data-animate>{t('landing.beforeAfter.sectionTag')}</p>
          <h2
            id="ba-heading"
            className={styles.headline}
            data-animate
          >
            {t('landing.beforeAfter.headline')}
          </h2>
          <p className={styles.body} data-animate>
            {t('landing.beforeAfter.body')}
          </p>

          <ol className={styles.steps} data-animate>
            {steps.map(s => (
              <li key={s.num} className={styles.step}>
                <span className={styles.stepNum}>{s.num}</span>
                <div>
                  <p className={styles.stepTitle}>{s.title}</p>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* visual */}
        <div ref={visualRef} className={styles.visual}>
          {/* BEFORE */}
          <div className={styles.panel}>
            <span className={styles.panelLbl}>{t('landing.beforeAfter.beforeLabel')}</span>
            <div className={styles.slide} aria-label="Static PowerPoint slide preview">
              <div className={styles.slideHeader}>
                <span className={styles.dot} style={{ background: '#ff5f57' }} />
                <span className={styles.dot} style={{ background: '#febc2e' }} />
                <span className={styles.dot} style={{ background: '#28c840' }} />
              </div>
              <div className={styles.slideBody}>
                <p className={styles.slideTitle} lang="ar">{t('landing.beforeAfter.gameLabel')}</p>
                <span className={styles.bar} style={{ width: '78%' }} />
                <span className={styles.bar} style={{ width: '58%' }} />
                <span className={styles.bar} style={{ width: '68%' }} />
              </div>
            </div>
          </div>

          {/* arrow */}
          <div className={styles.arrow} aria-hidden="true">
            <span>{t('landing.beforeAfter.transformArrow')}</span>
            <span>↓</span>
          </div>

          {/* AFTER */}
          <div className={`${styles.panel} ${styles.panelAfter}`}>
            <span className={`${styles.panelLbl} ${styles.panelLblAccent}`}>
              {t('landing.beforeAfter.afterLabel')}
            </span>
            <LiveGame />
          </div>
        </div>
      </div>
    </section>
  );
};
