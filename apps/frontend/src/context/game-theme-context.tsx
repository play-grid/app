import type { ReactNode } from 'react';
import React, { createContext, use, useEffect } from 'react';

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
  const [gameTheme, setGameTheme] = React.useState<GameTheme>(defaultTheme);

  useEffect(() => {
    const root = document.documentElement;

    // Remove all game theme classes
    root.classList.remove('theme-platform', 'theme-five-seconds', 'theme-guess-logo');

    // Add current game theme
    root.classList.add(`theme-${gameTheme}`);
  }, [gameTheme]);

  return (
    <GameThemeContext value={{ gameTheme, setGameTheme }}>
      {children}
    </GameThemeContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGameTheme() {
  const context = use(GameThemeContext);
  if (!context) {
    throw new Error('useGameTheme must be used within GameThemeProvider');
  }
  return context;
}
