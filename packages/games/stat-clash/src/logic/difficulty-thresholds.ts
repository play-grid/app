export interface DifficultyThresholds {
  easy: number;
  medium: number;
}

export const DIFFICULTY_THRESHOLDS: Record<string, DifficultyThresholds> = {
  football: { easy: 0.40, medium: 0.15 },
  companies: { easy: 0.60, medium: 0.25 },
  countries: { easy: 0.70, medium: 0.30 },
  mixed: { easy: 0.50, medium: 0.20 },
  default: { easy: 0.50, medium: 0.20 },
};

export function getThresholds(category: string): DifficultyThresholds {
  return DIFFICULTY_THRESHOLDS[category] ?? DIFFICULTY_THRESHOLDS.default;
}

export function getEffectiveDifficulty(
  baseDifficulty: 'easy' | 'medium' | 'hard',
  streak: number,
): 'easy' | 'medium' | 'hard' {
  if (streak >= 10)
    return 'hard';
  if (streak >= 5) {
    if (baseDifficulty === 'easy')
      return 'medium';
    return 'hard';
  }
  return baseDifficulty;
}
