import type { PathData } from '../../path-data';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useRef } from 'react';
import { CtaSection } from '../shared/cta-section';
import { Footer } from '../shared/footer';
import { MarqueeBar } from '../shared/marquee-bar';
import { StatsStrip } from '../shared/stats-strip';
import { BeforeAfter } from './before-after';
import { Features } from './features';
import { GameModes } from './game-modes';
import { PathBar } from './path-bar';

interface PathContentProps {
  data: PathData;
}

export const PathContent: React.FC<PathContentProps> = ({ data }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  // Entrance animation when path is chosen
  useGSAP(() => {
    gsap.fromTo(
      rootRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
    );
  }, { scope: rootRef, dependencies: [data.key] });

  return (
    <div ref={rootRef}>
      <PathBar data={data} />
      {data.showModes && <GameModes />}
      {data.showBA && <BeforeAfter />}
      <Features data={data} />
      <MarqueeBar />
      <StatsStrip />
      <CtaSection
        ghostWordKey={data.ctaGhostWordKey}
        titleKey={data.ctaTitleKey}
      />
      <Footer />
    </div>
  );
};
