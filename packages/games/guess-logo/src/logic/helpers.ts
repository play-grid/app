import type { CompanyLogo, CountryLogo, LogoContent, MoviePosterLogo, SportsLogo } from '../base.schema';
import type { GuessLogoGameState, GuessLogoPlayerMetadata } from './schema';

export function getPlayerMetadata(
  state: GuessLogoGameState,
  playerId: string,
): GuessLogoPlayerMetadata {
  const player = state.players[playerId];
  if (!player) {
    throw new Error(`Player ${playerId} not found`);
  }

  if (!player.metadata) {
    player.metadata = { eliminatedLogoIds: [] };
  }

  return player.metadata as GuessLogoPlayerMetadata;
}

export function getPlayerActiveLogos(
  state: GuessLogoGameState,
  playerId: string,
): LogoContent[] {
  const metadata = getPlayerMetadata(state, playerId);
  return state.logos.filter((logo: { id: number }) => !metadata.eliminatedLogoIds.includes(logo.id));
}

export function getPlayerSecretLogo(
  state: GuessLogoGameState,
  playerId: string,
): LogoContent | null {
  const metadata = getPlayerMetadata(state, playerId);
  if (!metadata.secretLogoId)
    return null;

  return state.logos.find((logo: { id: number | undefined }) => logo.id === metadata.secretLogoId) ?? null;
}

// Type guard helpers
export function isCountryLogo(logo: LogoContent): logo is CountryLogo {
  return logo.type === 'country';
}

export function isSportsLogo(logo: LogoContent): logo is SportsLogo {
  return logo.type === 'sports';
}

export function isMovieLogo(logo: LogoContent): logo is MoviePosterLogo {
  return logo.type === 'movie';
}

export function isCompanyLogo(logo: LogoContent): logo is CompanyLogo {
  return logo.type === 'company';
}
