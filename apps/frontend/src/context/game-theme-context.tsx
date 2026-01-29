import type { ReactNode } from 'react';
import { createContext, use, useEffect, useState } from 'react';

type GameTheme = 'platform' | 'five-seconds' | 'guess-logo';

interface GameThemeContextType {
  gameTheme: GameTheme;
  setGameTheme: (theme: GameTheme) => void;
}

const GameThemeContext = createContext<GameThemeContextType | undefined>(undefined);

export function GameThemeProvider({
  children,
  defaultTheme = 'platform',
}: {
  children: ReactNode;
  defaultTheme?: GameTheme;
}) {
  const [gameTheme, setGameTheme] = useState<GameTheme>(defaultTheme);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove('theme-platform', 'theme-five-seconds', 'theme-guess-logo');
    root.classList.add(`theme-${gameTheme}`);
  }, [gameTheme]);

  return (
    <GameThemeContext value={{ gameTheme, setGameTheme }}>
      {children}
    </GameThemeContext>
  );
}

export function useGameTheme() {
  const context = use(GameThemeContext);
  if (!context) {
    throw new Error('useGameTheme must be used within GameThemeProvider');
  }
  return context;
}

export function useSetGameThemeSync(activeTheme: GameTheme, restoreTheme: GameTheme = 'platform'): void {
  const { setGameTheme } = useGameTheme();

  useEffect(() => {
    setGameTheme(activeTheme);
    return () => setGameTheme(restoreTheme);
  }, [setGameTheme, activeTheme, restoreTheme]);
}
