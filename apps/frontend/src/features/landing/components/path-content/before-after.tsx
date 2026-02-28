import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef, useState } from 'react';
import { CREATOR_STEPS } from '../../path-data';
import styles from './before-after.module.css';

gsap.registerPlugin(ScrollTrigger);

const ANSWERS = ['الرياض', 'جدة', 'أبها', 'الدمام'] as const;

const LiveGame: React.FC = () => {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSelected(s => (s + 1) % ANSWERS.length);
    }, 1100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.live} role="img" aria-label="Live game preview">
      <div className={styles.liveHeader}>
        <span className={styles.liveDot} aria-hidden="true" />
        <span>LIVE · 12 PLAYERS</span>
      </div>
      <div className={styles.liveBody}>
        <p className={styles.liveQ} lang="ar">ما عاصمة المملكة؟</p>
        <ul className={styles.opts} aria-label="Answer options">
          {ANSWERS.map((a, i) => (
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

export const BeforeAfter: React.FC = () => {
  const rootRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

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
          <p className="section-tag" data-animate>The Creator Story</p>
          <h2
            id="ba-heading"
            className={styles.headline}
            data-animate
          >
            You already made
            <br />
            the game. We just
            <br />
            made it
            {' '}
            <em>multiplayer</em>
            .
          </h2>
          <p className={styles.body} data-animate>
            You've built the perfect trivia night in PowerPoint — great questions,
            tight design. But the delivery falls flat. No live state. No synchronized
            screens. No real drama. PlayGrid bridges that gap in seconds.
          </p>

          <ol className={styles.steps} data-animate>
            {CREATOR_STEPS.map(s => (
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
            <span className={styles.panelLbl}>Before — Static Slides</span>
            <div className={styles.slide} aria-label="Static PowerPoint slide preview">
              <div className={styles.slideHeader}>
                <span className={styles.dot} style={{ background: '#ff5f57' }} />
                <span className={styles.dot} style={{ background: '#febc2e' }} />
                <span className={styles.dot} style={{ background: '#28c840' }} />
              </div>
              <div className={styles.slideBody}>
                <p className={styles.slideTitle} lang="ar">سؤال ١</p>
                <span className={styles.bar} style={{ width: '78%' }} />
                <span className={styles.bar} style={{ width: '58%' }} />
                <span className={styles.bar} style={{ width: '68%' }} />
              </div>
            </div>
          </div>

          {/* arrow */}
          <div className={styles.arrow} aria-hidden="true">
            <span>PlayGrid Transform</span>
            <span>↓</span>
          </div>

          {/* AFTER */}
          <div className={`${styles.panel} ${styles.panelAfter}`}>
            <span className={`${styles.panelLbl} ${styles.panelLblAccent}`}>
              After — Live Multiplayer
            </span>
            <LiveGame />
          </div>
        </div>
      </div>
    </section>
  );
};
