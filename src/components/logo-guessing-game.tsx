import type { LogoSetKey } from '@/lib/logo-data'
import type { LogoItem, Player } from '@/types'
import { useEffect, useState } from 'react'
import { useLogoQuery } from '@/hooks/use-logo-query'
import { getGridConfiguration } from '@/lib/grid-configurations'
import { logoSets } from '@/lib/logo-data'
import { GameHeader } from './game-header'
import { GameInstructions } from './game-instructions'
import { GameSetup } from './game-setup'
import { PlayerGrid } from './player-grid'

export function LogoGuessingGame() {
  const [selectedSet, setSelectedSet] = useState<LogoSetKey>('companies')
  const [selectedGrid, setSelectedGrid] = useState<string>('8x6')
  const [gameStarted, setGameStarted] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState<'A' | 'B'>('A')

  // Refactored player state using Player objects
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

  const gridConfig = getGridConfiguration(selectedGrid)
  const logoNames = logoSets[selectedSet].slice(0, gridConfig.totalLogos)
  const { data: fetchedLogos } = useLogoQuery(logoNames, selectedSet, !gameStarted)

  // Helper function to calculate player stats
  const calculatePlayerStats = (logos: LogoItem[]) => {
    const activeLogos = logos.filter(logo => !logo.eliminated)
    return {
      activeCount: activeLogos.length,
      winner: activeLogos.length === 1 && logos.length > 0 ? activeLogos[0] : null,
    }
  }

  // Update player stats when logos change
  useEffect(() => {
    const playerAStats = calculatePlayerStats(playerA.logos)
    setPlayerA(prev => ({ ...prev, ...playerAStats }))
  }, [playerA.logos])

  useEffect(() => {
    const playerBStats = calculatePlayerStats(playerB.logos)
    setPlayerB(prev => ({ ...prev, ...playerBStats }))
  }, [playerB.logos])

  const initializeGame = () => {
    if (fetchedLogos) {
      // Convert fetched logos to LogoItem format with proper structure
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

      setGameStarted(true)
      setCurrentPlayer('A')
    }
  }

  const resetGame = () => {
    setPlayerA(prev => ({
      ...prev,
      logos: [],
      winner: null,
      activeCount: 0,
    }))

    setPlayerB(prev => ({
      ...prev,
      logos: [],
      winner: null,
      activeCount: 0,
    }))

    setGameStarted(false)
    setCurrentPlayer('A')
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

  const handlePlayerANameChange = (name: string) => {
    setPlayerA(prev => ({ ...prev, name }))
  }

  const handlePlayerBNameChange = (name: string) => {
    setPlayerB(prev => ({ ...prev, name }))
  }

  if (!gameStarted) {
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
        onStartGame={initializeGame}
        canStart={!!fetchedLogos}
      />
    )
  }

  return (
    <div className="min-h-screen p-4">
      <GameHeader
        selectedSet={selectedSet}
        currentPlayer={currentPlayer}
        playerA={playerA}
        playerB={playerB}
        gridConfig={gridConfig}
        onSwitchTurn={switchTurn}
        onResetGame={resetGame}
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <PlayerGrid
          player={playerA}
          onToggleLogo={togglePlayerALogo}
          gridConfig={gridConfig}
        />
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
