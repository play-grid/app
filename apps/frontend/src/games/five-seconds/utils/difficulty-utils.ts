import type { DBdifficulty } from '@playgrid/five-seconds';

export function normalizeDifficulty(diff: string): DBdifficulty {
  const normalized = diff.toLowerCase().trim();
  const map: Record<string, DBdifficulty> = {
    سهل: 'easy',
    وسط: 'medium',
    صعب: 'hard',
    easy: 'easy',
    medium: 'medium',
    hard: 'hard',
  };
  return map[normalized] || 'medium';
}
