'use client'

import type { LogoItem } from '@/lib/logo-data'
import { Trophy, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { fetchCompanyLogo } from '@/services/company-service'
import { fetchMoviePoster } from '@/services/movie-service'

interface LogoItemProps {
  logo: LogoItem
  isWinner: boolean
  onToggle: () => void
}

export function LogoItemComponent({ logo, isWinner, onToggle }: LogoItemProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string>('')

  useEffect(() => {
    const resolveImageUrl = async () => {
      try {
        setImageLoading(true)

        if (logo.imageUrl.includes('api.logo.dev')) {
          // Extract company name from the URL
          const urlParams = new URLSearchParams(logo.imageUrl.split('?')[1])
          const companyName = urlParams.get('q') || ''
          const logoUrl = await fetchCompanyLogo(companyName)

          if (logoUrl) {
            setResolvedImageUrl(logoUrl)
          }
          else {
            setImageError(true)
          }
        }
        else if (logo.imageUrl.includes('api.themoviedb.org')) {
          // Extract movie name from the URL
          const urlParams = new URLSearchParams(logo.imageUrl.split('?')[1])
          const movieName = urlParams.get('query') || ''
          const posterUrl = await fetchMoviePoster(movieName)

          if (posterUrl) {
            setResolvedImageUrl(posterUrl)
          }
          else {
            setImageError(true)
          }
        }
        else {
          // For flag URLs and other direct image URLs
          setResolvedImageUrl(logo.imageUrl)
        }
      }
      catch (error) {
        console.error('Error resolving image URL:', error)
        setImageError(true)
      }
      finally {
        setImageLoading(false)
      }
    }

    resolveImageUrl()
  }, [logo.imageUrl])

  return (
    <Card
      className={`aspect-square p-2 cursor-pointer transition-all hover:shadow-md ${
        logo.eliminated ? 'bg-destructive/10 border-destructive/20' : 'hover:shadow-lg hover:-translate-y-0.5'
      } ${isWinner ? 'animate-bounce bg-green-100 border-green-400 border-2 shadow-lg' : ''}`}
      onClick={onToggle}
    >
      <div className="h-full flex items-center justify-center relative">
        {!imageError && resolvedImageUrl
          ? (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={resolvedImageUrl || '/placeholder.svg'}
                  alt={logo.name}
                  className={`max-w-full max-h-full object-contain transition-opacity ${
                    logo.eliminated ? 'opacity-30 grayscale' : ''
                  } ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true)
                    setImageLoading(false)
                  }}
                />
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            )
          : (
              <span
                className={`text-xs text-center font-medium leading-tight ${
                  logo.eliminated ? 'text-destructive line-through' : 'text-card-foreground'
                } ${isWinner ? 'text-green-700 font-bold' : ''}`}
              >
                {logo.name}
              </span>
            )}

        {logo.eliminated && (
          <X className="absolute top-1 right-1 w-4 h-4 text-destructive bg-white rounded-full p-0.5" />
        )}
        {isWinner && (
          <Trophy className="absolute top-1 left-1 w-4 h-4 text-green-600 animate-pulse bg-white rounded-full p-0.5" />
        )}
      </div>
    </Card>
  )
}
