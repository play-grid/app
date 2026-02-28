import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useRef } from 'react';
import { GAME_MODES } from '../../path-data';
import styles from './game-modes.module.css';

gsap.registerPlugin(ScrollTrigger);

export const GameModes: React.FC = () => {
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

  return (
    <section
      ref={rootRef}
      className={styles.root}
      aria-labelledby="modes-heading"
    >
      <p className="section-tag">Game Library</p>
      <h2 id="modes-heading" className="section-title">
        Every session,
        <br />
        a new story.
      </h2>

      <ul className={styles.grid} role="list">
        {GAME_MODES.map(m => (
          <li key={m.num} className={styles.card}>
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
