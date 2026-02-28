import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useRef } from 'react';
import styles from './hero.module.css';

gsap.registerPlugin(ScrollTrigger);

export const Hero: React.FC = () => {
  const rootRef = useRef<HTMLElement>(null);
  const tickerRef = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    // Ticker parallax
    if (tickerRef.current) {
      gsap.to(tickerRef.current, {
        x: '-10%',
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }

    // Staggered entrance
    const els = rootRef.current?.querySelectorAll('[data-animate]');
    if (els) {
      gsap.fromTo(
        els,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          delay: 0.2,
        },
      );
    }
  }, { scope: rootRef });

  return (
    <section
      id="hero"
      ref={rootRef}
      className={styles.root}
      aria-label="PlayGrid introduction"
    >
      <div className="grid-bg" aria-hidden="true" />

      {/* floating Arabic ticker */}
      <p
        ref={tickerRef}
        className={styles.ticker}
        aria-hidden="true"
        lang="ar"
      >
        العب معاً
      </p>

      {/* status chips */}
      <aside className={styles.chips} aria-label="Platform highlights">
        <span className={`${styles.chip} ${styles.chipHot}`}>● Coming Soon</span>
        <span className={styles.chip}>Arabic-First Platform</span>
        <span className={styles.chip}>Multiplayer · No-Code · Live</span>
      </aside>

      {/* main content */}
      <div className={styles.content}>
        <div className={styles.badge} data-animate aria-label="Platform tagline">
          <span className={styles.badgeDot} aria-hidden="true" />
          Multiplayer Arabic Games, Reimagined
        </div>

        <h1 className={styles.title} data-animate>
          Play.
          <br />
          Create.
          <br />
          <em>Connect.</em>
        </h1>

        <p className={styles.sub} data-animate>
          The complete ecosystem where families, friends, and creators thrive
          together — fast, seamless, and endlessly fun. Scroll to find your place.
        </p>

        <div className={styles.scrollPrompt} data-animate aria-hidden="true">
          <span className={styles.scrollLine} />
          Who are you?
        </div>
      </div>
    </section>
  );
};
