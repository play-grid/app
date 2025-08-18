import type { LogoSetKey } from '@/lib/logo-data'
import type { Player } from '@/types'

interface GameState {
  playerA: Player
  playerB: Player
  currentPlayer: 'A' | 'B'
  selectedSet: LogoSetKey
  selectedGrid: string
  gameStarted: boolean
  gameInitialized: boolean
  timestamp: number
}

const STORAGE_KEY = 'logo-guessing-game-state'
const MAX_STORAGE_AGE = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined')
      return false
    const test = '__test__'
    window.localStorage.setItem(test, test)
    window.localStorage.removeItem(test)
    return true
  }
  catch {
    return false
  }
}

function isValidGameState(state: any): state is GameState {
  return (
    state
    && typeof state === 'object'
    && state.playerA
    && typeof state.playerA.name === 'string'
    && Array.isArray(state.playerA.logos)
    && state.playerB
    && typeof state.playerB.name === 'string'
    && Array.isArray(state.playerB.logos)
    && (state.currentPlayer === 'A' || state.currentPlayer === 'B')
    && typeof state.selectedSet === 'string'
    && typeof state.selectedGrid === 'string'
    && typeof state.gameStarted === 'boolean'
    && typeof state.gameInitialized === 'boolean'
    && typeof state.timestamp === 'number'
  )
}

export function useGamePersistence() {
  const saveGameState = (gameState: Omit<GameState, 'timestamp'>) => {
    if (!isLocalStorageAvailable())
      return
    try {
      const stateWithTimestamp: GameState = {
        ...gameState,
        timestamp: Date.now(),
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithTimestamp))
    }
    catch {}
  }

  const loadGameState = (): GameState | null => {
    if (!isLocalStorageAvailable())
      return null
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (!saved)
        return null

      const gameState = JSON.parse(saved)
      if (!isValidGameState(gameState)) {
        window.localStorage.removeItem(STORAGE_KEY)
        return null
      }

      const age = Date.now() - gameState.timestamp
      if (age > MAX_STORAGE_AGE) {
        window.localStorage.removeItem(STORAGE_KEY)
        return null
      }

      if (gameState.playerA.logos.length === 0 || gameState.playerB.logos.length === 0) {
        window.localStorage.removeItem(STORAGE_KEY)
        return null
      }

      return gameState
    }
    catch {
      if (isLocalStorageAvailable()) {
        window.localStorage.removeItem(STORAGE_KEY)
      }
      return null
    }
  }

  const clearGameState = () => {
    if (!isLocalStorageAvailable())
      return
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    catch {}
  }

  const hasValidSavedGame = (): boolean => {
    try {
      const saved = loadGameState()
      return (
        saved !== null
        && saved.gameStarted
        && saved.playerA?.logos?.length > 0
        && saved.playerB?.logos?.length > 0
      )
    }
    catch {
      return false
    }
  }

  return {
    saveGameState,
    loadGameState,
    clearGameState,
    hasValidSavedGame,
  }
}
