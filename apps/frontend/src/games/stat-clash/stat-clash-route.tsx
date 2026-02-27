import { Outlet } from 'react-router-dom';
import { useSetGameThemeSync } from '@/context/game-theme-context';

export function StatClashRoute() {
  useSetGameThemeSync('platform');

  return <Outlet />;
}
