import type { LogoItem, LogoList } from '@/types/logo-item';
import type { SupportedLanguage } from '@/utils/language-utils';
import leagues from '@/data/leagues.json';
import teams from '@/data/teams.json';

function createLeagueFetcher(leagueId: number) {
  return async (_language: SupportedLanguage): Promise<LogoItem[]> => {
    return teams
      .filter(team => team.leagueId === leagueId)
      .map(team => ({
        id: team.id,
        name: team.name,
        imageUrl: team.logo,
        eliminated: false,
      }));
  };
}

export const sportLists: LogoList[] = leagues.map(league => ({
  id: String(league.id),
  name: league.name,
  fetchItems: createLeagueFetcher(league.id),
}));
