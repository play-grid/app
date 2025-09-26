import type { LogoItem } from './logo-types';

export interface Player {
  name: string;
  logos: LogoItem[];
  winner: LogoItem | null;
  activeCount: number;
}
