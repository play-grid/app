import type { APISportsStanding } from '../sources/api-sports/types';
import type { StatItemTransformer } from '../types';
import { APISportsClient } from '../sources/api-sports';

export interface FootballTeamsTransformerConfig {
  apiKey: string;
}

export function createFootballTeamsTransformer(config: FootballTeamsTransformerConfig): StatItemTransformer<APISportsStanding> {
  const client = new APISportsClient({
    baseUrl: 'https://v3.football.api-sports.io',
    apiKey: config.apiKey,
  });

  return {
    source: 'api-sports',
    category: 'football',

    async fetch() {
      const leagues = [39, 140, 78, 135, 61];
      return client.getStandings(leagues, { season: 2024 });
    },

    transform(standing) {
      const base = {
        entity: 'team',
        externalId: String(standing.team?.id),
        category: 'football',
        name: standing.team?.name ?? 'Unknown Team',
        imageUrl: standing.team?.logo,
        hint: standing.league?.name,
        source: 'api-sports',
      };

      return [
        {
          ...base,
          metricType: 'position',
          value: standing.rank ?? 0,
          unit: 'league position',
        },
        {
          ...base,
          metricType: 'wins',
          value: standing.all?.win ?? 0,
          unit: 'wins this season',
        },
      ];
    },
  };
}

export const footballTeamsTransformer = createFootballTeamsTransformer({ apiKey: '' });
