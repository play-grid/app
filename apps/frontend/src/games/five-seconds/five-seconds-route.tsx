// apps/frontend/src/games/five-seconds/five-seconds-route.tsx
import { Outlet } from 'react-router-dom';
import { useSetGameThemeSync } from '../../context/game-theme-context';

export function FiveSecondsRoute() {
  useSetGameThemeSync('five-seconds', 'platform');

  return <Outlet />;
}
