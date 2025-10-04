import type { LogoItem, LogoList, SupportedLanguage } from '@guess-logo/shared/types';
import { leagues, teams } from '@guess-logo/shared/data';

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
// todo fix sport Lists
export const sportLists: LogoList[] = leagues.map(league => ({
  id: String(league.id),
  name: {
    en: league.name,
    ar: league.name,
  },
  fetchItems: createLeagueFetcher(league.id),
}));
