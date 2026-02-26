import type { GameStatItem } from '../schema';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildRound, selectPair } from '../pair-selector';

describe('pair Selector', () => {
  let mockItems: GameStatItem[];
  let mathRandomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockItems = [
      {
        id: '1',
        entity: 'player',
        name: 'Player A',
        nameAr: null,
        metricType: 'goals',
        value: 100,
        unit: 'goals',
        unitAr: null,
        imageUrl: null,
        hint: null,
        hintAr: null,
      },
      {
        id: '2',
        entity: 'player',
        name: 'Player B',
        nameAr: null,
        metricType: 'goals',
        value: 200,
        unit: 'goals',
        unitAr: null,
        imageUrl: null,
        hint: null,
        hintAr: null,
      },
      {
        id: '3',
        entity: 'player',
        name: 'Player C',
        nameAr: null,
        metricType: 'goals',
        value: 50,
        unit: 'goals',
        unitAr: null,
        imageUrl: null,
        hint: null,
        hintAr: null,
      },
      {
        id: '4',
        entity: 'player',
        name: 'Player D',
        nameAr: null,
        metricType: 'goals',
        value: 10,
        unit: 'goals',
        unitAr: null,
        imageUrl: null,
        hint: null,
        hintAr: null,
      },
    ];

    mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });

  describe('selectPair', () => {
    it('should return null for empty pool', () => {
      const result = selectPair([], {
        category: 'football',
        difficulty: 'easy',
        streak: 0,
        excludeIds: [],
      });

      expect(result).toBeNull();
    });

    it('should return null when pool has only 1 item', () => {
      const result = selectPair([mockItems[0]], {
        category: 'football',
        difficulty: 'easy',
        streak: 0,
        excludeIds: [],
      });

      expect(result).toBeNull();
    });

    it('should exclude items in excludeIds', () => {
      const result = selectPair(mockItems, {
        category: 'football',
        difficulty: 'easy',
        streak: 0,
        excludeIds: ['1', '2'],
      });

      expect(result).not.toBeNull();
      if (result) {
        expect([result[0].id, result[1].id]).not.toContain('1');
        expect([result[0].id, result[1].id]).not.toContain('2');
      }
    });

    it('should return null when all items are excluded', () => {
      const result = selectPair(mockItems, {
        category: 'football',
        difficulty: 'easy',
        streak: 0,
        excludeIds: ['1', '2', '3', '4'],
      });

      expect(result).toBeNull();
    });

    it('should filter by metricType when provided', () => {
      const mixedItems: GameStatItem[] = [
        ...mockItems,
        {
          id: '5',
          entity: 'player',
          name: 'Player E',
          nameAr: null,
          metricType: 'assists',
          value: 30,
          unit: 'assists',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(mixedItems, {
        category: 'football',
        metricType: 'goals',
        difficulty: 'easy',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
      if (result) {
        expect(result[0].metricType).toBe('goals');
        expect(result[1].metricType).toBe('goals');
      }
    });

    it('should not filter by metricType when not provided', () => {
      const mixedItems: GameStatItem[] = [
        ...mockItems,
        {
          id: '5',
          entity: 'player',
          name: 'Player E',
          nameAr: null,
          metricType: 'assists',
          value: 30,
          unit: 'assists',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(mixedItems, {
        category: 'football',
        difficulty: 'easy',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
    });

    it('should randomize left/right position', () => {
      mathRandomSpy.mockReturnValueOnce(0.3);
      const result1 = selectPair(mockItems, {
        category: 'football',
        difficulty: 'easy',
        streak: 0,
        excludeIds: [],
      });

      mathRandomSpy.mockReturnValueOnce(0.7);
      const result2 = selectPair(mockItems, {
        category: 'football',
        difficulty: 'easy',
        streak: 0,
        excludeIds: [],
      });

      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
      if (result1 && result2) {
        expect(result1[0].id).not.toBe(result1[1].id);
        expect(result2[0].id).not.toBe(result2[1].id);
      }
    });

    it('should select easy pair when difficulty is easy and streak is low', () => {
      const easyItems: GameStatItem[] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 2000,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(easyItems, {
        category: 'football',
        difficulty: 'easy',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
    });

    it('should use difficulty progression based on streak', () => {
      const mediumItems: GameStatItem[] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 200,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(mediumItems, {
        category: 'football',
        difficulty: 'easy',
        streak: 7,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
    });
  });

  describe('percentage Difference', () => {
    it('should return 0 for equal values', () => {
      const items: GameStatItem[] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(items, {
        category: 'football',
        difficulty: 'hard',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
    });

    it('should return 0 for both zero values', () => {
      const items: GameStatItem[] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: 0,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 0,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(items, {
        category: 'football',
        difficulty: 'hard',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
    });

    it('should handle one zero value', () => {
      const items: GameStatItem[] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: 0,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(items, {
        category: 'football',
        difficulty: 'easy',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
    });

    it('should calculate correct percentage for large differences', () => {
      const items: GameStatItem[] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 2000,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(items, {
        category: 'football',
        difficulty: 'easy',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
    });

    it('should calculate correct percentage for small differences', () => {
      const items: GameStatItem[] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 115,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(items, {
        category: 'football',
        difficulty: 'medium',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
    });

    it('should handle negative values correctly', () => {
      const items: GameStatItem[] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: -100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: -200,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(items, {
        category: 'football',
        difficulty: 'easy',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
    });

    it('should handle mixed positive and negative values', () => {
      const items: GameStatItem[] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: -100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(items, {
        category: 'football',
        difficulty: 'easy',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
    });
  });

  describe('difficulty Matching', () => {
    it('should match easy pairs for football (>= 40% diff)', () => {
      const easyItems: GameStatItem[] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 200,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(easyItems, {
        category: 'football',
        difficulty: 'easy',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
    });

    it('should match medium pairs for football (15-40% diff)', () => {
      const mediumItems: GameStatItem[] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 120,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(mediumItems, {
        category: 'football',
        difficulty: 'medium',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
    });

    it('should match hard pairs for football (< 15% diff)', () => {
      const hardItems: GameStatItem[] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 110,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(hardItems, {
        category: 'football',
        difficulty: 'hard',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
    });

    it('should use default thresholds for unknown category', () => {
      const defaultItems: GameStatItem[] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 200,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(defaultItems, {
        category: 'unknown',
        difficulty: 'easy',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
    });

    it('should handle boundary at exact threshold', () => {
      const boundaryItems: GameStatItem[] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 140,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(boundaryItems, {
        category: 'football',
        difficulty: 'medium',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
    });
  });

  describe('fallback Pair Selection', () => {
    it('should use fallback when no pairs match difficulty', () => {
      const hardItemsOnly: GameStatItem[] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 110,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(hardItemsOnly, {
        category: 'football',
        difficulty: 'easy',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
    });

    it('should return null when fallback cannot find pair (empty pool)', () => {
      const result = selectPair([], {
        category: 'football',
        difficulty: 'easy',
        streak: 0,
        excludeIds: [],
      });

      expect(result).toBeNull();
    });
  });

  describe('buildRound', () => {
    it('should build round with higherSide left when left value is higher', () => {
      const pair: [GameStatItem, GameStatItem] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: 'لاعب أ',
          metricType: 'goals',
          value: 200,
          unit: 'goals',
          unitAr: 'أهداف',
          imageUrl: 'https://example.com/a.jpg',
          hint: 'Team A',
          hintAr: 'فريق أ',
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: 'لاعب ب',
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: 'أهداف',
          imageUrl: 'https://example.com/b.jpg',
          hint: 'Team B',
          hintAr: 'فريق ب',
        },
      ];

      const round = buildRound(pair);

      expect(round.higherSide).toBe('left');
      expect(round.leftItem.value).toBe(200);
      expect(round.rightItem.value).toBe(100);
      expect(round.leftItem.name).toBe('Player A');
      expect(round.rightItem.name).toBe('Player B');
      expect(round.leftItem.nameAr).toBe('لاعب أ');
      expect(round.rightItem.nameAr).toBe('لاعب ب');
      expect(round.revealed).toBe(false);
    });

    it('should build round with higherSide right when right value is higher', () => {
      const pair: [GameStatItem, GameStatItem] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 200,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const round = buildRound(pair);

      expect(round.higherSide).toBe('right');
      expect(round.leftItem.value).toBe(100);
      expect(round.rightItem.value).toBe(200);
    });

    it('should set higherSide to left when values are equal', () => {
      const pair: [GameStatItem, GameStatItem] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const round = buildRound(pair);

      expect(['left', 'right']).toContain(round.higherSide);
    });

    it('should copy all item fields correctly', () => {
      const pair: [GameStatItem, GameStatItem] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: 'لاعب أ',
          metricType: 'goals',
          value: 200,
          unit: 'goals',
          unitAr: 'أهداف',
          imageUrl: 'https://example.com/a.jpg',
          hint: 'Team A',
          hintAr: 'فريق أ',
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: 'لاعب ب',
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: 'أهداف',
          imageUrl: 'https://example.com/b.jpg',
          hint: 'Team B',
          hintAr: 'فريق ب',
        },
      ];

      const round = buildRound(pair);

      expect(round.leftItem).toMatchObject({
        id: '1',
        entity: 'player',
        name: 'Player A',
        nameAr: 'لاعب أ',
        value: 200,
        unit: 'goals',
        unitAr: 'أهداف',
        imageUrl: 'https://example.com/a.jpg',
        hint: 'Team A',
        hintAr: 'فريق أ',
      });

      expect(round.rightItem).toMatchObject({
        id: '2',
        entity: 'player',
        name: 'Player B',
        nameAr: 'لاعب ب',
        value: 100,
        unit: 'goals',
        unitAr: 'أهداف',
        imageUrl: 'https://example.com/b.jpg',
        hint: 'Team B',
        hintAr: 'فريق ب',
      });
    });

    it('should set revealed to false by default', () => {
      const pair: [GameStatItem, GameStatItem] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: 200,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const round = buildRound(pair);

      expect(round.revealed).toBe(false);
    });
  });

  describe('edge Cases', () => {
    it('should handle very large pools (80+ items)', () => {
      const largePool: GameStatItem[] = Array.from({ length: 80 }, (_, i) => ({
        id: `item-${i}`,
        entity: 'player',
        name: `Player ${i}`,
        nameAr: null,
        metricType: 'goals',
        value: i * 10,
        unit: 'goals',
        unitAr: null,
        imageUrl: null,
        hint: null,
        hintAr: null,
      }));

      const result = selectPair(largePool, {
        category: 'football',
        difficulty: 'easy',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
      if (result) {
        expect(result[0].id).not.toBe(result[1].id);
      }
    });

    it('should handle minimal pool (exactly 2 items)', () => {
      const minimalPool: GameStatItem[] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 200,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(minimalPool, {
        category: 'football',
        difficulty: 'easy',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
      if (result) {
        expect(result[0].id).not.toBe(result[1].id);
      }
    });

    it('should handle different value scales (billions vs millions)', () => {
      const differentScales: GameStatItem[] = [
        {
          id: '1',
          entity: 'company',
          name: 'Company A',
          nameAr: null,
          metricType: 'market-cap',
          value: 3900000000000,
          unit: 'billion $',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'company',
          name: 'Company B',
          nameAr: null,
          metricType: 'market-cap',
          value: 1000000000,
          unit: 'billion $',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(differentScales, {
        category: 'companies',
        difficulty: 'easy',
        streak: 0,
        excludeIds: [],
      });

      expect(result).not.toBeNull();
    });

    it('should return same pair when excluding only non-matching items', () => {
      const pool: GameStatItem[] = [
        {
          id: '1',
          entity: 'player',
          name: 'Player A',
          nameAr: null,
          metricType: 'goals',
          value: 100,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '2',
          entity: 'player',
          name: 'Player B',
          nameAr: null,
          metricType: 'goals',
          value: 200,
          unit: 'goals',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
        {
          id: '3',
          entity: 'player',
          name: 'Player C',
          nameAr: null,
          metricType: 'assists',
          value: 50,
          unit: 'assists',
          unitAr: null,
          imageUrl: null,
          hint: null,
          hintAr: null,
        },
      ];

      const result = selectPair(pool, {
        category: 'football',
        metricType: 'goals',
        difficulty: 'easy',
        streak: 0,
        excludeIds: ['3'],
      });

      expect(result).not.toBeNull();
      if (result) {
        expect([result[0].id, result[1].id]).not.toContain('3');
        expect(result[0].metricType).toBe('goals');
        expect(result[1].metricType).toBe('goals');
      }
    });
  });
});
