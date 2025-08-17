import type { GridConfiguration } from '@/lib/grid-configurations'
import type { LogoSetKey } from '@/lib/logo-data'
import type { Player } from '@/types'
import { Grid3X3, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Player interface to match the refactored game pag

interface GameHeaderProps {
  selectedSet: LogoSetKey
  currentPlayer: 'A' | 'B'
  playerA: Player
  playerB: Player
  gridConfig: GridConfiguration
  onSwitchTurn: () => void
  onResetGame: () => void
}

export function GameHeader({
  selectedSet,
  currentPlayer,
  playerA,
  playerB,
  gridConfig,
  onSwitchTurn,
  onResetGame,
}: GameHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Logo Guessing Game</h1>
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
              !
            </Badge>
          )}
          {playerB.winner && (
            <Badge variant="default" className="bg-green-500 text-white animate-pulse">
              🎉
              {playerB.name}
              Found:
              {playerB.winner.name}
              !
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onSwitchTurn}>
            Switch Turn
          </Button>
          <Button variant="outline" onClick={onResetGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant={currentPlayer === 'A' ? 'default' : 'secondary'} className="text-sm">
            Current Turn: Player
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
            remaining
          </span>
          <span>
            {playerB.name}
            :
            {playerB.activeCount}
            /
            {gridConfig.totalLogos}
            remaining
          </span>
        </div>
      </div>
    </div>
  )
}
