import type { Draft } from 'immer';
import type { PairSelectionConfig } from './pair-selector';
import type {
  AddHotseatPlayerAction,
  GuessHigherAction,
  RemoveHotseatPlayerAction,
  StatClashErrorAction,
  StatClashGameState,
  StatItemsFetchedAction,
} from './schema';
import { buildRound, selectPair } from './pair-selector';
import { getNextPlayer, isGameComplete } from './turn-manager';

export function startGame(
  draft: Draft<StatClashGameState>,
  payload: any,
): void {
  draft.settings = payload as any;
  draft.phase = 'playing';
  draft.error = null;
  for (const player of Object.values(draft.players)) {
    player.streak = 0;
    player.roundsPlayed = 0;
  }

  if (draft.turnState && draft.turnState.playerOrder.length > 0) {
    draft.turnState.currentPlayerId = draft.turnState.playerOrder[0];
    draft.turnState.currentPlayerIndex = 0;
  }

  draft.availableItems = [];
  draft.usedItemIds = [];
  draft.recentRounds = [];
}

export function handleStatItemsFetched(
  draft: Draft<StatClashGameState>,
  payload: StatItemsFetchedAction['payload'],
): void {
  if (payload.error) {
    draft.error = {
      message: payload.error,
      canRetry: true,
    };
    return;
  }

  draft.availableItems = payload.items as any;
  draft.error = null;

  const currentSettings = draft.settings as any;
  const pairConfig: PairSelectionConfig = {
    category: currentSettings.category,
    metricType: currentSettings.metricType,
    difficulty: currentSettings.difficulty,
    streak: 0,
    excludeIds: draft.usedItemIds,
  };

  const pair = selectPair(draft.availableItems as any, pairConfig);
  if (pair) {
    draft.currentRound = buildRound(pair);
  }
  else {
    draft.phase = 'results';
    draft.currentRound = null;
  }
}

export function guessHigher(
  draft: Draft<StatClashGameState>,
  payload: GuessHigherAction['payload'],
): void {
  const { playerId, direction } = payload;
  const player = draft.players[playerId];

  if (!player || !draft.currentRound)
    return;

  const correct = direction === draft.currentRound.higherSide;
  const currentSettings = draft.settings as any;

  draft.currentRound.revealed = true;

  draft.recentRounds.push({
    leftItemName: draft.currentRound.leftItem.name,
    rightItemName: draft.currentRound.rightItem.name,
    guessedDirection: direction,
    correctDirection: draft.currentRound.higherSide,
    wasCorrect: correct,
  });

  draft.usedItemIds.push(draft.currentRound.leftItem.id);
  draft.usedItemIds.push(draft.currentRound.rightItem.id);
  player.roundsPlayed += 1;

  if (correct) {
    handleCorrectGuess(draft, playerId, currentSettings);
  }
  else {
    handleWrongGuess(draft, playerId, currentSettings);
  }
}

function handleCorrectGuess(
  draft: Draft<StatClashGameState>,
  playerId: string,
  currentSettings: any,
): void {
  const player = draft.players[playerId];
  if (!player)
    return;

  player.streak += 1;
  player.score += calculatePoints(player.streak, currentSettings.difficulty);

  const pairConfig: PairSelectionConfig = {
    category: currentSettings.category,
    metricType: currentSettings.metricType,
    difficulty: currentSettings.difficulty,
    streak: player.streak,
    excludeIds: draft.usedItemIds,
  };

  const nextPair = selectPair(draft.availableItems as any, pairConfig);

  if (draft.settings.mode !== 'solo') {
    const playerOrder = draft.turnState?.playerOrder || [];
    const nextPlayerId = getNextPlayer(playerOrder, playerId);

    if (isGameComplete(draft.settings.roundsPerPlayer, draft.players)) {
      draft.phase = 'results';
      draft.currentRound = null;
      return;
    }

    if (draft.turnState && nextPlayerId) {
      draft.turnState.currentPlayerId = nextPlayerId;
    }
  }

  if (nextPair) {
    draft.currentRound = buildRound(nextPair);
  }
  else {
    draft.phase = 'results';
    draft.currentRound = null;
  }
}

function handleWrongGuess(
  draft: Draft<StatClashGameState>,
  playerId: string,
  currentSettings: any,
): void {
  const player = draft.players[playerId];
  if (!player)
    return;

  player.streak = 0;

  if (draft.settings.mode === 'solo') {
    draft.phase = 'results';
    draft.currentRound = null;
    return;
  }

  const playerOrder = draft.turnState?.playerOrder || [];
  const nextPlayerId = getNextPlayer(playerOrder, playerId);

  if (isGameComplete(draft.settings.roundsPerPlayer, draft.players)) {
    draft.phase = 'results';
    draft.currentRound = null;
    return;
  }

  if (draft.turnState && nextPlayerId) {
    draft.turnState.currentPlayerId = nextPlayerId;
  }

  const nextPlayer = nextPlayerId ? draft.players[nextPlayerId] : null;
  const pairConfig: PairSelectionConfig = {
    category: currentSettings.category,
    metricType: currentSettings.metricType,
    difficulty: currentSettings.difficulty,
    streak: nextPlayer?.streak ?? 0,
    excludeIds: draft.usedItemIds,
  };

  const nextPair = selectPair(draft.availableItems as any, pairConfig);
  if (nextPair) {
    draft.currentRound = buildRound(nextPair);
  }
  else {
    draft.phase = 'results';
    draft.currentRound = null;
  }
}

export function setError(
  draft: Draft<StatClashGameState>,
  payload: StatClashErrorAction['payload'],
): void {
  draft.error = payload;
}

export function addHotseatPlayer(
  draft: Draft<StatClashGameState>,
  payload: AddHotseatPlayerAction['payload'],
): void {
  const playerId = `player-${Date.now()}`;
  draft.players[playerId] = {
    id: playerId,
    name: payload.name,
    score: 0,
    streak: 0,
    roundsPlayed: 0,
    isHost: false,
    isReady: false,
  };
  if (draft.turnState) {
    draft.turnState.playerOrder.push(playerId);
  }
}

export function removeHotseatPlayer(
  draft: Draft<StatClashGameState>,
  payload: RemoveHotseatPlayerAction['payload'],
): void {
  if (draft.turnState) {
    const playerIndex = draft.turnState.playerOrder.indexOf(payload.playerId);
    if (playerIndex !== -1) {
      draft.turnState.playerOrder.splice(playerIndex, 1);
    }
  }
  delete draft.players[payload.playerId];
  if (draft.turnState && draft.turnState.currentPlayerId === payload.playerId) {
    draft.turnState.currentPlayerId = draft.turnState.playerOrder?.[0] ?? null;
  }
}

function calculatePoints(streak: number, difficulty: 'easy' | 'medium' | 'hard'): number {
  const basePoints = difficulty === 'hard' ? 10 : difficulty === 'medium' ? 5 : 3;
  return basePoints + (streak > 5 ? 5 : 0);
}
