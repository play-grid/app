import type { APISportsPlayer } from '../sources/api-sports/types';
import type { StatItemTransformer } from '../types';
import { APISportsClient } from '../sources/api-sports';

export interface FootballPlayersTransformerConfig {
  apiKey: string;
}

export function createFootballPlayersTransformer(config: FootballPlayersTransformerConfig): StatItemTransformer<APISportsPlayer> {
  const client = new APISportsClient({
    baseUrl: 'https://v3.football.api-sports.io',
    apiKey: config.apiKey,
  });

  return {
    source: 'api-sports',
    category: 'football',

    async fetch() {
      const leagues = [39, 140, 78, 135, 61];
      return client.getTopPlayersByLeagues(leagues, { season: 2024, limit: 20 });
    },

    transform(player) {
      const base = {
        entity: 'player',
        externalId: String(player.player.id),
        category: 'football',
        name: player.player.name,
        imageUrl: player.player.photo,
        hint: player.statistics[0]?.team?.name,
        source: 'api-sports',
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
}

export const footballPlayersTransformer = createFootballPlayersTransformer({ apiKey: '' });
