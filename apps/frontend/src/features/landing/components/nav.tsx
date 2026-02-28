import type { PathKey } from '../path-data';
import type { Theme } from '@/components/theme-provider';
import * as Switch from '@radix-ui/react-switch';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useGameNavigation } from '@/hooks/use-game-navigation';
import { Logo } from './logo';
import styles from './nav.module.css';

interface NavProps {
  theme: Theme;
  onThemeToggle: () => void;
  activePath: PathKey | null;
  onSwitchPath: () => void;
}

export function Nav({
  theme,
  onThemeToggle,
  activePath,
  onSwitchPath,
}: NavProps) {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useGameNavigation();
  const [solid, setSolid] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Tooltip.Provider delayDuration={300}>
      <nav
        ref={navRef}
        className={`${styles.nav} ${solid ? styles.solid : ''}`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Logo to="/" aria-label="PlayGrid home" />

        {/* Right side */}
        <div className={styles.right}>
          {/* Switch path — only shown after choosing */}
          {activePath && (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  className={styles.switchBtn}
                  onClick={onSwitchPath}
                  aria-label="Switch to the other path"
                >
                  {t('landing.nav.switchPath')}
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className={styles.tooltip} sideOffset={6}>
                  {t('landing.nav.switchPathTooltip')}
                  <Tooltip.Arrow className={styles.tooltipArrow} />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          )}

          {/* Theme toggle — Radix Switch */}
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <div className={styles.themeWrap}>
                <VisuallyHidden.Root>
                  <label htmlFor="theme-switch">
                    {theme === 'light' ? t('landing.nav.switchToDark') : t('landing.nav.switchToLight')}
                  </label>
                </VisuallyHidden.Root>
                <Switch.Root
                  id="theme-switch"
                  className={styles.switchRoot}
                  checked={theme === 'dark'}
                  onCheckedChange={onThemeToggle}
                  aria-label={theme === 'light' ? t('landing.nav.switchToDark') : t('landing.nav.switchToLight')}
                >
                  <span className={styles.switchIconLeft} aria-hidden="true">☀</span>
                  <Switch.Thumb className={styles.switchThumb} />
                  <span className={styles.switchIconRight} aria-hidden="true">☽</span>
                </Switch.Root>
              </div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className={styles.tooltip} sideOffset={6}>
                {theme === 'light' ? t('landing.nav.darkMode') : t('landing.nav.lightMode')}
                <Tooltip.Arrow className={styles.tooltipArrow} />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          {/* Language toggle */}
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                className={styles.langBtn}
                onClick={() => changeLanguage(currentLanguage === 'en' ? 'ar' : 'en')}
                aria-label={currentLanguage === 'en' ? t('landing.nav.switchToArabic') : t('landing.nav.switchToEnglish')}
              >
                <span className={styles.langIcon}>{currentLanguage === 'en' ? 'عربي' : 'EN'}</span>
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className={styles.tooltip} sideOffset={6}>
                {currentLanguage === 'en' ? t('landing.nav.switchToArabicTooltip') : t('landing.nav.switchToEnglishTooltip')}
                <Tooltip.Arrow className={styles.tooltipArrow} />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          {/* CTA */}
          <Link to={`/${currentLanguage}/play`} className={styles.cta}>
            ▶ <span>{t('landing.nav.play')}</span>
          </Link>
        </div>
      </nav>
    </Tooltip.Provider>
  );
};
