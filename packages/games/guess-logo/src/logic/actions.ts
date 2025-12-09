import type { Draft } from 'immer';
import type { LogoContent } from '../base.schema';
import type {
  GuessLogoGameState,
} from './schema';
import { getPlayerMetadata } from './helpers';

export function loadContent(
  draft: Draft<GuessLogoGameState>,
  payload: { logos: LogoContent[] },
): void {
  draft.logos = payload.logos;
  draft.isContentLoaded = true;

  Object.keys(draft.players).forEach((playerId) => {
    const metadata = getPlayerMetadata(draft, playerId);
    metadata.eliminatedLogoIds = [];
  });
}

export function eliminateLogo(
  draft: Draft<GuessLogoGameState>,
  payload: { playerId: string; logoId: number },
): void {
  const metadata = getPlayerMetadata(draft, payload.playerId);

  if (!metadata.eliminatedLogoIds.includes(payload.logoId)) {
    metadata.eliminatedLogoIds.push(payload.logoId);
  }
}

export function restoreLogo(
  draft: Draft<GuessLogoGameState>,
  payload: { playerId: string; logoId: number },
): void {
  const metadata = getPlayerMetadata(draft, payload.playerId);

  metadata.eliminatedLogoIds = metadata.eliminatedLogoIds.filter(
    id => id !== payload.logoId,
  );
}

export function checkWinner(
  draft: Draft<GuessLogoGameState>,
  payload: { playerId: string },
): void {
  const player = draft.players[payload.playerId];
  if (!player)
    return;

  const metadata = getPlayerMetadata(draft, payload.playerId);

  const activeLogos = draft.logos.filter(
    logo => !metadata.eliminatedLogoIds.includes(logo.id),
  );

  if (activeLogos.length === 1 && draft.logos.length > 0) {
    player.score += 1;
    draft.phase = 'results';
  }
}

export function shuffleLogos(
  draft: Draft<GuessLogoGameState>,
  payload: { logos: LogoContent[] },
): void {
  draft.logos = payload.logos;

  Object.keys(draft.players).forEach((playerId) => {
    const metadata = getPlayerMetadata(draft, playerId);
    metadata.eliminatedLogoIds = [];
  });

  draft.phase = 'playing';
}
