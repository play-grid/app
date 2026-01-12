import type { Difficulty } from '@guess-logo/five-seconds';

export function normalizeDifficulty(diff: string): Difficulty {
  const normalized = diff.toLowerCase().trim();
  const map: Record<string, Difficulty> = {
    سهل: 'easy',
    وسط: 'medium',
    صعب: 'hard',
    easy: 'easy',
    medium: 'medium',
    hard: 'hard',
  };
  return map[normalized] || 'medium';
}
