// pages/GameSetupPage.tsx
'use client'

import type { LogoSetKey } from '@/lib/logo-data'
import { useState } from 'react'
import { useLocation } from 'wouter'
import { GameSetup } from '@/components/game-setup'

export function GameSetupPage() {
  const [, setLocation] = useLocation()
  const [selectedSet, setSelectedSet] = useState<LogoSetKey>('companies')
  const [selectedGrid, setSelectedGrid] = useState<string>('8x6')
  const [playerAName, setPlayerAName] = useState<string>('Player A')
  const [playerBName, setPlayerBName] = useState<string>('Player B')

  const handleStartGame = () => {
    // Encode player names for URL safety
    const encodedPlayerA = encodeURIComponent(playerAName.trim() || 'Player A')
    const encodedPlayerB = encodeURIComponent(playerBName.trim() || 'Player B')

    // Navigate to game page with selected parameters and player names
    setLocation(`/game/${selectedSet}/${selectedGrid}/${encodedPlayerA}/${encodedPlayerB}`)
  }

  return (
    <GameSetup
      selectedSet={selectedSet}
      onSetChange={setSelectedSet}
      selectedGrid={selectedGrid}
      onGridChange={setSelectedGrid}
      playerAName={playerAName}
      onPlayerANameChange={setPlayerAName}
      playerBName={playerBName}
      onPlayerBNameChange={setPlayerBName}
      onStartGame={handleStartGame}
    />
  )
}
