import type { LogoSetKey } from '@/lib/logo-data'
import type { Player } from '@/types'
import { Play, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'wouter'
import { GameSetup } from '@/components/game-setup'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useGamePersistence } from '@/hooks/use-game-persistence'
import { useLogoQuery } from '@/hooks/use-logo-query'
import { getGridConfiguration } from '@/lib/grid-configurations'
import { logoSets } from '@/lib/logo-data'

interface SavedGameInfo {
  playerA: string
  playerB: string
  selectedSet: LogoSetKey
  selectedGrid: string
}

export function GameSetupPage() {
  const [, setLocation] = useLocation()
  const [selectedSet, setSelectedSet] = useState<LogoSetKey>('companies')
  const [selectedGrid, setSelectedGrid] = useState<string>('8x6')
  const [showResumeOption, setShowResumeOption] = useState(false)
  const [savedGameInfo, setSavedGameInfo] = useState<SavedGameInfo | null>(null)
  const [resumeCheckComplete, setResumeCheckComplete] = useState(false)
  const { t } = useTranslation()

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

  const { loadGameState, clearGameState, hasValidSavedGame } = useGamePersistence()

  // Check for saved game on mount - only once
  useEffect(() => {
    if (resumeCheckComplete)
      return

    try {
      if (hasValidSavedGame()) {
        const savedState = loadGameState()
        if (savedState) {
          setShowResumeOption(true)
          setSavedGameInfo({
            playerA: savedState.playerA.name,
            playerB: savedState.playerB.name,
            selectedSet: savedState.selectedSet,
            selectedGrid: savedState.selectedGrid,
          })
        }
      }
    }
    catch (error) {
      throw new Error(`Failed to load saved game state: ${error}`)
    }

    setResumeCheckComplete(true)
  }, [hasValidSavedGame, loadGameState, resumeCheckComplete])

  // Get logos for validation
  const gridConfig = getGridConfiguration(selectedGrid)
  const logoNames = logoSets[selectedSet]?.slice(0, gridConfig.totalLogos) || []
  const { data: fetchedLogos, isLoading } = useLogoQuery(logoNames, selectedSet, true)

  const handleStartGame = () => {
    const encodedPlayerA = encodeURIComponent(playerA.name.trim() || 'Player A')
    const encodedPlayerB = encodeURIComponent(playerB.name.trim() || 'Player B')

    clearGameState()

    setLocation(`/game/${selectedSet}/${selectedGrid}/${encodedPlayerA}/${encodedPlayerB}`)
  }

  const handleResumeGame = () => {
    if (savedGameInfo) {
      const encodedPlayerA = encodeURIComponent(savedGameInfo.playerA)
      const encodedPlayerB = encodeURIComponent(savedGameInfo.playerB)

      setLocation(
        `/game/${savedGameInfo.selectedSet}/${savedGameInfo.selectedGrid}/${encodedPlayerA}/${encodedPlayerB}`,
      )
    }
  }

  const handleClearSavedGame = () => {
    clearGameState()
    setShowResumeOption(false)
    setSavedGameInfo(null)
  }

  const handlePlayerANameChange = (name: string) => {
    setPlayerA(prev => ({ ...prev, name }))
  }

  const handlePlayerBNameChange = (name: string) => {
    setPlayerB(prev => ({ ...prev, name }))
  }

  const canStartGame = playerA.name.trim().length > 0
    && playerB.name.trim().length > 0
    && !!fetchedLogos
    && !isLoading

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Resume Game Option */}
        {showResumeOption && savedGameInfo && (
          <Card className="p-6 border-2 border-primary/20 bg-primary/5">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-primary">{t('resume-previous-game')}</h2>
              <p className="text-muted-foreground">
                {t('continue-your-game-with')}
                <strong>{savedGameInfo.playerA}</strong>
                {t('vs')}
                <strong>{savedGameInfo.playerB}</strong>
                <br />
                <span className="text-sm">
                  {savedGameInfo.selectedSet}

                  {t('key-1')}
                  {savedGameInfo.selectedGrid}
                </span>
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={handleResumeGame} className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  {t('resume-game')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearSavedGame}
                  className="flex items-center gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('clear-saved-game')}
                </Button>
              </div>
            </div>
          </Card>
        )}
        {/* Regular Game Setup */}
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
          canStart={canStartGame}
        />
      </div>
    </div>
  )
}
