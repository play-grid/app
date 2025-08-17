import type { LogoSetKey } from '@/lib/logo-data'
import { useQuery } from '@tanstack/react-query'
import { fetchCompanyLogo } from '@/services/company-service'
import { generateFlagUrl } from '@/services/flag-service'
import { fetchMoviePoster } from '@/services/movie-service'

export function useLogoQuery(logoNames: string[], logoSet: LogoSetKey, enabled = true) {
  return useQuery({
    queryKey: ['logos', logoSet, logoNames.length],
    queryFn: async () => {
      const logoPromises = logoNames.map(async (name) => {
        try {
          let imageUrl = `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(name)}`
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
            case 'sports':
              imageUrl = `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(`${name} sports logo`)}`
              break
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
        result.status === 'fulfilled' ? result.value : { name: logoNames[index], imageUrl: logoNames[index] },
      )
    },
    enabled: enabled && logoNames.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
  })
}
