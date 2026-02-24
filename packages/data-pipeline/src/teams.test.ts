import type { APISportsStanding } from './sources/api-sports/types';
import { describe, expect, it } from 'vitest';
import { statItemInputSchema } from './schemas';

const mockTransformer = {
  source: 'api-sports' as const,
  category: 'football' as const,
  fetch: () => Promise.resolve([] as APISportsStanding[]),
  transform: (standing: APISportsStanding) => {
    const base = {
      entity: 'team' as const,
      externalId: String(standing.team.id),
      category: 'football' as const,
      name: standing.team.name,
      imageUrl: standing.team.logo,
      hint: standing.league.name,
      source: 'api-sports' as const,
    };

    return [
      {
        ...base,
        metricType: 'position',
        value: standing.rank,
        unit: 'league position',
      },
      {
        ...base,
        metricType: 'wins',
        value: standing.all.win,
        unit: 'wins this season',
      },
    ];
  },
};

describe('football Teams Transformer', () => {
  it('should transform team data correctly', () => {
    const mockStanding: APISportsStanding = {
      team: {
        id: 42,
        name: 'Manchester City',
        logo: 'https://example.com/mcfc.png',
      },
      league: {
        name: 'Premier League',
      },
      rank: 1,
      all: {
        win: 20,
      },
    };

    const result = mockTransformer.transform(mockStanding);

    expect(result).toHaveLength(2);

    result.forEach((item) => {
      expect(() => statItemInputSchema.parse(item)).not.toThrow();
    });

    const positionItem = result.find(i => i.metricType === 'position');
    expect(positionItem).toMatchObject({
      entity: 'team',
      externalId: '42',
      category: 'football',
      name: 'Manchester City',
      metricType: 'position',
      value: 1,
      unit: 'league position',
      imageUrl: 'https://example.com/mcfc.png',
      hint: 'Premier League',
      source: 'api-sports',
    });

    const winsItem = result.find(i => i.metricType === 'wins');
    expect(winsItem).toMatchObject({
      entity: 'team',
      externalId: '42',
      category: 'football',
      name: 'Manchester City',
      metricType: 'wins',
      value: 20,
      unit: 'wins this season',
      imageUrl: 'https://example.com/mcfc.png',
      hint: 'Premier League',
      source: 'api-sports',
    });
  });

  it('should have correct transformer metadata', () => {
    expect(mockTransformer.source).toBe('api-sports');
    expect(mockTransformer.category).toBe('football');
    expect(typeof mockTransformer.fetch).toBe('function');
    expect(typeof mockTransformer.transform).toBe('function');
  });
});
