import type { ReactNode } from 'react';

interface OGLayoutProps {
  children: ReactNode;
  bg?: string;
  accent?: string;
}

const COLORS = {
  bg: '#f0ebe0',
  foreground: '#1a1714',
  card: '#ece7db',
  border: 'rgba(26, 23, 20, 0.1)',
  primary: '#e07d2a',
  muted: 'rgba(26, 23, 20, 0.60)',
} as const;

const FONTS = {
  en: '\'Syne\', Geist',
  ar: '\'Ping\', \'Rubik\', sans-serif',
} as const;

export function OGLayout({ children, bg = COLORS.bg, dir = 'ltr' }: OGLayoutProps & { dir: 'ltr' | 'rtl' }) {
  const fontFamily = FONTS[dir === 'rtl' ? 'ar' : 'en'];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: bg,
      fontFamily,
      direction: dir,
    }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.card,
        borderRadius: '16px',
        padding: '48px 60px',
      }}
      >
        {children}
      </div>
    </div>
  );
}
