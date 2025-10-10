export interface GridConfiguration {
  id: string;
  name: string;
  rows: number;
  cols: number;
  totalLogos: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  estimatedTime: string;
}

export const gridConfigurations: GridConfiguration[] = [
  {
    id: '4x3',
    name: '4-3-grid',
    rows: 4,
    cols: 3,
    totalLogos: 12,
    difficulty: 'easy',
    estimatedTime: '5-10-min',
  },
  {
    id: '6x4',
    name: '6-4-grid',
    rows: 6,
    cols: 4,
    totalLogos: 24,
    difficulty: 'medium',
    estimatedTime: '10-15-min',
  },
  {
    id: '8x6',
    name: '8-6-grid',
    rows: 8,
    cols: 6,
    totalLogos: 48,
    difficulty: 'hard',
    estimatedTime: '15-25-min',
  },
  {
    id: '10x8',
    name: '10-8-grid',
    rows: 10,
    cols: 8,
    totalLogos: 80,
    difficulty: 'expert',
    estimatedTime: '25-40-min',
  },
];

export function getGridConfiguration(id: string): GridConfiguration {
  return gridConfigurations.find(config => config.id === id) || gridConfigurations[2]; // Default to 8x6
}
