import type { APISportsPlayer, APISportsStanding } from './types';
import { ExternalAPIBase } from '@guess-logo/data-provider/fetchers';

export class APISportsClient extends ExternalAPIBase {
  protected buildHeaders(inputHeaders?: HeadersInit): Headers {
    const headers = new Headers(inputHeaders);

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.apiKey) {
      headers.set('x-rapidapi-key', this.apiKey);
      headers.set('x-rapidapi-host', 'v3.football.api-sports.io');
    }

    return headers;
  }

  async getTopPlayersByLeagues(
    leagues: number[],
    options: { season: number; limit: number },
  ): Promise<APISportsPlayer[]> {
    const players: APISportsPlayer[] = [];

    for (const leagueId of leagues) {
      const data = await this.get<{
        response: APISportsPlayer[];
      }>(`/players/topscorers?league=${leagueId}&season=${options.season}`);

      players.push(...data.response.slice(0, options.limit));
    }

    return players;
  }

  async getStandings(
    leagues: number[],
    options: { season: number },
  ): Promise<APISportsStanding[]> {
    const standings: APISportsStanding[] = [];

    for (const leagueId of leagues) {
      const data = await this.get<{
        response: Array<{
          league: { name: string };
          standings: APISportsStanding[][];
        }>;
      }>(`/standings?league=${leagueId}&season=${options.season}`);

      standings.push(...data.response[0].standings[0]);
    }

    return standings;
  }
}
