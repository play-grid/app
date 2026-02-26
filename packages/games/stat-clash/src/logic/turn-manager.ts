import { getPlayerIndex } from '@guess-logo/game-core';

export function getNextPlayer(
  playerOrder: string[],
  currentPlayerId: string,
): string | null {
  if (playerOrder.length === 0)
    return null;

  const currentIndex = getPlayerIndex(playerOrder, currentPlayerId);
  if (currentIndex === -1)
    return playerOrder[0];

  const nextIndex = (currentIndex + 1) % playerOrder.length;
  return playerOrder[nextIndex];
}

export function isGameComplete(
  roundsPerPlayer: number,
  players: Record<string, { roundsPlayed?: number }>,
): boolean {
  const playerIds = Object.keys(players);

  if (playerIds.length === 0)
    return false;

  return playerIds.every(
    playerId => (players[playerId].roundsPlayed ?? 0) >= roundsPerPlayer,
  );
}
