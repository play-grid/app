import type { LogoItem } from './logo-types';

export interface Player {
  id: string;
  name: string;
  logos: LogoItem[];
  winner: LogoItem | null;
  activeCount: number;
}
