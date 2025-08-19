import type { GridConfiguration } from '@/lib/grid-configurations'
import type { Player } from '@/types'
import { Badge } from '@/components/ui/badge'
import { LogoItemComponent } from './logo-item'

interface PlayerGridProps {
  player: Player
  onToggleLogo: (logoId: number) => void
  gridConfig: GridConfiguration
}

export function PlayerGrid({ player, onToggleLogo, gridConfig }: PlayerGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{player.name}</h2>
        <Badge variant="outline">
          {player.activeCount}
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
        {player.logos.map((logo) => {
          return (
            <LogoItemComponent
              key={logo.id}
              logo={logo}
              isWinner={player.winner?.id === logo.id}
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
