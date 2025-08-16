'use client'

import type { GridConfiguration } from '@/lib/grid-configurations'
import type { LogoItem } from '@/lib/logo-data'
import { Badge } from '@/components/ui/badge'
import { useLogoQuery } from '@/hooks/use-logo-query'
import { LogoItemComponent } from './logo-item'

interface PlayerGridProps {
  player: 'A' | 'B'
  logos: LogoItem[]
  winner: LogoItem | null
  onToggleLogo: (logoId: number) => void
  gridConfig: GridConfiguration
  logoSet: string
}

export function PlayerGrid({ player, logos, winner, onToggleLogo, gridConfig, logoSet }: PlayerGridProps) {
  const activeLogos = logos.filter(logo => !logo.eliminated).length

  const logoNames = logos.map(logo => logo.name)
  const { data: fetchedLogos, isLoading, error } = useLogoQuery(logoNames, logoSet as any, logoNames.length > 0)

  // Create a map of fetched logo URLs for quick lookup
  const logoUrlMap = new Map(fetchedLogos?.map(item => [item.name, item.imageUrl]) || [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Player
          {' '}
          {player}
        </h2>
        <Badge variant="outline">
          {activeLogos}
          {' '}
          /
          {gridConfig.totalLogos}
        </Badge>
      </div>
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${gridConfig.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridConfig.rows}, minmax(0, 1fr))`,
        }}
      >
        {logos.map((logo) => {
          const fetchedImageUrl = logoUrlMap.get(logo.name)
          const logoWithFetchedUrl = {
            ...logo,
            imageUrl: fetchedImageUrl || logo.imageUrl,
          }

          return (
            <LogoItemComponent
              key={logo.id}
              logo={logoWithFetchedUrl}
              isWinner={winner?.id === logo.id}
              onToggle={() => onToggleLogo(logo.id)}
              isQueryLoading={isLoading}
              hasQueryError={!!error}
            />
          )
        })}
      </div>
    </div>
  )
}
