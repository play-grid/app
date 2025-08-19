import type { LogoSetKey } from '@/lib/logo-data'
import type { LogoItem, Player } from '@/types'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useRoute } from 'wouter'
import { GameHeader } from '@/components/game-header'
import { GameInstructions } from '@/components/game-instructions'
import { PlayerGrid } from '@/components/player-grid'
import { Button } from '@/components/ui/button'
import { useGamePersistence } from '@/hooks/use-game-persistence'
import { useLogoQuery } from '@/hooks/use-logo-query'
import { getGridConfiguration } from '@/lib/grid-configurations'
import { logoSets } from '@/lib/logo-data'

export function GamePlayPage() {
  const [, setLocation] = useLocation()
  const [match, params] = useRoute('/game/:logoSet/:gridSize/:playerA/:playerB')
  const { saveGameState, loadGameState, clearGameState } = useGamePersistence()
  const { t } = useTranslation()

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
  const [gameStarted, setGameStarted] = useState(true)
  const [loadAttempted, setLoadAttempted] = useState(false)

  // Use refs to prevent infinite saving
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastSaveStateRef = useRef<string>('')

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

  // Load saved game state ONCE on mount
  useEffect(() => {
    if (loadAttempted)
      return

    const savedState = loadGameState()
    if (
      savedState
      && savedState.selectedSet === logoSet
      && savedState.selectedGrid === gridSize
      && savedState.playerA.name === playerAName
      && savedState.playerB.name === playerBName
    ) {
      // Restore saved state
      setPlayerA(savedState.playerA)
      setPlayerB(savedState.playerB)
      setCurrentPlayer(savedState.currentPlayer)
      setGameInitialized(savedState.gameInitialized)
      setGameStarted(savedState.gameStarted)
    }
    setLoadAttempted(true)
  }, [logoSet, gridSize, playerAName, playerBName, loadGameState, loadAttempted])

  // Initialize game when logos are loaded (only if not loaded from save)
  useEffect(() => {
    if (fetchedLogos && !gameInitialized && loadAttempted && playerA.logos.length === 0) {
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
  }, [fetchedLogos, gameInitialized, loadAttempted, playerA.logos.length])

  // Update player stats when their logos change
  useEffect(() => {
    if (playerA.logos.length > 0) {
      const stats = calculatePlayerStats(playerA.logos)
      setPlayerA(prev => ({
        ...prev,
        ...stats,
      }))
    }
  }, [playerA.logos])

  useEffect(() => {
    if (playerB.logos.length > 0) {
      const stats = calculatePlayerStats(playerB.logos)
      setPlayerB(prev => ({
        ...prev,
        ...stats,
      }))
    }
  }, [playerB.logos])

  // Save game state with proper debouncing
  useEffect(() => {
    if (!gameInitialized || !gameStarted || !loadAttempted || playerA.logos.length === 0) {
      return
    }

    const gameState = {
      playerA,
      playerB,
      currentPlayer,
      selectedSet: logoSet,
      selectedGrid: gridSize,
      gameStarted,
      gameInitialized,
    }

    // Create a hash of the current state to compare
    const currentStateHash = JSON.stringify({
      playerAEliminated: playerA.logos.map(l => ({ id: l.id, eliminated: l.eliminated })),
      playerBEliminated: playerB.logos.map(l => ({ id: l.id, eliminated: l.eliminated })),
      currentPlayer,
      gameStarted,
      gameInitialized,
    })

    // Only save if state has actually changed
    if (currentStateHash !== lastSaveStateRef.current) {
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      // Debounce the save operation
      saveTimeoutRef.current = setTimeout(() => {
        saveGameState(gameState)
        lastSaveStateRef.current = currentStateHash
      }, 1000)
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [
    playerA,
    playerB,
    currentPlayer,
    logoSet,
    gridSize,
    gameStarted,
    gameInitialized,
    loadAttempted,
    saveGameState,
  ])

  // Early returns after all hooks
  if (!match || !logoSets[logoSet]) {
    setLocation('/')
    return null
  }

  const togglePlayerALogo = (logoId: number) => {
    setPlayerA((prev) => {
      const newLogos = prev.logos.map(logo =>
        logo.id === logoId ? { ...logo, eliminated: !logo.eliminated } : logo,
      )
      return {
        ...prev,
        logos: newLogos,
      }
    })
  }

  const togglePlayerBLogo = (logoId: number) => {
    setPlayerB((prev) => {
      const newLogos = prev.logos.map(logo =>
        logo.id === logoId ? { ...logo, eliminated: !logo.eliminated } : logo,
      )
      return {
        ...prev,
        logos: newLogos,
      }
    })
  }

  const switchTurn = () => {
    setCurrentPlayer(prev => (prev === 'A' ? 'B' : 'A'))
  }

  const resetGame = () => {
    clearGameState()
    setLocation('/')
  }

  const startNewGame = () => {
    clearGameState()
    setLocation(`/game/${logoSet}/${gridSize}/${encodeURIComponent(playerAName)}/${encodeURIComponent(playerBName)}`)

    // Reset local state
    setGameInitialized(false)
    setLoadAttempted(false)
    setCurrentPlayer('A')
    setPlayerA(prev => ({ ...prev, logos: [], winner: null, activeCount: 0 }))
    setPlayerB(prev => ({ ...prev, logos: [], winner: null, activeCount: 0 }))
  }

  // Show loading state
  if (isLoading || !gameInitialized || !loadAttempted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">
            {t('loading-game-for')}
            {playerA.name}
            vs
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
          <p className="text-lg text-red-500 mb-4">{t('failed-to-load-logos')}</p>
          <Button onClick={resetGame} className="px-4 py-2 bg-primary text-white rounded-md">
            {t('back-to-setup')}
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
        onStartNewGame={startNewGame}
      />

      <div className="grid lg:grid-cols-[1fr_2px_1fr] gap-16 relative">
        <PlayerGrid player={playerA} onToggleLogo={togglePlayerALogo} gridConfig={gridConfig} />
        <div className="bg-gray-300 border-1" />
        <PlayerGrid player={playerB} onToggleLogo={togglePlayerBLogo} gridConfig={gridConfig} />
      </div>

      <GameInstructions />
    </div>
  )
}
