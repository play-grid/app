import type { PathKey } from './path-data';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useCallback, useRef, useState } from 'react';
import { useTheme } from '@/components/theme-provider';
import { Gateway } from './components/gateway';
import { Hero } from './components/hero';
import { Nav } from './components/nav';
import { PathContent } from './components/path-content/path-content';
import { PATHS } from './path-data';
import { useCursor } from './use-cursor';
import '@/features/landing/styles/landing.css';

type AppState = 'gateway' | 'player' | 'creator';

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const { dotRef, ringRef } = useCursor();
  const [appState, setAppState] = useState<AppState>('gateway');

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const gwPlayerRef = useRef<HTMLDivElement | null>(null);
  const gwCreatorRef = useRef<HTMLDivElement | null>(null);
  const gwSectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Resolve gateway element refs after mount
  const setGwRefs = useCallback(() => {
    gwPlayerRef.current = document.getElementById('gw-player') as HTMLDivElement;
    gwCreatorRef.current = document.getElementById('gw-creator') as HTMLDivElement;
    gwSectionRef.current = document.getElementById('gateway') as HTMLElement;
  }, []);

  useGSAP(() => {
    setGwRefs();
  });

  /* ── Choose path: animate gateway out, reveal path content ── */
  const handleChoose = useCallback((path: PathKey) => {
    setGwRefs();
    const chosen = path === 'player' ? gwPlayerRef.current : gwCreatorRef.current;
    const other = path === 'player' ? gwCreatorRef.current : gwPlayerRef.current;

    if (!chosen || !other) {
      setAppState(path);
      return;
    }

    // Flash fill on chosen half
    const fill = chosen.querySelector<HTMLElement>('[class*="fill"]');
    if (fill)
      fill.style.transform = 'scaleY(1)';

    const tl = gsap.timeline({
      delay: 0.15,
      onComplete: () => setAppState(path),
    });

    tl.to(chosen, { x: path === 'player' ? '-110%' : '110%', duration: 0.5, ease: 'power2.in' }, 0)
      .to(other, { x: path === 'player' ? '-110%' : '110%', duration: 0.5, ease: 'power2.in' }, 0.05)
      .to('[class*="dividerWrap"], [class*="dividerOr"]', { opacity: 0, duration: 0.25 }, 0);
  }, [setGwRefs]);

  /* ── Reset: fade out path content, restore gateway ── */
  const handleSwitchPath = useCallback(() => {
    setGwRefs();

    const tl = gsap.timeline({
      onComplete: () => {
        // Reset half positions
        if (gwPlayerRef.current) {
          gwPlayerRef.current.style.transform = '';
          gwPlayerRef.current.style.opacity = '';
        }
        if (gwCreatorRef.current) {
          gwCreatorRef.current.style.transform = '';
          gwCreatorRef.current.style.opacity = '';
        }

        // Reset fills
        document.querySelectorAll('[class*="fill"]').forEach((el) => {
          (el as HTMLElement).style.transform = '';
        });

        setAppState('gateway');

        // Scroll to gateway
        requestAnimationFrame(() => {
          document.getElementById('gateway')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      },
    });

    tl.to(contentRef.current, { opacity: 0, y: 16, duration: 0.3, ease: 'power2.in' });
  }, [setGwRefs]);

  const isPathActive = appState === 'player' || appState === 'creator';
  const pathData = isPathActive ? PATHS[appState] : null;

  return (
    <>

      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />

      <Nav
        theme={theme}
        onThemeToggle={toggleTheme}
        activePath={isPathActive ? appState : null}
        onSwitchPath={handleSwitchPath}
      />

      <main className="landing-page">

        <Hero />

        {!isPathActive && (
          <Gateway onChoose={handleChoose} />
        )}

        {isPathActive && pathData && (
          <div ref={contentRef}>
            <PathContent data={pathData} />
          </div>
        )}
      </main>
    </>
  );
}
