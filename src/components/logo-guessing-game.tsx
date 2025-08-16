'use client'

import type { LogoItem, LogoSetKey } from '@/lib/logo-data'
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
  const [playerALogos, setPlayerALogos] = useState<LogoItem[]>([])
  const [playerBLogos, setPlayerBLogos] = useState<LogoItem[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState<'A' | 'B'>('A')
  const [playerAWinner, setPlayerAWinner] = useState<LogoItem | null>(null)
  const [playerBWinner, setPlayerBWinner] = useState<LogoItem | null>(null)

  const gridConfig = getGridConfiguration(selectedGrid)
  const logoNames = logoSets[selectedSet].slice(0, gridConfig.totalLogos)
  const { data: fetchedLogos } = useLogoQuery(logoNames, selectedSet, !gameStarted)

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

  const initializeGame = () => {
    if (fetchedLogos) {
      // Convert fetched logos to LogoItem format with proper structure
      const initialLogos: LogoItem[] = fetchedLogos.map((fetchedLogo, index) => ({
        id: index + 1,
        name: fetchedLogo.name,
        imageUrl: fetchedLogo.imageUrl,
        eliminated: false,
      }))

      setPlayerALogos([...initialLogos])
      setPlayerBLogos([...initialLogos])
      setGameStarted(true)
      setCurrentPlayer('A')
      setPlayerAWinner(null)
      setPlayerBWinner(null)
    }
  }

  const resetGame = () => {
    setPlayerALogos([])
    setPlayerBLogos([])
    setGameStarted(false)
    setCurrentPlayer('A')
    setPlayerAWinner(null)
    setPlayerBWinner(null)
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

  const getActiveLogos = (logos: LogoItem[]) => logos.filter(logo => !logo.eliminated).length

  if (!gameStarted) {
    return (
      <GameSetup
        selectedSet={selectedSet}
        onSetChange={setSelectedSet}
        selectedGrid={selectedGrid}
        onGridChange={setSelectedGrid}
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
        playerAWinner={playerAWinner}
        playerBWinner={playerBWinner}
        playerAActive={getActiveLogos(playerALogos)}
        playerBActive={getActiveLogos(playerBLogos)}
        gridConfig={gridConfig}
        onSwitchTurn={switchTurn}
        onResetGame={resetGame}
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <PlayerGrid
          player="A"
          logos={playerALogos}
          winner={playerAWinner}
          onToggleLogo={togglePlayerALogo}
          gridConfig={gridConfig}
          logoSet={selectedSet}
        />
        <PlayerGrid
          player="B"
          logos={playerBLogos}
          winner={playerBWinner}
          onToggleLogo={togglePlayerBLogo}
          gridConfig={gridConfig}
          logoSet={selectedSet}
        />
      </div>

      <GameInstructions />
    </div>
  )
}
