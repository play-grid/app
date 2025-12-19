import { useTheme } from '@/components/theme-provider';

export function useIsDarkTheme() {
  const { theme } = useTheme();

  const isDark
    = theme === 'dark'
      || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return isDark;
}
