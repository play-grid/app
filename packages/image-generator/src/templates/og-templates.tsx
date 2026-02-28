import { OGLayout } from '../utils/layout.js';

const TRANSLATIONS = {
  home: {
    en: {
      title: 'PlayGrid',
      subtitle: 'Interactive Games in Arabic and English',
      live: 'Live Now',
      games: ['Five Seconds', 'Guess Logo', 'Stat Clash'],
      tagline: 'Play with friends • Compete in real-time • Have fun',
    },
    ar: {
      title: 'PlayGrid',
      subtitle: 'باللغتين العربية والإنجليزية',
      live: 'متاح الآن',
      games: ['لعبة خمس ثواني', 'خمن الشعار', 'تحدي الإحصائيات'],
      tagline: 'العب مع أصدقائك • تنافس في الوقت الحقيقي • استمتع',
    },
  },
  fiveSeconds: {
    en: {
      title: 'Five Seconds',
      subtitle: 'Quick-thinking party game',
      description: 'Name 3 things in 5 seconds!',
      cta: 'Play Now →',
      badge: '5 Sec Limit',
    },
    ar: {
      title: 'خمس ثواني',
      subtitle: 'لعبة التفكير السريع',
      description: 'سمِّ 3 أشياء في 5 ثواني!',
      cta: 'العب الآن →',
      badge: '5 ثواني',
    },
  },
  guessLogo: {
    en: {
      title: 'Guess the Logo',
      subtitle: 'Brand recognition game',
      description: 'Can you guess the brand?',
      cta: 'Play Now →',
      badge: 'Brand Challenge',
    },
    ar: {
      title: 'خمن الشعار',
      subtitle: 'لعبة معرفة الشعار',
      description: 'هل يمكنك خمن الشعار؟',
      cta: 'العب الآن →',
      badge: 'تحدي الشعار',
    },
  },
  statClash: {
    en: {
      title: 'Stat Clash',
      subtitle: 'Movie stats game',
      description: 'Higher or lower?',
      cta: 'Play Now →',
      badge: 'Trivia Battle',
    },
    ar: {
      title: 'تحدي الإحصائيات',
      subtitle: 'لعبة الأرقام الإحصائية',
      description: 'أعلى أو أدنى؟',
      cta: 'العب الآن →',
      badge: 'تحدي الأرقام',
    },
  },
} as const;

const FIVE_SECONDS_COLORS = {
  bg: '#cec4a9',
  card: '#dbe2cd',
  primary: '#9ead84',
  urgency: '#b66a49',
  foreground: '#413c31',
  accent: '#ebe5d5',
  shine: '#b4c895',
} as const;

const STYLES = {
  badge: {
    backgroundColor: 'rgba(224, 125, 42, 0.1)',
    border: '1px solid #e07d2a',
    color: '#e07d2a',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '3px 12px',
  },
  badgeDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#e07d2a',
    animation: 'pulse 2s infinite',
  },
  title: {
    fontSize: '64px',
    fontWeight: 800,
    lineHeight: 1.1,
    color: '#1a1714',
  },
  subtitle: {
    fontSize: '28px',
    fontWeight: 500,
    lineHeight: 1.15,
    color: '#3d3830',
  },
  cta: {
    backgroundColor: '#1a1714',
    color: '#f0ebe0',
    fontFamily: '\'DM Mono\', monospace',
    fontSize: '16px',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    padding: '10px 22px',
    fontWeight: 700,
  },
  description: {
    fontSize: '24px',
    lineHeight: 1.6,
    color: '#3d3830',
  },
  gameCard: {
    backgroundColor: '#f0ebe0',
    border: '1px solid rgba(26, 23, 20, 0.1)',
    borderRadius: '16px',
    padding: '24px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  gameIcon: {
    fontSize: '28px',
  },
  gameText: {
    fontSize: '20px',
    fontWeight: 500,
    color: '#1a1714',
  },
  tagline: {
    fontSize: '18px',
    lineHeight: 1.6,
    color: '#3d3830',
  },
} as const;

export function HomepageOG() {
  const locale = 'en' as 'en' | 'ar';
  const t = TRANSLATIONS.home[locale];

  return (
    <OGLayout dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={STYLES.badge}>
          <span style={STYLES.badgeDot}></span>
          <span style={{ marginLeft: '4px' }}>{t.live}</span>
        </div>

        <h1 style={STYLES.title}>
          {t.title}
        </h1>

        <p style={STYLES.subtitle}>
          {t.subtitle}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginTop: '32px' }}>
          <div style={STYLES.gameCard}>
            <span style={STYLES.gameIcon}>🎮</span>
            <span style={STYLES.gameText}>{t.games[0]}</span>
          </div>
          <div style={STYLES.gameCard}>
            <span style={STYLES.gameIcon}>🎯</span>
            <span style={STYLES.gameText}>{t.games[1]}</span>
          </div>
          <div style={STYLES.gameCard}>
            <span style={STYLES.gameIcon}>📊</span>
            <span style={STYLES.gameText}>{t.games[2]}</span>
          </div>
        </div>

        <p style={STYLES.tagline}>
          {t.tagline}
        </p>
      </div>
    </OGLayout>
  );
}

export function FiveSecondsOG() {
  const locale = 'en' as 'en' | 'ar';
  const t = TRANSLATIONS.fiveSeconds[locale];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: FIVE_SECONDS_COLORS.bg,
      fontFamily: 'PixelAE, sans-serif',
      direction: locale === 'ar' ? 'rtl' : 'ltr',
    }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: FIVE_SECONDS_COLORS.card,
        borderRadius: '0px',
        padding: '48px 60px',
        boxShadow: `
          -2px 0 0 0 ${FIVE_SECONDS_COLORS.foreground},
          2px 0 0 0 ${FIVE_SECONDS_COLORS.foreground},
          0 2px 0 0 ${FIVE_SECONDS_COLORS.foreground},
          0 -2px 0 0 ${FIVE_SECONDS_COLORS.foreground}
        `,
        position: 'relative',
      }}
      >
        <div style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          borderBottom: `4px solid ${FIVE_SECONDS_COLORS.foreground}`,
          borderRight: `4px solid ${FIVE_SECONDS_COLORS.foreground}`,
          opacity: 0.3,
        }} />

        <div style={{
          backgroundColor: 'rgba(182, 106, 73, 0.15)',
          border: `2px solid ${FIVE_SECONDS_COLORS.urgency}`,
          color: FIVE_SECONDS_COLORS.urgency,
          fontSize: '14px',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '3px 12px',
          marginBottom: '24px',
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: FIVE_SECONDS_COLORS.urgency,
          }}></span>
          <span>{t.badge}</span>
        </div>

        <h1 style={{
          fontSize: '64px',
          fontWeight: 800,
          lineHeight: 1.1,
          color: FIVE_SECONDS_COLORS.foreground,
          marginBottom: '16px',
          textAlign: 'center',
        }}>
          {t.title}
        </h1>

        <p style={{
          fontSize: '28px',
          fontWeight: 500,
          lineHeight: 1.15,
          color: FIVE_SECONDS_COLORS.foreground,
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          {t.subtitle}
        </p>

        <div style={{
          backgroundColor: FIVE_SECONDS_COLORS.primary,
          color: '#ffffff',
          fontFamily: 'PixelAE, monospace',
          fontSize: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          padding: '10px 22px',
          fontWeight: 700,
          boxShadow: `
            -2px 0 0 0 ${FIVE_SECONDS_COLORS.foreground},
            2px 0 0 0 ${FIVE_SECONDS_COLORS.foreground},
            0 2px 0 0 ${FIVE_SECONDS_COLORS.foreground},
            0 -2px 0 0 ${FIVE_SECONDS_COLORS.foreground}
          `,
          position: 'relative',
          marginBottom: '32px',
        }}>
          <div style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            borderBottom: `4px solid rgba(79, 98, 68, 0.7)`,
            borderRight: `4px solid rgba(79, 98, 68, 0.7)`,
          }} />
          <span style={{ position: 'relative', zIndex: 1 }}>{t.cta}</span>
        </div>

        <p style={{
          fontSize: '24px',
          lineHeight: 1.6,
          color: FIVE_SECONDS_COLORS.foreground,
          textAlign: 'center',
        }}>
          {t.description}
        </p>
      </div>
    </div>
  );
}

export function GuessLogoOG() {
  const locale = 'en' as 'en' | 'ar';
  const t = TRANSLATIONS.guessLogo[locale];

  return (
    <OGLayout dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={STYLES.badge}>
          <span style={STYLES.badgeDot}></span>
          <span style={{ marginLeft: '4px' }}>{t.badge}</span>
        </div>

        <h1 style={STYLES.title}>
          {t.title}
        </h1>

        <p style={STYLES.subtitle}>
          {t.subtitle}
        </p>

        <div style={STYLES.cta}>
          {t.cta}
        </div>

        <p style={{ ...STYLES.description, marginTop: '32px' }}>
          {t.description}
        </p>
      </div>
    </OGLayout>
  );
}

export function StatClashOG() {
  const locale = 'en' as 'en' | 'ar';
  const t = TRANSLATIONS.statClash[locale];

  return (
    <OGLayout dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={STYLES.badge}>
          <span style={STYLES.badgeDot}></span>
          <span style={{ marginLeft: '4px' }}>{t.badge}</span>
        </div>

        <h1 style={STYLES.title}>
          {t.title}
        </h1>

        <p style={STYLES.subtitle}>
          {t.subtitle}
        </p>

        <div style={STYLES.cta}>
          {t.cta}
        </div>

        <p style={{ ...STYLES.description, marginTop: '32px' }}>
          {t.description}
        </p>
      </div>
    </OGLayout>
  );
}
