import type { LogoItem, LogoSetKey } from '@/lib/logo-data'
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
  const [playerALogos, setPlayerALogos] = useState<LogoItem[]>([])
  const [playerBLogos, setPlayerBLogos] = useState<LogoItem[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<'A' | 'B'>('A')
  const [playerAWinner, setPlayerAWinner] = useState<LogoItem | null>(null)
  const [playerBWinner, setPlayerBWinner] = useState<LogoItem | null>(null)
  const [gameInitialized, setGameInitialized] = useState(false)

  // Get configuration
  const gridConfig = getGridConfiguration(gridSize)
  const logoNames = logoSets[logoSet]?.slice(0, gridConfig.totalLogos) || []

  // Fetch logos
  const { data: fetchedLogos, isLoading, error } = useLogoQuery(logoNames, logoSet, true)

  // Initialize game when logos are loaded
  useEffect(() => {
    if (fetchedLogos && !gameInitialized) {
      const initialLogos: LogoItem[] = fetchedLogos.map((fetchedLogo, index) => ({
        id: index + 1,
        name: fetchedLogo.name,
        imageUrl: fetchedLogo.imageUrl,
        eliminated: false,
      }))

      setPlayerALogos([...initialLogos])
      setPlayerBLogos([...initialLogos])
      setGameInitialized(true)
    }
  }, [fetchedLogos, gameInitialized])

  // Check for winners
  useEffect(() => {
    const activePlayerALogos = playerALogos.filter(logo => !logo.eliminated)
    const activePlayerBLogos = playerBLogos.filter(logo => !logo.eliminated)

    if (activePlayerALogos.length === 1 && playerALogos.length > 0) {
      setPlayerAWinner(activePlayerALogos[0])
    }
    else {
      setPlayerAWinner(null)
    }

    if (activePlayerBLogos.length === 1 && playerBLogos.length > 0) {
      setPlayerBWinner(activePlayerBLogos[0])
    }
    else {
      setPlayerBWinner(null)
    }
  }, [playerALogos, playerBLogos])

  // Redirect to setup if invalid params
  if (!match || !logoSets[logoSet]) {
    setLocation('/')
    return null
  }

  const togglePlayerALogo = (logoId: number) => {
    setPlayerALogos(prev =>
      prev.map(logo => (logo.id === logoId ? { ...logo, eliminated: !logo.eliminated } : logo)),
    )
  }

  const togglePlayerBLogo = (logoId: number) => {
    setPlayerBLogos(prev =>
      prev.map(logo => (logo.id === logoId ? { ...logo, eliminated: !logo.eliminated } : logo)),
    )
  }

  const switchTurn = () => {
    setCurrentPlayer(prev => (prev === 'A' ? 'B' : 'A'))
  }

  const resetGame = () => {
    setLocation('/')
  }

  const getActiveLogos = (logos: LogoItem[]) => logos.filter(logo => !logo.eliminated).length

  // Show loading state
  if (isLoading || !gameInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">
            Loading game for
            {playerAName}
            vs
            {playerBName}
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
      {/* TODO : remove the all player shit and replace it in one object player prop */}
      <GameHeader
        selectedSet={logoSet}
        currentPlayer={currentPlayer}
        playerAWinner={playerAWinner}
        playerBWinner={playerBWinner}
        playerAActive={getActiveLogos(playerALogos)}
        playerBActive={getActiveLogos(playerBLogos)}
        playerAName={playerAName}
        playerBName={playerBName}
        gridConfig={gridConfig}
        onSwitchTurn={switchTurn}
        onResetGame={resetGame}
      />

      <div className="grid lg:grid-cols-2 divide-x divide-black gap-16">
        <PlayerGrid
          player="A"
          playerName={playerAName}
          logos={playerALogos}
          winner={playerAWinner}
          onToggleLogo={togglePlayerALogo}
          gridConfig={gridConfig}
          logoSet={logoSet}
        />
        <PlayerGrid
          player="B"
          playerName={playerBName}
          logos={playerBLogos}
          winner={playerBWinner}
          onToggleLogo={togglePlayerBLogo}
          gridConfig={gridConfig}
          logoSet={logoSet}
        />
      </div>

      <GameInstructions />
    </div>
  )
}
