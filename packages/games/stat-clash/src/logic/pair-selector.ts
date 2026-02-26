import type { DifficultyThresholds } from './difficulty-thresholds';
import type { GameStatItem, StatClashRound } from './schema';
import { getEffectiveDifficulty, getThresholds } from './difficulty-thresholds';

export interface PairSelectionConfig {
  category: string;
  metricType?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  streak: number;
  excludeIds: string[];
}

export function selectPair(
  items: GameStatItem[],
  config: PairSelectionConfig,
): [GameStatItem, GameStatItem] | null {
  const available = items.filter(item => !config.excludeIds.includes(item.id));

  const pool = config.metricType
    ? available.filter(item => item.metricType === config.metricType)
    : available;

  if (pool.length < 2)
    return null;

  const effectiveDifficulty = getEffectiveDifficulty(config.difficulty, config.streak);
  const thresholds = getThresholds(config.category);

  const target = samplePairsByDifficulty(pool, effectiveDifficulty, thresholds);

  if (!target)
    return null;

  return Math.random() > 0.5
    ? [target[0], target[1]]
    : [target[1], target[0]];
}

function samplePairsByDifficulty(
  pool: GameStatItem[],
  difficulty: 'easy' | 'medium' | 'hard',
  thresholds: DifficultyThresholds,
): [GameStatItem, GameStatItem] | null {
  let selected: [GameStatItem, GameStatItem] | null = null;
  let count = 0;

  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      const a = pool[i];
      const b = pool[j];
      const diff = percentDiff(a.value, b.value);

      if (!matchesDifficulty(diff, difficulty, thresholds))
        continue;

      count++;
      if (Math.random() < 1 / count) {
        selected = [a, b];
      }
    }
  }

  if (!selected) {
    selected = fallbackPair(pool);
  }

  return selected;
}

function percentDiff(a: number, b: number): number {
  const max = Math.max(Math.abs(a), Math.abs(b));
  if (max === 0)
    return 0;
  return Math.abs(a - b) / max;
}

function matchesDifficulty(
  diff: number,
  difficulty: 'easy' | 'medium' | 'hard',
  t: DifficultyThresholds,
): boolean {
  switch (difficulty) {
    case 'easy':
      return diff >= t.easy;
    case 'medium':
      return diff >= t.medium && diff < t.easy;
    case 'hard':
      return diff < t.medium;
  }
}

function fallbackPair(pool: GameStatItem[]): [GameStatItem, GameStatItem] | null {
  if (pool.length < 2)
    return null;
  const i = Math.floor(Math.random() * pool.length);
  let j = Math.floor(Math.random() * (pool.length - 1));
  if (j >= i)
    j++;
  return [pool[i], pool[j]];
}

export function buildRound(
  pair: [GameStatItem, GameStatItem],
): StatClashRound {
  const [left, right] = pair;
  const higherSide = left.value > right.value ? 'left' : 'right';

  return {
    leftItem: {
      id: left.id,
      name: left.name,
      nameAr: left.nameAr,
      value: left.value,
      unit: left.unit,
      unitAr: left.unitAr,
      imageUrl: left.imageUrl,
      hint: left.hint,
      hintAr: left.hintAr,
      entity: left.entity,
    },
    rightItem: {
      id: right.id,
      name: right.name,
      nameAr: right.nameAr,
      value: right.value,
      unit: right.unit,
      unitAr: right.unitAr,
      imageUrl: right.imageUrl,
      hint: right.hint,
      hintAr: right.hintAr,
      entity: right.entity,
    },
    higherSide,
    revealed: false,
  };
}
