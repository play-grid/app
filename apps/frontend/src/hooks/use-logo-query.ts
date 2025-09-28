import type { LogoItem, LogoSetKey, SupportedLanguage } from '@guess-logo/shared/types';
import { useQuery } from '@tanstack/react-query';
import { fetchCompanyLogo } from '@/services/companies/company-logo-service';
import { generateFlagUrl } from '@/services/countries/flag-logo-service';
import { fetchMoviePoster } from '@/services/movies/movie-poster-service';
import { fetchTeamLogoById } from '@/services/sport/sport-logo-service';

export function useLogoQuery(
  logoItems: LogoItem[],
  logoSet: LogoSetKey,
  language: SupportedLanguage,
  listId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ['logos', logoSet, listId, logoItems.length, language],
    queryFn: async () => {
      const logoPromises = logoItems.map(async (item) => {
        try {
          let imageUrl = `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(item.name)}`;
          const { name } = item;

          switch (logoSet) {
            case 'companies': {
              const companyUrl = await fetchCompanyLogo(name);
              imageUrl = companyUrl
                || `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(`${name} company logo`)}`;
              break;
            }
            case 'movies': {
              const movieUrl = await fetchMoviePoster(name, language);
              imageUrl = movieUrl
                || `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(`${name} movie poster`)}`;
              break;
            }
            case 'countries':
              imageUrl = generateFlagUrl(name);
              break;
            case 'sports': {
              if (item.id) {
                // Convert string ID to number if needed for the API
                const teamId = typeof item.id === 'string' ? Number.parseInt(item.id, 10) : item.id;
                if (!Number.isNaN(teamId)) {
                  const sportUrl = await fetchTeamLogoById(teamId);
                  imageUrl = sportUrl
                    || `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(`${name} sports logo`)}`;
                }
              }
              break;
            }
          }

          return { name, imageUrl, id: item.id };
        }
        catch (error) {
          console.error(`Failed to fetch logo for ${item.name}:`, error);
          return {
            name: item.name,
            imageUrl: `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(item.name)}`,
            id: item.id,
          };
        }
      });

      const results = await Promise.allSettled(logoPromises);
      return results.map((result, index) =>
        result.status === 'fulfilled'
          ? result.value
          : {
              name: logoItems[index].name,
              imageUrl: `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(logoItems[index].name)}`,
              id: logoItems[index].id,
            },
      );
    },
    enabled: enabled && logoItems.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnMount: false,
  });
}
