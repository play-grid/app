import type { LogoItem } from './logo-item';

export interface Player {
  name: string;
  logos: LogoItem[];
  winner: LogoItem | null;
  activeCount: number;
}
