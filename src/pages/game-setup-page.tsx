import { Play, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { GameSetup } from '@/components/game-setup'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLanguageNavigation } from '@/hooks/use-language-navigation'
import { useLogoQuery } from '@/hooks/use-logo-query'
import { getGridConfiguration } from '@/lib/grid-configurations'
import { logoSets } from '@/lib/logo-data'
import { useGameStore } from '@/stores/game-state-store'
import { usePersistenceStore } from '@/stores/persistence-store'
import { useUIStore } from '@/stores/ui-state-store'

export function GameSetupPage() {
  const { navigate } = useLanguageNavigation()
  const { t } = useTranslation()

  // Zustand stores
  const {
    selectedSet,
    selectedGrid,
    playerA,
    playerB,
    setSelectedSet,
    setSelectedGrid,
    setPlayerAName,
    setPlayerBName,
    resetGame,
  } = useGameStore()

  const {
    savedGameInfo,
    loadGameState,
    clearGameState,
    hasValidSavedGame,
    setSavedGameInfo,
  } = usePersistenceStore()
  const {
    showResumeOption,
    resumeCheckComplete,
    setShowResumeOption,
    setResumeCheckComplete,
  } = useUIStore()

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
      console.error('Failed to load saved game state:', error)
    }

    setResumeCheckComplete(true)
  }, [
    hasValidSavedGame,
    loadGameState,
    resumeCheckComplete,
    setShowResumeOption,
    setSavedGameInfo,
    setResumeCheckComplete,
  ])

  // Get logos for validation
  const gridConfig = getGridConfiguration(selectedGrid)
  const logoNames = logoSets[selectedSet]?.slice(0, gridConfig.totalLogos) || []
  const { data: fetchedLogos } = useLogoQuery(logoNames, selectedSet, true)

  const handleStartGame = () => {
    const encodedPlayerA = encodeURIComponent(playerA.name.trim() || 'Player A')
    const encodedPlayerB = encodeURIComponent(playerB.name.trim() || 'Player B')

    clearGameState()
    resetGame()

    navigate(`/game/${selectedSet}/${selectedGrid}/${encodedPlayerA}/${encodedPlayerB}`)
  }

  const handleResumeGame = () => {
    if (savedGameInfo) {
      const encodedPlayerA = encodeURIComponent(savedGameInfo.playerA)
      const encodedPlayerB = encodeURIComponent(savedGameInfo.playerB)

      navigate(
        `/game/${savedGameInfo.selectedSet}/${savedGameInfo.selectedGrid}/${encodedPlayerA}/${encodedPlayerB}`,
      )
    }
  }

  const handleClearSavedGame = () => {
    clearGameState()
    setShowResumeOption(false)
    setSavedGameInfo(null)
  }

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
          onPlayerANameChange={setPlayerAName}
          onPlayerBNameChange={setPlayerBName}
          canStart={!!fetchedLogos}
          onStartGame={handleStartGame}
        />
      </div>
    </div>
  )
}
