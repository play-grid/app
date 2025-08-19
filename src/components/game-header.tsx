import type { GridConfiguration } from '@/lib/grid-configurations'
import type { LogoSetKey } from '@/lib/logo-data'
import type { Player } from '@/types'
import { Grid3X3, Plus, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface GameHeaderProps {
  selectedSet: LogoSetKey
  currentPlayer: 'A' | 'B'
  playerA: Player
  playerB: Player
  gridConfig: GridConfiguration
  onSwitchTurn: () => void
  onResetGame: () => void
  onStartNewGame?: () => void
}

export function GameHeader({
  selectedSet,
  currentPlayer,
  playerA,
  playerB,
  gridConfig,
  onSwitchTurn,
  onResetGame,
  onStartNewGame,
}: GameHeaderProps) {
  const { t } = useTranslation()
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{t('logo-guessing-game')}</h1>
          <Badge variant="secondary" className="capitalize">
            {selectedSet}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Grid3X3 className="w-3 h-3" />
            {gridConfig.name}
            -
            {gridConfig.difficulty}
          </Badge>
          {playerA.winner && (
            <Badge variant="default" className="bg-green-500 text-white animate-pulse">
              🎉

              {playerA.name}

              Found:

              {playerA.winner.name}
              {t('key')}
            </Badge>
          )}
          {playerB.winner && (
            <Badge variant="default" className="bg-green-500 text-white animate-pulse">
              🎉

              {playerB.name}

              Found:

              {playerB.winner.name}
              {t('key-0')}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onSwitchTurn}>
            {t('switch-turn')}
          </Button>
          {onStartNewGame && (
            <Button variant="outline" onClick={onStartNewGame}>
              <Plus className="w-4 h-4 mr-2" />
              {t('new-game')}
            </Button>
          )}
          <Button variant="outline" onClick={onResetGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('setup')}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant={currentPlayer === 'A' ? 'default' : 'secondary'} className="text-sm">
            {t('current-turn-player')}
            {currentPlayer}
          </Badge>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>
            {playerA.name}
            :
            {playerA.activeCount}
            /
            {gridConfig.totalLogos}
            {t('remaining')}
          </span>
          <span>
            {playerB.name}
            :
            {playerB.activeCount}
            /
            {gridConfig.totalLogos}
            {t('remaining')}
          </span>
        </div>
      </div>
    </div>
  )
}
