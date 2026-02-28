import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';

export function useCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const isActive = useRef(false);

  useEffect(() => {
    const dot = dotRef.current;
    const ringEl = ringRef.current;
    if (!dot || !ringEl)
      return;

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      gsap.to(dot, { left: e.clientX, top: e.clientY, duration: 0.07, overwrite: true });
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        'a, button, [role="button"], .gw-half, .mode-card, .feat-card',
      );
      ringEl.classList.toggle('expanded', !!target);
    };

    const tick = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.11;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.11;
      gsap.set(ringEl, { left: ring.current.x, top: ring.current.y });

      if (isActive.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const checkVisibility = () => {
      if (!dot || !ringEl) {
        isActive.current = false;
        return false;
      }

      const isVisible = dot.isConnected && ringEl.isConnected;
      isActive.current = isVisible;
      return isVisible;
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);

    isActive.current = checkVisibility();
    if (isActive.current) {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(rafRef.current);
      gsap.killTweensOf(dot);
      isActive.current = false;
    };
  }, []);

  return { dotRef, ringRef };
}
