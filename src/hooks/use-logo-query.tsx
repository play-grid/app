import type { LogoSetKey, SportsLogoItem } from '@/lib/logo-data'
import { useQuery } from '@tanstack/react-query'
import { fetchCompanyLogo } from '@/services/company-service'
import { generateFlagUrl } from '@/services/flag-service'
import { fetchMoviePoster } from '@/services/movie-service'
import { fetchTeamLogoById } from '@/services/sport-service'

export function useLogoQuery(logoNames: string[] | SportsLogoItem[], logoSet: LogoSetKey, enabled = true) {
  return useQuery({
    queryKey: ['logos', logoSet, logoNames.length],
    queryFn: async () => {
      const logoPromises = logoNames.map(async (item) => {
        try {
          let imageUrl = `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(item as string)}`
          let name = item as string

          switch (logoSet) {
            case 'companies': {
              const companyUrl = await fetchCompanyLogo(name)
              imageUrl
                = companyUrl
                  || `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(`${name} company logo`)}`
              break
            }
            case 'movies': {
              const movieUrl = await fetchMoviePoster(name)
              imageUrl
                = movieUrl || `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(`${name} movie poster`)}`
              break
            }
            case 'countries':
              imageUrl = generateFlagUrl(name)
              break
            case 'sports':{
              // Here's the key change: we now get the ID from the item object
              const teamItem = item as SportsLogoItem
              name = teamItem.name
              const sportUrl = await fetchTeamLogoById(teamItem.id)
              imageUrl = sportUrl || `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(`${name} sports logo`)}`
              break
            }
          }

          return { name, imageUrl }
        }
        catch (error) {
          console.error(`Failed to fetch logo for ${name}:`, error)
          return { name, imageUrl: `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(name)}` }
        }
      })

      const results = await Promise.allSettled(logoPromises)
      return results.map((result, index) =>
        result.status === 'fulfilled' ? result.value : { name: logoNames[index] as string, imageUrl: `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(logoNames[index] as string)}` },
      )
    },
    enabled: enabled && logoNames.length > 0,
    staleTime: 10 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
  })
}
