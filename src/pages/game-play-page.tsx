import type { LogoSetKey } from '@/lib/logo-data'
import type { LogoItem, Player } from '@/types'
import { useEffect, useState } from 'react'
import { useLocation, useRoute } from 'wouter'
import { GameHeader } from '@/components/game-header'
import { GameInstructions } from '@/components/game-instructions'
import { PlayerGrid } from '@/components/player-grid'
import { Button } from '@/components/ui/button'
import { useLogoQuery } from '@/hooks/use-logo-query'
import { getGridConfiguration } from '@/lib/grid-configurations'
import { logoSets } from '@/lib/logo-data'

export function GamePlayPage() {
  const [, setLocation] = useLocation()
  const [match, params] = useRoute('/game/:logoSet/:gridSize/:playerA/:playerB')

  // Extract params with defaults and decode player names
  const logoSet = (params?.logoSet as LogoSetKey) || 'companies'
  const gridSize = params?.gridSize || '8x6'
  const playerAName = decodeURIComponent(params?.playerA || 'Player A')
  const playerBName = decodeURIComponent(params?.playerB || 'Player B')

  // Game state
  const [playerA, setPlayerA] = useState<Player>({
    name: playerAName,
    logos: [],
    winner: null,
    activeCount: 0,
  })

  const [playerB, setPlayerB] = useState<Player>({
    name: playerBName,
    logos: [],
    winner: null,
    activeCount: 0,
  })

  const [currentPlayer, setCurrentPlayer] = useState<'A' | 'B'>('A')
  const [gameInitialized, setGameInitialized] = useState(false)

  // Get configuration
  const gridConfig = getGridConfiguration(gridSize)
  const logoNames = logoSets[logoSet]?.slice(0, gridConfig.totalLogos) || []

  // Fetch logos
  const { data: fetchedLogos, isLoading, error } = useLogoQuery(logoNames, logoSet, true)

  // Helper function to calculate active logos and winner
  const calculatePlayerStats = (logos: LogoItem[]) => {
    const activeLogos = logos.filter(logo => !logo.eliminated)
    return {
      activeCount: activeLogos.length,
      winner: activeLogos.length === 1 && logos.length > 0 ? activeLogos[0] : null,
    }
  }

  // Initialize game when logos are loaded
  useEffect(() => {
    if (fetchedLogos && !gameInitialized) {
      const initialLogos: LogoItem[] = fetchedLogos.map((fetchedLogo, index) => ({
        id: index + 1,
        name: fetchedLogo.name,
        imageUrl: fetchedLogo.imageUrl,
        eliminated: false,
      }))

      const stats = calculatePlayerStats(initialLogos)

      setPlayerA(prev => ({
        ...prev,
        logos: [...initialLogos],
        ...stats,
      }))

      setPlayerB(prev => ({
        ...prev,
        logos: [...initialLogos],
        ...stats,
      }))

      setGameInitialized(true)
    }
  }, [fetchedLogos, gameInitialized])

  // Update player stats when logos change
  useEffect(() => {
    const playerAStats = calculatePlayerStats(playerA.logos)
    setPlayerA(prev => ({ ...prev, ...playerAStats }))
  }, [playerA.logos])

  useEffect(() => {
    const playerBStats = calculatePlayerStats(playerB.logos)
    setPlayerB(prev => ({ ...prev, ...playerBStats }))
  }, [playerB.logos])

  // Redirect to setup if invalid params
  if (!match || !logoSets[logoSet]) {
    setLocation('/')
    return null
  }

  const togglePlayerALogo = (logoId: number) => {
    setPlayerA(prev => ({
      ...prev,
      logos: prev.logos.map(logo =>
        logo.id === logoId ? { ...logo, eliminated: !logo.eliminated } : logo,
      ),
    }))
  }

  const togglePlayerBLogo = (logoId: number) => {
    setPlayerB(prev => ({
      ...prev,
      logos: prev.logos.map(logo =>
        logo.id === logoId ? { ...logo, eliminated: !logo.eliminated } : logo,
      ),
    }))
  }

  const switchTurn = () => {
    setCurrentPlayer(prev => (prev === 'A' ? 'B' : 'A'))
  }

  const resetGame = () => {
    setLocation('/')
  }

  // Show loading state
  if (isLoading || !gameInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">
            Loading game for
            {' '}
            {playerA.name}
            {' '}
            vs
            {' '}
            {playerB.name}
          </p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500 mb-4">Failed to load logos</p>
          <Button
            onClick={resetGame}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Back to Setup
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <GameHeader
        selectedSet={logoSet}
        currentPlayer={currentPlayer}
        playerA={playerA}
        playerB={playerB}
        gridConfig={gridConfig}
        onSwitchTurn={switchTurn}
        onResetGame={resetGame}
      />

      <div className="grid lg:grid-cols-[1fr_2px_1fr] gap-16 relative">
        <PlayerGrid
          player={playerA}
          onToggleLogo={togglePlayerALogo}
          gridConfig={gridConfig}
        />
        <div className="bg-gray-300 border-1" />
        <PlayerGrid
          player={playerB}
          onToggleLogo={togglePlayerBLogo}
          gridConfig={gridConfig}
        />
      </div>

      <GameInstructions />
    </div>
  )
}
