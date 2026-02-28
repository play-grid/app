import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './cta-section.module.css';

gsap.registerPlugin(ScrollTrigger);

interface CtaSectionProps {
  ghostWord: string;
  title: string;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ ghostWord, title }) => {
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
      <p className={styles.ghost} aria-hidden="true">{ghostWord}</p>
      <p className={styles.badge}>Join the Waitlist</p>
      <h2 ref={titleRef} className={styles.title}>
        {title.split('\n').map((line, i, arr) => (
          <React.Fragment key={line}>
            {line}
            {i < arr.length - 1 && <br />}
          </React.Fragment>
        ))}
      </h2>
      <div className={styles.actions}>
        <Link to="/play" className="btn-primary">Get Early Access →</Link>
        <Link to="/play" className="btn-outline">Play Now</Link>
      </div>
    </section>
  );
};
