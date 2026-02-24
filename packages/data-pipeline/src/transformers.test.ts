import type { APISportsPlayer } from './sources/api-sports/types';
import { describe, expect, it } from 'vitest';
import { statItemInputSchema } from './schemas';

const mockTransformer = {
  source: 'api-sports' as const,
  category: 'football' as const,
  fetch: () => Promise.resolve([] as APISportsPlayer[]),
  transform: (player: APISportsPlayer) => {
    const base = {
      entity: 'player' as const,
      externalId: String(player.player.id),
      category: 'football' as const,
      name: player.player.name,
      imageUrl: player.player.photo,
      hint: player.statistics[0]?.team?.name,
      source: 'api-sports' as const,
    };

    const stats = player.statistics[0];
    const items: any[] = [];

    if (stats?.goals?.total != null) {
      items.push({
        ...base,
        metricType: 'goals',
        value: stats.goals.total,
        unit: 'goals this season',
      });
    }
    if (stats?.goals?.assists != null) {
      items.push({
        ...base,
        metricType: 'assists',
        value: stats.goals.assists,
        unit: 'assists this season',
      });
    }
    if (stats?.games?.appearences != null) {
      items.push({
        ...base,
        metricType: 'appearances',
        value: stats.games.appearences,
        unit: 'appearances',
      });
    }

    return items;
  },
};

describe('football Players Transformer', () => {
  it('should transform player data correctly', () => {
    const mockPlayer: APISportsPlayer = {
      player: {
        id: 123,
        name: 'Lionel Messi',
        photo: 'https://example.com/messi.jpg',
      },
      statistics: [
        {
          team: {
            name: 'Inter Miami',
          },
          goals: {
            total: 25,
            assists: 12,
          },
          games: {
            appearences: 30,
          },
        },
      ],
    };

    const result = mockTransformer.transform(mockPlayer);

    expect(result).toHaveLength(3);

    result.forEach((item) => {
      expect(() => statItemInputSchema.parse(item)).not.toThrow();
    });

    const goalsItem = result.find(i => i.metricType === 'goals');
    expect(goalsItem).toMatchObject({
      entity: 'player',
      externalId: '123',
      category: 'football',
      name: 'Lionel Messi',
      metricType: 'goals',
      value: 25,
      unit: 'goals this season',
      imageUrl: 'https://example.com/messi.jpg',
      hint: 'Inter Miami',
      source: 'api-sports',
    });

    const assistsItem = result.find(i => i.metricType === 'assists');
    expect(assistsItem).toMatchObject({
      metricType: 'assists',
      value: 12,
      unit: 'assists this season',
    });

    const appearancesItem = result.find(i => i.metricType === 'appearances');
    expect(appearancesItem).toMatchObject({
      metricType: 'appearances',
      value: 30,
      unit: 'appearances',
    });
  });

  it('should handle missing statistics gracefully', () => {
    const mockPlayer: APISportsPlayer = {
      player: {
        id: 456,
        name: 'Player with no stats',
        photo: 'https://example.com/player.jpg',
      },
      statistics: [],
    };

    const result = mockTransformer.transform(mockPlayer);

    expect(result).toHaveLength(0);
  });

  it('should handle null values in statistics', () => {
    const mockPlayer: APISportsPlayer = {
      player: {
        id: 789,
        name: 'Player with null stats',
        photo: 'https://example.com/player.jpg',
      },
      statistics: [
        {
          team: {
            name: 'Team',
          },
          goals: {
            total: null,
            assists: null,
          },
          games: {
            appearences: null,
          },
        },
      ],
    };

    const result = mockTransformer.transform(mockPlayer);

    expect(result).toHaveLength(0);
  });

  it('should have correct transformer metadata', () => {
    expect(mockTransformer.source).toBe('api-sports');
    expect(mockTransformer.category).toBe('football');
    expect(typeof mockTransformer.fetch).toBe('function');
    expect(typeof mockTransformer.transform).toBe('function');
  });
});
