import type { LogoSetKey } from '@/lib/logo-data'
import type { Player } from '@/types'
import { useState } from 'react'
import { useLocation } from 'wouter'
import { GameSetup } from '@/components/game-setup'
import { useLogoQuery } from '@/hooks/use-logo-query'
import { getGridConfiguration } from '@/lib/grid-configurations'
import { logoSets } from '@/lib/logo-data'

export function GameSetupPage() {
  const [, setLocation] = useLocation()
  const [selectedSet, setSelectedSet] = useState<LogoSetKey>('companies')
  const [selectedGrid, setSelectedGrid] = useState<string>('8x6')

  const [playerA, setPlayerA] = useState<Player>({
    name: '',
    logos: [],
    winner: null,
    activeCount: 0,
  })

  const [playerB, setPlayerB] = useState<Player>({
    name: '',
    logos: [],
    winner: null,
    activeCount: 0,
  })

  // Get logos for validation
  const gridConfig = getGridConfiguration(selectedGrid)
  const logoNames = logoSets[selectedSet]?.slice(0, gridConfig.totalLogos) || []
  const { data: fetchedLogos } = useLogoQuery(logoNames, selectedSet, true)

  const handleStartGame = () => {
    // Encode player names for URL safety
    const encodedPlayerA = encodeURIComponent(playerA.name.trim() || 'Player A')
    const encodedPlayerB = encodeURIComponent(playerB.name.trim() || 'Player B')

    // Navigate to game page with selected parameters and player names
    setLocation(`/game/${selectedSet}/${selectedGrid}/${encodedPlayerA}/${encodedPlayerB}`)
  }

  const handlePlayerANameChange = (name: string) => {
    setPlayerA(prev => ({ ...prev, name }))
  }

  const handlePlayerBNameChange = (name: string) => {
    setPlayerB(prev => ({ ...prev, name }))
  }

  return (
    <GameSetup
      selectedSet={selectedSet}
      onSetChange={setSelectedSet}
      selectedGrid={selectedGrid}
      onGridChange={setSelectedGrid}
      playerA={playerA}
      playerB={playerB}
      onPlayerANameChange={handlePlayerANameChange}
      onPlayerBNameChange={handlePlayerBNameChange}
      onStartGame={handleStartGame}
      canStart={!!fetchedLogos}
    />
  )
}
