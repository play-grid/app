export type PathKey = 'player' | 'creator';

export interface Feature {
  icon: string;
  nameKey: string;
  descKey: string;
}

export interface GameMode {
  num: string;
  icon: string;
  titleKey: string;
  descKey: string;
  tagKey: string;
}

export interface PathData {
  key: PathKey;
  pathBarLabelKey: string;
  ctaGhostWordKey: string;
  ctaTitleKey: string;
  featTagKey: string;
  featTitleKey: string;
  featuresKey: string;
  showModes: boolean;
  showBA: boolean;
}

export const GAME_MODE_KEYS = ['0', '1', '2', '3'] as const;

export const CREATOR_STEP_KEYS = ['0', '1', '2'] as const;

export const PATHS: Record<PathKey, PathData> = {
  player: {
    key: 'player',
    pathBarLabelKey: 'landing.pathBar.player',
    ctaGhostWordKey: 'landing.cta.playerTitle',
    ctaTitleKey: 'landing.cta.playerTitle',
    featTagKey: 'landing.features.player.featTag',
    featTitleKey: 'landing.features.player.featTitle',
    featuresKey: 'landing.features.player.features',
    showModes: true,
    showBA: false,
  },
  creator: {
    key: 'creator',
    pathBarLabelKey: 'landing.pathBar.creator',
    ctaGhostWordKey: 'landing.cta.joinWaitlist',
    ctaTitleKey: 'landing.cta.creatorTitle',
    featTagKey: 'landing.features.creator.featTag',
    featTitleKey: 'landing.features.creator.featTitle',
    featuresKey: 'landing.features.creator.features',
    showModes: false,
    showBA: true,
  },
};

export const MARQUEE_KEY = 'landing.marquee.items';

export const STATS_KEYS = [
  'landing.stats.setupTime',
  'landing.stats.clickToJoin',
  'landing.stats.sessions',
  'landing.stats.arabicFirst',
] as const;

export const GAME_MODE_STATS = [
  { num: '0', unit: 'ms' },
  { num: '1', unit: '×' },
  { num: '∞', unit: '' },
  { num: '100', unit: '%' },
];
