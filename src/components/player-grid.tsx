'use client'

import type { GridConfiguration } from '@/lib/grid-configurations'
import type { LogoItem } from '@/lib/logo-data'
import { Badge } from '@/components/ui/badge'
import { LogoItemComponent } from './logo-item'

interface PlayerGridProps {
  player: 'A' | 'B'
  logos: LogoItem[]
  winner: LogoItem | null
  onToggleLogo: (logoId: number) => void
  gridConfig: GridConfiguration
}

export function PlayerGrid({
  player,
  logos,
  winner,
  onToggleLogo,
  gridConfig,
}: PlayerGridProps) {
  const activeLogos = logos.filter(logo => !logo.eliminated).length

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
          return (
            <LogoItemComponent
              key={logo.id}
              logo={logo}
              isWinner={winner?.id === logo.id}
              onToggle={() => onToggleLogo(logo.id)}
              isQueryLoading={false}
              hasQueryError={false}
            />
          )
        })}
      </div>
    </div>
  )
}
