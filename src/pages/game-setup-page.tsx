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

  const handleStartGame = () => {
    // Navigate to game page with selected parameters
    setLocation(`/game/${selectedSet}/${selectedGrid}`)
  }

  return (
    <GameSetup
      selectedSet={selectedSet}
      onSetChange={setSelectedSet}
      selectedGrid={selectedGrid}
      onGridChange={setSelectedGrid}
      onStartGame={handleStartGame}
    />
  )
}
