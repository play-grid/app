// import type { LogoSetKey } from '../../lib/logo-data';
// import { useEffect, useRef } from 'react';
// import { devLog } from '@/utils/logger';
// import { useGameStore } from '../../stores/game-state-store';
// import { useUIStore } from '../../stores/ui-state-store';

// export interface GameRoomPersistenceConfig {
//   logoSet: LogoSetKey;
//   gridSize: string;
//   playerAName: string;
//   playerBName: string;
//   enabled: boolean;
// }

// export function useGameRoomPersistence(config: GameRoomPersistenceConfig) {
//   const {
//     playerA,
//     playerB,
//     currentPlayer,
//     gameInitialized,
//     selectedList,
//     gameStarted,
//   } = useGameStore();

//   const {
//     saveGameState,
//     loadGameState,
//     clearGameState,
//     lastSaveHash,
//     updateLastSaveHash,
//   } = usePersistenceStore();

//   const {
//     loadAttempted,
//     setLoadAttempted,
//   } = useUIStore();

//   // Use ref to prevent infinite saving
//   const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

//   // Load saved game state ONCE on mount
//   useEffect(() => {
//     if (!config.enabled || loadAttempted) {
//       return;
//     }

//     const savedState = loadGameState();
//     if (
//       savedState
//       && savedState.selectedSet === config.logoSet
//       && savedState.selectedGrid === config.gridSize
//       && savedState.playerA.name === config.playerAName
//       && savedState.playerB.name === config.playerBName
//     ) {
//       // Restore saved state to Zustand store
//       // This will automatically update the UI through the store
//       devLog('Restoring saved game state');
//       // Note: We would need additional actions in the store to restore full state
//       // For now, we'll let the game initialize normally
//     }
//     setLoadAttempted(true);
//   }, [
//     config.enabled,
//     config.logoSet,
//     config.gridSize,
//     config.playerAName,
//     config.playerBName,
//     loadGameState,
//     loadAttempted,
//     setLoadAttempted,
//   ]);

//   // Save game state with proper debouncing
//   useEffect(() => {
//     if (!config.enabled || !gameInitialized || !gameStarted || !loadAttempted || playerA.logos.length === 0) {
//       return;
//     }

//     const gameState = {
//       playerA,
//       playerB,
//       currentPlayer,
//       selectedSet: config.logoSet,
//       selectedList, // Add this line
//       selectedGrid: config.gridSize,
//       gameStarted,
//       gameInitialized,
//     };

//     // Create a hash of the current state to compare
//     const currentStateHash = JSON.stringify({
//       playerAEliminated: playerA.logos.map(l => ({ id: l.id, eliminated: l.eliminated })),
//       playerBEliminated: playerB.logos.map(l => ({ id: l.id, eliminated: l.eliminated })),
//       currentPlayer,
//       selectedList,
//       gameStarted,
//       gameInitialized,
//     });
//     // Only save if state has actually changed
//     if (currentStateHash !== lastSaveHash) {
//       // Clear any existing timeout
//       if (saveTimeoutRef.current) {
//         clearTimeout(saveTimeoutRef.current);
//       }

//       // Debounce the save operation
//       saveTimeoutRef.current = setTimeout(() => {
//         saveGameState(gameState);
//         updateLastSaveHash(currentStateHash);
//       }, 1000);
//     }

//     return () => {
//       if (saveTimeoutRef.current) {
//         clearTimeout(saveTimeoutRef.current);
//       }
//     };
//   }, [
//     config.enabled,
//     playerA,
//     playerB,
//     currentPlayer,
//     config.logoSet,
//     config.gridSize,
//     gameStarted,
//     gameInitialized,
//     loadAttempted,
//     saveGameState,
//     lastSaveHash,
//     updateLastSaveHash,
//     selectedList, // Add this line
//   ]);

//   const handleClearGameState = () => {
//     if (saveTimeoutRef.current) {
//       clearTimeout(saveTimeoutRef.current);
//     }
//     clearGameState();
//   };

//   return {
//     loadAttempted,
//     clearGameState: handleClearGameState,
//   };
// }
